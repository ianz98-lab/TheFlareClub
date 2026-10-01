/**
 * crear-checkout — abre un checkout de Recurrente para la usuaria con sesión iniciada.
 *
 *   POST { kind: "plan", plan: "flare-mensual" | "flare-anual", successUrl, cancelUrl } → { url }
 *   POST { kind: "course", slug, successUrl, cancelUrl } → { url }   (listo para cuando haya cursos a la venta)
 *
 * - La usuaria se identifica con su JWT (Authorization: Bearer, lo manda supabase-js) y se
 *   valida contra Auth aquí dentro; por eso la función se despliega con verify_jwt = false.
 * - Precios en el servidor (_shared/catalog.ts): el navegador solo elige el plan.
 * - La usuaria viaja en la metadata (flare_user_id, flare_plan…): así el webhook sabe a
 *   quién activar, también en renovaciones y cancelaciones.
 * - Membresía = ítem inline recurrente con 7 días de prueba (free_trial_interval "week").
 * - RECURRENTE_SECRET_KEY solo vive en los secretos de la función.
 */
import { COURSES, ONE_TRIAL_PER_ACCOUNT, PLANS, TRIAL, isPlanSlug } from "../_shared/catalog.ts";
import { bearerToken, corsHeaders, isAllowedOrigin, json } from "../_shared/http.ts";
import { asObj, email as normEmail, errorMessage, str, type Json } from "../_shared/json.ts";
import {
  RecurrenteError,
  createCheckout,
  createCustomer,
  recurrenteConfigured,
  type CheckoutItem,
} from "../_shared/recurrente.ts";
import { eq, isConfirmed, rest, supabaseEnv, userFromToken, type AuthUser, type SupabaseEnv } from "../_shared/supabase.ts";

/** Estados en los que la usuaria ya tiene (o está por tener) acceso: no se abre otro cobro. */
const LIVE_STATUSES = new Set(["trialing", "active", "past_due"]);

class HttpError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

Deno.serve(async (req: Request) => {
  const cors = corsHeaders(req);
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: cors });
  if (req.method !== "POST") return json({ error: "Método no permitido." }, 405, cors);

  // Si viene de un navegador, tiene que ser uno de nuestros sitios.
  const origin = req.headers.get("origin");
  if (origin && !isAllowedOrigin(origin)) return json({ error: "Origen no permitido." }, 403, cors);

  try {
    return json(await handle(req), 200, cors);
  } catch (err) {
    if (err instanceof HttpError) return json({ error: err.message }, err.status, cors);
    if (err instanceof RecurrenteError) {
      console.error("[crear-checkout] Recurrente:", err.message);
      // Cuenta sin verificar: Recurrente no deja cobrar más de Q500 / USD 50 acumulados.
      const message =
        err.code === "amount_exceeds_unverified_limit"
          ? "Estamos terminando de activar los pagos. Intenta de nuevo en unos días."
          : "No pudimos abrir la página de pago. Intenta de nuevo en unos minutos.";
      return json({ error: message }, 502, cors);
    }
    console.error("[crear-checkout]", errorMessage(err));
    return json({ error: "No pudimos iniciar el pago. Intenta de nuevo en unos minutos." }, 500, cors);
  }
});

async function handle(req: Request): Promise<{ url: string; trial?: boolean }> {
  const token = bearerToken(req);
  if (!token) throw new HttpError(401, "Inicia sesión para continuar.");

  const env = supabaseEnv();
  const user = await userFromToken(env, token);
  if (!user) throw new HttpError(401, "Tu sesión expiró. Vuelve a entrar para continuar.");
  const userEmail = normEmail(user.email);
  if (!userEmail) throw new HttpError(400, "Tu cuenta no tiene un correo válido.");
  // Las compras se enlazan por correo confirmado (ver link_billing_to_user en la migración 0002).
  if (!isConfirmed(user)) throw new HttpError(403, "Confirma tu correo antes de continuar con el pago.");

  let body: Json | null = null;
  try {
    body = asObj(await req.json());
  } catch {
    body = null;
  }
  if (!body) throw new HttpError(400, "Solicitud inválida.");

  const successUrl = returnUrl(body.successUrl, "/cuenta/?pago=ok");
  const cancelUrl = returnUrl(body.cancelUrl, "/membresia/?pago=cancelado");

  if (!recurrenteConfigured()) throw new HttpError(503, "Los pagos todavía no están activos.");

  const fullName = str(asObj(user.user_metadata)?.full_name);
  const kind = str(body.kind);
  if (kind === "plan") return planCheckout(env, user, userEmail, fullName, body, successUrl, cancelUrl);
  if (kind === "course") return courseCheckout(env, user, userEmail, fullName, body, successUrl, cancelUrl);
  throw new HttpError(400, "Solicitud inválida.");
}

/* ---------------- membresía ---------------- */

async function planCheckout(
  env: SupabaseEnv,
  user: AuthUser,
  userEmail: string,
  fullName: string | null,
  body: Json,
  successUrl: string,
  cancelUrl: string,
): Promise<{ url: string; trial: boolean }> {
  const plan = body.plan;
  if (!isPlanSlug(plan)) throw new HttpError(400, "Ese plan no existe.");
  const price = PLANS[plan];

  const previous = await rest<{ status: string }[]>(env, "GET", `subscriptions?select=status&user_id=${eq(user.id)}`);
  if (previous.some((s) => LIVE_STATUSES.has(s.status))) {
    throw new HttpError(409, "Ya tienes una membresía activa. Puedes verla en Mi cuenta.");
  }
  const trial = !(ONE_TRIAL_PER_ACCOUNT && previous.length > 0);

  const metadata: Record<string, string> = {
    flare_kind: "plan",
    flare_user_id: user.id,
    flare_email: userEmail,
    flare_plan: plan,
    flare_trial: trial ? "1" : "0",
  };
  const item: CheckoutItem = {
    name: price.name,
    amount_in_cents: price.amountCents,
    currency: price.currency,
    quantity: 1,
    charge_type: "recurring",
    billing_interval: price.interval,
    billing_interval_count: 1,
    ...(trial ? { free_trial_interval: TRIAL.interval, free_trial_interval_count: TRIAL.count } : {}),
    tax_category: "service",
    metadata,
  };
  const customerId = await customerFor(userEmail, fullName);
  const checkout = await createCheckout({
    items: [item],
    metadata,
    success_url: successUrl,
    cancel_url: cancelUrl,
    ...(customerId ? { customer_id: customerId } : {}),
  });
  if (!checkout?.checkout_url) throw new Error("Recurrente no devolvió checkout_url");
  return { url: checkout.checkout_url, trial };
}

/* ---------------- cursos (pago único) ---------------- */

async function courseCheckout(
  env: SupabaseEnv,
  user: AuthUser,
  userEmail: string,
  fullName: string | null,
  body: Json,
  successUrl: string,
  cancelUrl: string,
): Promise<{ url: string }> {
  const slug = str(body.slug);
  const course = slug && Object.prototype.hasOwnProperty.call(COURSES, slug) ? COURSES[slug] : null;
  if (!slug || !course) throw new HttpError(404, "Ese curso aún no está a la venta.");
  const itemKey = `course:${slug}`;

  const owned = await rest<{ item_key: string }[]>(
    env,
    "GET",
    `purchases?select=item_key&user_id=${eq(user.id)}&item_key=${eq(itemKey)}&limit=1`,
  );
  if (owned.length) throw new HttpError(409, "Ya tienes este curso. Lo encuentras en Mi cuenta.");

  const metadata: Record<string, string> = {
    flare_kind: "course",
    flare_user_id: user.id,
    flare_email: userEmail,
    flare_item_key: itemKey,
  };
  const customerId = await customerFor(userEmail, fullName);
  const checkout = await createCheckout({
    items: [
      {
        name: course.name,
        amount_in_cents: course.amountCents,
        currency: course.currency,
        quantity: 1,
        charge_type: "one_time",
        tax_category: "service",
        metadata,
      },
    ],
    metadata,
    success_url: successUrl,
    cancel_url: cancelUrl,
    ...(customerId ? { customer_id: customerId } : {}),
  });
  if (!checkout?.checkout_url) throw new Error("Recurrente no devolvió checkout_url");
  return { url: checkout.checkout_url };
}

/* ---------------- utilidades ---------------- */

/** Cliente de Recurrente para prellenar nombre y correo. Si falla, el checkout se abre igual. */
async function customerFor(userEmail: string, fullName: string | null): Promise<string | null> {
  try {
    const customer = await createCustomer(userEmail, fullName);
    return str(customer?.id);
  } catch (err) {
    console.warn("[crear-checkout] no se pudo crear el cliente en Recurrente:", errorMessage(err));
    return null;
  }
}

/**
 * URL de regreso tras pagar/cancelar. Solo se aceptan orígenes nuestros (evita usar el
 * checkout para redirigir a sitios ajenos). Si la web no la manda, se arma con SITE_URL.
 */
function returnUrl(value: unknown, fallbackPath: string): string {
  if (value === undefined || value === null || value === "") {
    const site = str(Deno.env.get("SITE_URL"));
    if (!site) throw new HttpError(400, "Falta la URL de regreso.");
    return `${site.replace(/\/+$/, "")}${fallbackPath}`;
  }
  if (typeof value !== "string" || value.length > 500) throw new HttpError(400, "URL de regreso inválida.");
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new HttpError(400, "URL de regreso inválida.");
  }
  if (!isAllowedOrigin(url.origin)) throw new HttpError(400, "URL de regreso no permitida.");
  return url.toString();
}
