/**
 * recurrente-webhook — recibe los eventos de Recurrente (firmados con Svix) y escribe
 * membresías (`subscriptions`) y compras (`purchases`) con la service role.
 *
 * - Firma: HMAC-SHA256 de `${svix-id}.${svix-timestamp}.${body}` con RECURRENTE_WEBHOOK_SECRET.
 * - Idempotencia: cada evento se guarda en `billing_events` con id = svix-id (el mismo en
 *   los reintentos). Si ya se procesó, se responde 200 sin repetir nada.
 * - Qué se compró, en este orden:
 *   1. metadata flare_* (checkouts creados por crear-checkout: flare_plan / flare_item_key / flare_user_id);
 *   2. producto de Recurrente → `recurrente_products` (links públicos, p. ej. entradas a eventos);
 *   3. la membresía ya registrada con ese id de suscripción;
 *   4. GET /subscriptions/{id} en Recurrente (la metadata del checkout persiste en la suscripción).
 * - A quién: flare_user_id, o la cuenta con ese correo SOLO si el correo está confirmado.
 *   Si no hay cuenta, la fila queda con el correo y se enlaza al confirmar (link_billing_to_user).
 * - Recurrente manda cada pago dos veces (intent.* y payment_intent.* legacy): todo lo que se
 *   escribe es idempotente (una compra por checkout, estados que no retroceden).
 * - Respuesta: 200 aunque el evento no nos importe o no se pueda asociar (el motivo queda en
 *   billing_events.error para revisarlo); 400 si la firma no es válida; 5xx si no se pudo ni
 *   registrar el evento o si hubo una falla pasajera (base de datos, Auth o Recurrente sin
 *   responder): el aviso queda sin cerrar (processed_at vacío) y Svix lo reintenta, así una
 *   compra o una membresía pagada no se pierde por un timeout.
 * - Cancelación: la membresía conserva el acceso hasta el fin del periodo pagado (o de la
 *   prueba); un subscription.cancel nunca acorta esa fecha. Ver cancelar-membresia.
 *
 * Se despliega con verify_jwt = false (Recurrente no manda un JWT de Supabase): ver supabase/config.toml.
 */
import { ITEM_KEY, PLANS, accessUntil, addInterval, isPlanSlug, trialEndsAt, type PlanSlug } from "../_shared/catalog.ts";
import { json } from "../_shared/http.ts";
import { asArr, asObj, email as normEmail, errorMessage, num, str, uuid, type Json } from "../_shared/json.ts";
import { getSubscription, recurrenteConfigured, verifySvixSignature } from "../_shared/recurrente.ts";
import {
  eq,
  isConfirmed,
  isForeignKeyViolation,
  isTransient,
  isUniqueViolation,
  rest,
  supabaseEnv,
  userById,
  type SupabaseEnv,
} from "../_shared/supabase.ts";

type Status = "trialing" | "active" | "past_due" | "canceled" | "incomplete";

const PAID = new Set(["intent.succeeded", "payment_intent.succeeded"]);
const FAILED = new Set(["intent.failed", "payment_intent.failed"]);
const SUB_CREATE = new Set(["subscription.create", "subscription.created"]);
const SUB_CANCEL = new Set(["subscription.cancel", "subscription.cancelled", "subscription.canceled"]);
const SUB_PAST_DUE = new Set(["subscription.past_due", "subscription.pause"]);
const SUB_REVIVE = new Set(["subscription.unpause", "subscription.reactivate"]);

/** No se pudo terminar por algo pasajero (Recurrente no respondió a tiempo): Svix debe reintentar. */
class RetryLater extends Error {
  constructor(message: string) {
    super(message);
    this.name = "RetryLater";
  }
}

Deno.serve(async (req: Request) => {
  if (req.method !== "POST") return json({ error: "Método no permitido." }, 405);

  const secret = Deno.env.get("RECURRENTE_WEBHOOK_SECRET");
  if (!secret) {
    console.error("[recurrente-webhook] falta el secreto RECURRENTE_WEBHOOK_SECRET");
    return json({ error: "Webhook sin configurar." }, 503); // Svix reintenta: el evento no se pierde
  }

  const rawBody = await req.text();
  const header = (name: string) => req.headers.get(`svix-${name}`) ?? req.headers.get(`webhook-${name}`);
  const svixId = header("id");
  const check = await verifySvixSignature({
    rawBody,
    id: svixId,
    timestamp: header("timestamp"),
    signature: header("signature"),
    secret,
  });
  if (!check.ok || !svixId) {
    console.warn("[recurrente-webhook] firma rechazada:", check.ok ? "sin svix-id" : check.reason);
    return json({ error: "Firma inválida." }, 400);
  }

  let payload: Json | null = null;
  try {
    payload = asObj(JSON.parse(rawBody));
  } catch {
    payload = null;
  }
  if (!payload) return json({ ok: true, ignored: "el cuerpo no es un objeto JSON" });

  let env: SupabaseEnv;
  try {
    env = supabaseEnv();
  } catch (err) {
    console.error("[recurrente-webhook]", errorMessage(err));
    return json({ error: "Función sin configurar." }, 503);
  }

  const type = str(payload.event_type) ?? str(payload.type) ?? "desconocido";

  let state: "new" | "retry" | "duplicate";
  try {
    state = await recordEvent(env, svixId, type, payload);
  } catch (err) {
    console.error("[recurrente-webhook] no se pudo registrar el evento", svixId, errorMessage(err));
    return json({ error: "No se pudo registrar el evento." }, 500);
  }
  if (state === "duplicate") return json({ ok: true, duplicate: true });

  let note = "";
  let error: string | null = null;
  let retry = false;
  try {
    note = await handle(env, extract(type, payload));
  } catch (err) {
    error = errorMessage(err).slice(0, 1000);
    // Pasajero (5xx, timeout, sin red): el aviso queda abierto para que Svix lo reintente.
    // Permanente ("sin mapeo", "sin correo"): se cierra con el motivo y se revisa a mano.
    retry = err instanceof RetryLater || isTransient(err);
  }
  try {
    await rest(env, "PATCH", `billing_events?id=${eq(svixId)}`, {
      body: { processed_at: retry ? null : new Date().toISOString(), error },
      prefer: "return=minimal",
    });
  } catch (err) {
    console.error("[recurrente-webhook] no se pudo cerrar el evento", svixId, errorMessage(err));
  }
  if (retry) {
    console.error(`[recurrente-webhook] ${type} ${svixId}: falla pasajera, Svix reintenta: ${error}`);
    return json({ error: "Falla pasajera, reintentar." }, 503);
  }
  if (error) console.error(`[recurrente-webhook] ${type} ${svixId}: ${error}`);
  else console.log(`[recurrente-webhook] ${type} ${svixId}: ${note}`);
  return json({ ok: true });
});

/* ---------------- bitácora e idempotencia ---------------- */

/**
 * Inserta el evento en billing_events. Si ya existía: "duplicate" si se terminó de procesar,
 * "retry" si un intento anterior se cortó a medias (o si alguien limpió processed_at para
 * reprocesarlo a mano).
 */
async function recordEvent(env: SupabaseEnv, id: string, type: string, payload: Json): Promise<"new" | "retry" | "duplicate"> {
  try {
    await rest(env, "POST", "billing_events", { body: { id, type, payload }, prefer: "return=minimal" });
    return "new";
  } catch (err) {
    if (!isUniqueViolation(err)) throw err;
  }
  const rows = await rest<{ processed_at: string | null }[]>(env, "GET", `billing_events?select=processed_at&id=${eq(id)}`);
  return rows[0]?.processed_at ? "duplicate" : "retry";
}

/* ---------------- lectura del evento ---------------- */

interface Ev {
  type: string;
  at: Date;
  userId: string | null;
  email: string | null;
  plan: PlanSlug | null;
  itemKey: string | null;
  /** flare_trial de la metadata: true/false si el checkout lo dijo, null si no se sabe. */
  trial: boolean | null;
  checkoutId: string | null;
  /** Llave única del pago para `purchases.recurrente_checkout_id` (igual en intent.* y payment_intent.*). */
  paymentKey: string | null;
  recSubId: string | null;
  productIds: string[];
  amountCents: number | null;
  currency: string | null;
  periodEnd: string | null;
  remoteTried: boolean;
  /** La consulta a Recurrente falló por algo pasajero: si faltan datos, se reintenta en vez de darse por vencido. */
  remoteFailed: boolean;
  resolvedUser?: string | null;
}

function extract(type: string, p: Json): Ev {
  const checkout = asObj(p.checkout);
  const subscription = asObj(p.subscription);
  const customer = asObj(p.customer);
  const details = asObj(p.details);
  const payment = asObj(p.payment);
  const isSubEvent = type.startsWith("subscription.");

  const productIds = [
    str(asObj(p.product)?.id),
    ...asArr(details?.products).map((x) => str(asObj(x)?.id)),
    ...asArr(p.products).map((x) => str(asObj(x)?.id)),
  ].filter((x): x is string => Boolean(x));

  const createdAt = Date.parse(str(p.created_at) ?? "");
  const checkoutId = str(checkout?.id) ?? str(p.checkout_id);

  const ev: Ev = {
    type,
    at: Number.isFinite(createdAt) ? new Date(createdAt) : new Date(),
    userId: null,
    email: normEmail(customer?.email) ?? normEmail(p.customer_email),
    plan: null,
    itemKey: null,
    trial: null,
    checkoutId,
    paymentKey:
      checkoutId ?? str(payment?.id) ?? (type.startsWith("payment_intent.") ? str(p.id) : null) ?? (isSubEvent ? null : str(p.id)),
    recSubId: str(subscription?.id) ?? str(p.subscription_id) ?? (isSubEvent ? str(p.id) : null),
    productIds: [...new Set(productIds)],
    amountCents: num(p.amount_in_cents) ?? num(checkout?.total_in_cents),
    currency: str(p.currency) ?? str(checkout?.currency),
    periodEnd: str(p.current_period_end) ?? str(subscription?.current_period_end),
    remoteTried: false,
    remoteFailed: false,
  };

  // Metadata: la de los ítems, la del checkout y la de la suscripción (la más específica gana).
  const itemMeta = asArr(checkout?.items).map((i) => asObj(asObj(i)?.metadata));
  readMeta(ev, Object.assign({}, ...itemMeta, asObj(p.metadata), asObj(checkout?.metadata), asObj(subscription?.metadata)));
  return ev;
}

function readMeta(ev: Ev, meta: Json) {
  ev.userId ??= uuid(meta.flare_user_id);
  ev.email ??= normEmail(meta.flare_email);
  if (!ev.plan && isPlanSlug(meta.flare_plan)) ev.plan = meta.flare_plan;
  const key = str(meta.flare_item_key);
  if (!ev.itemKey && key && ITEM_KEY.test(key)) ev.itemKey = key;
  const trial = meta.flare_trial;
  if (ev.trial === null && (trial === "1" || trial === "0" || typeof trial === "boolean")) ev.trial = trial === "1" || trial === true;
}

/** Completa el evento con la suscripción de Recurrente (metadata, correo, fin de periodo). Una vez por evento. */
async function ensureRemote(ev: Ev): Promise<void> {
  if (ev.remoteTried || !ev.recSubId || !recurrenteConfigured()) return;
  ev.remoteTried = true;
  try {
    const s = await getSubscription(ev.recSubId);
    readMeta(ev, asObj(s.metadata) ?? {});
    ev.email ??= normEmail(s.subscriber?.email);
    const end = str(s.current_period_end);
    if (end && Date.parse(end) > Date.now()) ev.periodEnd ??= end;
    const productId = str(s.product?.id);
    if (productId && !ev.productIds.includes(productId)) ev.productIds.push(productId);
  } catch (err) {
    ev.remoteFailed = isTransient(err);
    console.warn("[recurrente-webhook] no se pudo leer la suscripción", ev.recSubId, errorMessage(err));
  }
}

/**
 * Falta un dato para registrar el aviso. Si Recurrente no respondió (quizá lo traía), es
 * pasajero y se reintenta; si no, es permanente y queda en billing_events.error.
 */
function missing(ev: Ev, message: string): Error {
  return ev.remoteFailed ? new RetryLater(`${message} · Recurrente no respondió, se reintenta`) : new Error(message);
}

/* ---------------- qué se compró ---------------- */

async function productMapping(env: SupabaseEnv, ev: Ev): Promise<void> {
  if (!ev.productIds.length || ev.plan || ev.itemKey) return;
  const list = ev.productIds.map(encodeURIComponent).join(",");
  const rows = await rest<{ product_id: string; item_key: string | null; plan_slug: string | null }[]>(
    env,
    "GET",
    `recurrente_products?select=product_id,item_key,plan_slug&product_id=in.(${list})`,
  );
  for (const id of ev.productIds) {
    const row = rows.find((r) => r.product_id === id);
    if (!row) continue;
    if (isPlanSlug(row.plan_slug)) ev.plan = row.plan_slug;
    else if (row.item_key && ITEM_KEY.test(row.item_key)) ev.itemKey = row.item_key;
    if (ev.plan || ev.itemKey) return;
  }
}

async function resolveTarget(env: SupabaseEnv, ev: Ev): Promise<void> {
  if (ev.plan || ev.itemKey) return;
  await productMapping(env, ev);
  if (ev.plan || ev.itemKey || !ev.recSubId) return;
  const known = await subscriptionBySubId(env, ev.recSubId);
  if (known && isPlanSlug(known.plan_slug)) {
    ev.plan = known.plan_slug;
    return;
  }
  await ensureRemote(ev);
  await productMapping(env, ev);
}

/* ---------------- despacho ---------------- */

async function handle(env: SupabaseEnv, ev: Ev): Promise<string> {
  const t = ev.type;
  const isSub = t.startsWith("subscription.");
  const relevant = PAID.has(t) || FAILED.has(t) || t === "setup_intent.succeeded" || t === "setup_intent.cancelled" || isSub;
  if (!relevant) return `ignorado (${t})`;

  await resolveTarget(env, ev);

  // Pago único: curso, entrada a evento o workbook.
  if (ev.itemKey && !ev.plan) {
    if (PAID.has(t)) return recordPurchase(env, ev, ev.itemKey);
    return `pago único ${ev.itemKey}: ${t} sin cambios`;
  }

  // Suscripción sin metadata ni producto conocido: se adopta la fila pendiente del mismo correo.
  if (!ev.plan && (isSub || t === "setup_intent.succeeded") && ev.recSubId && ev.email) {
    const pending = await pendingSubscriptionByEmail(env, ev.email);
    if (pending && isPlanSlug(pending.plan_slug)) ev.plan = pending.plan_slug;
  }
  // Renovación en formato unificado (sin id de suscripción ni metadata): mismo monto que un
  // plan y una membresía viva de ese correo. El gemelo payment_intent.* sí trae el id.
  if (!ev.plan && PAID.has(t) && ev.email) {
    const byAmount = planByAmount(ev.amountCents, ev.currency);
    if (byAmount && (await findSubscription(env, ev, byAmount))) ev.plan = byAmount;
  }
  const plan = ev.plan;
  if (!plan) {
    if (FAILED.has(t) || t === "setup_intent.cancelled") return `ignorado: ${t} sin producto conocido`;
    if (t === "setup_intent.succeeded" && !ev.recSubId) return "tarjeta guardada sin suscripción (ignorado)";
    throw missing(
      ev,
      `sin mapeo: ${t} sin metadata flare_* ni producto en recurrente_products ` +
        `(productos: ${ev.productIds.join(", ") || "—"}; checkout: ${ev.checkoutId ?? "—"}; suscripción: ${ev.recSubId ?? "—"}; correo: ${ev.email ?? "—"})`,
    );
  }

  if (PAID.has(t)) {
    // Cobro de la membresía (primer cobro tras la prueba o renovación).
    await ensureRemote(ev);
    const precise = ev.periodEnd;
    const periodEnd = precise ?? addInterval(ev.at, PLANS[plan].interval).toISOString();
    return saveSubscription(env, ev, plan, { status: "active", periodEnd, approximate: !precise }, { create: true });
  }
  if (FAILED.has(t)) return saveSubscription(env, ev, plan, { status: "past_due" }, { create: false, only: ["active", "trialing"] });
  if (t === "setup_intent.succeeded") {
    // Tarjeta guardada sin cobro = arrancó la prueba gratis (salvo que el checkout dijera que no había).
    if (ev.trial === false) return "tarjeta guardada en una membresía sin prueba (sin cambios)";
    return saveSubscription(env, ev, plan, { status: "trialing" }, { create: true });
  }
  if (t === "setup_intent.cancelled") return saveSubscription(env, ev, plan, { status: "past_due" }, { create: false, only: ["trialing"] });
  if (SUB_CREATE.has(t)) {
    const status: Status | undefined = ev.trial === true ? "trialing" : ev.trial === false ? "active" : undefined;
    return saveSubscription(env, ev, plan, { status }, { create: true });
  }
  if (SUB_PAST_DUE.has(t)) return saveSubscription(env, ev, plan, { status: "past_due" }, { create: true });
  if (SUB_REVIVE.has(t)) return saveSubscription(env, ev, plan, { status: "active" }, { create: true });
  if (SUB_CANCEL.has(t)) return saveSubscription(env, ev, plan, { status: "canceled" }, { create: true });
  // subscription.update, item_added, item_removed…: solo sincroniza ids y fechas.
  return saveSubscription(env, ev, plan, {}, { create: false });
}

/* ---------------- membresías ---------------- */

interface SubRow {
  id: string;
  user_id: string | null;
  email: string;
  plan_slug: string;
  status: Status;
  recurrente_subscription_id: string | null;
  trial_ends_at: string | null;
  current_period_end: string | null;
}

const SUB_SELECT = "select=id,user_id,email,plan_slug,status,recurrente_subscription_id,trial_ends_at,current_period_end";

async function subscriptionBySubId(env: SupabaseEnv, recSubId: string): Promise<SubRow | null> {
  const rows = await rest<SubRow[]>(env, "GET", `subscriptions?${SUB_SELECT}&recurrente_subscription_id=${eq(recSubId)}&limit=1`);
  return rows[0] ?? null;
}

async function pendingSubscriptionByEmail(env: SupabaseEnv, mail: string): Promise<SubRow | null> {
  const rows = await rest<SubRow[]>(
    env,
    "GET",
    `subscriptions?${SUB_SELECT}&email=${eq(mail)}&recurrente_subscription_id=is.null&status=neq.canceled&order=created_at.desc&limit=1`,
  );
  return rows[0] ?? null;
}

/**
 * La membresía a la que se refiere el evento: por id de Recurrente; si no, la más reciente
 * y viva de la misma dueña y plan (sin id todavía, si el evento sí trae uno).
 */
async function findSubscription(env: SupabaseEnv, ev: Ev, plan: PlanSlug): Promise<SubRow | null> {
  if (ev.recSubId) {
    const row = await subscriptionBySubId(env, ev.recSubId);
    if (row) return row;
  }
  const owner = ev.userId ? `user_id=${eq(ev.userId)}` : ev.email ? `email=${eq(ev.email)}` : null;
  if (!owner) return null;
  const withoutId = ev.recSubId ? "&recurrente_subscription_id=is.null" : "";
  const rows = await rest<SubRow[]>(
    env,
    "GET",
    `subscriptions?${SUB_SELECT}&${owner}&plan_slug=${eq(plan)}&status=neq.canceled${withoutId}&order=created_at.desc&limit=1`,
  );
  return rows[0] ?? null;
}

/** Los estados no retroceden: una membresía ya cobrada no vuelve a "prueba", una cancelada solo revive con un cobro o reactivación. */
function nextStatus(current: Status, desired: Status): Status {
  if (desired === "trialing" && current === "active") return "active";
  if (current === "canceled" && desired !== "active") return "canceled";
  return desired;
}

async function saveSubscription(
  env: SupabaseEnv,
  ev: Ev,
  plan: PlanSlug,
  /** approximate: el fin de periodo es calculado (el evento no lo traía), no el de Recurrente. */
  change: { status?: Status; periodEnd?: string; approximate?: boolean },
  opts: { create: boolean; only?: Status[]; retried?: boolean },
): Promise<string> {
  const now = new Date().toISOString();
  const row = await findSubscription(env, ev, plan);

  if (row) {
    if (opts.only && !opts.only.includes(row.status)) return `sin cambios: membresía ${row.id} en ${row.status} (${ev.type})`;
    const status = change.status ? nextStatus(row.status, change.status) : row.status;
    const patch: Json = { updated_at: now };
    if (status !== row.status) patch.status = status;
    if (status === "trialing" && !row.trial_ends_at) patch.trial_ends_at = trialEndsAt(ev.at);
    let currentEnd = row.current_period_end;
    const periodEnd = change.periodEnd ?? ev.periodEnd;
    if (periodEnd && periodEnd !== currentEnd) {
      // Una fecha calculada no pisa la de Recurrente del mismo periodo (llega por el evento gemelo);
      // solo avanza si la guardada es claramente de un periodo anterior.
      const saved = currentEnd ? Date.parse(currentEnd) : NaN;
      const stale = !Number.isFinite(saved) || saved < Date.parse(periodEnd) - 7 * 86_400_000;
      // Cancelada: conserva el acceso hasta el fin de lo ya pagado; un aviso tardío no acorta la fecha.
      const shortens = status === "canceled" && Number.isFinite(saved) && Date.parse(periodEnd) < saved;
      if ((!change.approximate || stale) && !shortens) currentEnd = periodEnd;
    }
    if (status === "canceled" && row.status !== "canceled") {
      // Cancelada desde Recurrente o por cobros fallidos: igual que en cancelar-membresia, el fin
      // del acceso queda en current_period_end (si estaba en prueba, el fin de la prueba).
      patch.canceled_at = now;
      currentEnd = accessUntil({ current_period_end: currentEnd, trial_ends_at: row.trial_ends_at }) ?? currentEnd;
    }
    if (currentEnd !== row.current_period_end) patch.current_period_end = currentEnd;
    if (ev.recSubId && !row.recurrente_subscription_id) patch.recurrente_subscription_id = ev.recSubId;
    if (!row.user_id) {
      const userId = await resolveUserId(env, ev);
      if (userId) patch.user_id = userId;
    }
    try {
      await rest(env, "PATCH", `subscriptions?id=${eq(row.id)}`, { body: patch, prefer: "return=minimal" });
    } catch (err) {
      // El id de Recurrente ya estaba en otra fila (otro evento llegó primero): se deja sin él.
      if (!isUniqueViolation(err) || !("recurrente_subscription_id" in patch)) throw err;
      delete patch.recurrente_subscription_id;
      await rest(env, "PATCH", `subscriptions?id=${eq(row.id)}`, { body: patch, prefer: "return=minimal" });
    }
    return `membresía ${row.id} (${plan}): ${row.status} → ${status}`;
  }

  if (!opts.create) return `sin membresía registrada (${ev.type})`;

  const status: Status = change.status ?? "active";
  const mail = ev.email ?? (await emailOfUser(env, ev.userId));
  if (!mail) throw missing(ev, `sin correo para registrar la membresía ${plan} (${ev.type})`);
  const userId = await resolveUserId(env, ev);
  const insert: Json = {
    user_id: userId,
    email: mail,
    plan_slug: plan,
    status,
    recurrente_subscription_id: ev.recSubId,
    trial_ends_at: status === "trialing" ? trialEndsAt(ev.at) : null,
    current_period_end: change.periodEnd ?? ev.periodEnd ?? null,
    canceled_at: status === "canceled" ? now : null,
  };
  try {
    await insertRow(env, "subscriptions", insert);
  } catch (err) {
    // Otro evento de la misma suscripción la creó al mismo tiempo: se actualiza esa.
    if (isUniqueViolation(err) && !opts.retried) return saveSubscription(env, ev, plan, change, { ...opts, retried: true });
    throw err;
  }
  return `membresía nueva (${plan}): ${status}${userId ? "" : " · sin cuenta aún, se enlaza al confirmar el correo"}`;
}

/* ---------------- compras ---------------- */

async function recordPurchase(env: SupabaseEnv, ev: Ev, itemKey: string): Promise<string> {
  const mail = ev.email ?? (await emailOfUser(env, ev.userId));
  if (!mail) throw missing(ev, `sin correo para registrar la compra ${itemKey}`);
  const userId = await resolveUserId(env, ev);
  await insertRow(
    env,
    "purchases",
    {
      user_id: userId,
      email: mail,
      item_key: itemKey,
      recurrente_checkout_id: ev.paymentKey,
      amount_cents: ev.amountCents,
      currency: ev.currency,
    },
    "recurrente_checkout_id",
  );
  return `compra ${itemKey} (${mail})${userId ? "" : " · sin cuenta aún, se enlaza al confirmar el correo"}`;
}

/* ---------------- utilidades ---------------- */

/**
 * Inserta una fila. Con `onConflict`, un duplicado se ignora (idempotencia). Si el user_id
 * ya no existe (cuenta borrada), se guarda sin él para no perder el registro.
 */
async function insertRow(env: SupabaseEnv, table: string, row: Json, onConflict?: string): Promise<void> {
  const path = onConflict ? `${table}?on_conflict=${onConflict}` : table;
  const prefer = onConflict ? "resolution=ignore-duplicates,return=minimal" : "return=minimal";
  try {
    await rest(env, "POST", path, { body: row, prefer });
  } catch (err) {
    if (!isForeignKeyViolation(err) || !row.user_id) throw err;
    await rest(env, "POST", path, { body: { ...row, user_id: null }, prefer });
  }
}

/**
 * Cuenta dueña del pago: la de la metadata (la puso crear-checkout con la sesión validada)
 * o la que tiene ese correo, solo si está confirmado (nadie reclama compras ajenas
 * registrándose con un correo que no es suyo).
 */
async function resolveUserId(env: SupabaseEnv, ev: Ev): Promise<string | null> {
  if (ev.resolvedUser !== undefined) return ev.resolvedUser;
  let found: string | null = ev.userId;
  if (!found && ev.email) {
    const rows = await rest<{ id: string }[]>(env, "GET", `profiles?select=id&email=${eq(ev.email)}&limit=2`);
    for (const r of rows) {
      const u = await userById(env, r.id);
      if (u && isConfirmed(u) && normEmail(u.email) === ev.email) {
        found = u.id;
        break;
      }
    }
  }
  ev.resolvedUser = found;
  return found;
}

async function emailOfUser(env: SupabaseEnv, userId: string | null): Promise<string | null> {
  if (!userId) return null;
  return normEmail((await userById(env, userId))?.email);
}

/** Plan cuyo precio coincide exactamente con el cobro (solo para reconocer renovaciones sin metadata). */
function planByAmount(amountCents: number | null, currency: string | null): PlanSlug | null {
  if (amountCents === null || !currency) return null;
  const match = (Object.keys(PLANS) as PlanSlug[]).filter(
    (slug) => PLANS[slug].amountCents === amountCents && PLANS[slug].currency === currency.toUpperCase(),
  );
  return match.length === 1 ? match[0] : null;
}
