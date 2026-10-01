/**
 * cancelar-membresia — la usuaria cancela su membresía desde Mi cuenta.
 *
 *   POST (sin cuerpo) → { ok: true, currentPeriodEnd? } | { error }
 *
 * - La usuaria se identifica con su JWT (Authorization: Bearer, lo manda supabase-js) y se
 *   valida contra Auth aquí dentro; por eso se despliega con verify_jwt = false, igual que
 *   crear-checkout (ver supabase/config.toml).
 * - Cancela en Recurrente (DELETE /api/subscriptions/{id}): deja de cobrar desde ya.
 * - En `subscriptions` queda status = canceled, canceled_at y, en current_period_end, hasta
 *   cuándo conserva el acceso (el fin del periodo pagado o, si estaba en prueba, el fin de la
 *   prueba). Esa fecha es la que responde como `currentPeriodEnd`.
 * - Idempotente: si ya estaba cancelada responde ok con la misma fecha. Luego llega el webhook
 *   subscription.cancel, que no cambia nada ni acorta la fecha.
 * - Si la membresía todavía no tiene id de Recurrente (no ha llegado subscription.create) no
 *   se marca nada, para no mostrarla cancelada mientras Recurrente sigue cobrando: se le pide
 *   escribirnos y el equipo la cancela desde Recurrente (docs/06, sección 6).
 */
import { accessUntil } from "../_shared/catalog.ts";
import { bearerToken, corsHeaders, isAllowedOrigin, json } from "../_shared/http.ts";
import { errorMessage } from "../_shared/json.ts";
import { RecurrenteError, cancelSubscription, recurrenteConfigured } from "../_shared/recurrente.ts";
import { eq, rest, supabaseEnv, userFromToken } from "../_shared/supabase.ts";

/** Estados con acceso vigente (los mismos que bloquean un segundo checkout en crear-checkout). */
const LIVE_STATUSES = new Set(["trialing", "active", "past_due"]);

/** El mismo correo de contacto que muestra Mi cuenta (src/components/account/copy.ts). */
const CONTACT = "hola@theflare.club";

class HttpError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

interface Row {
  id: string;
  status: string;
  recurrente_subscription_id: string | null;
  trial_ends_at: string | null;
  current_period_end: string | null;
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
      console.error("[cancelar-membresia] Recurrente:", err.message);
      return json({ error: "No pudimos cancelar tu membresía en este momento. Intenta de nuevo en unos minutos." }, 502, cors);
    }
    console.error("[cancelar-membresia]", errorMessage(err));
    return json({ error: "No pudimos cancelar tu membresía en este momento. Intenta de nuevo en unos minutos." }, 500, cors);
  }
});

async function handle(req: Request): Promise<{ ok: true; currentPeriodEnd?: string }> {
  const token = bearerToken(req);
  if (!token) throw new HttpError(401, "Inicia sesión para continuar.");

  const env = supabaseEnv();
  const user = await userFromToken(env, token);
  if (!user) throw new HttpError(401, "Tu sesión expiró. Vuelve a entrar para continuar.");

  const rows = await rest<Row[]>(
    env,
    "GET",
    `subscriptions?select=id,status,recurrente_subscription_id,trial_ends_at,current_period_end&user_id=${eq(user.id)}&order=created_at.desc`,
  );
  const live = rows.filter((r) => LIVE_STATUSES.has(r.status));

  if (!live.length) {
    // Ya estaba cancelada (doble clic, otra pestaña o el webhook llegó antes): misma respuesta.
    if (rows[0]?.status === "canceled") return done(accessUntil(rows[0]));
    throw new HttpError(404, "No tienes una membresía activa para cancelar.");
  }

  // Sin id de Recurrente no hay a qué cancelarle el cobro: mejor no marcarla como cancelada.
  const orphan = live.find((r) => !r.recurrente_subscription_id);
  if (orphan) {
    console.error("[cancelar-membresia] membresía sin id de Recurrente:", orphan.id, "usuaria:", user.id);
    throw new HttpError(409, `No pudimos cancelarla desde aquí. Escríbenos a ${CONTACT} y la cancelamos por ti.`);
  }
  if (!recurrenteConfigured()) throw new HttpError(503, "Los pagos todavía no están activos.");

  const now = new Date().toISOString();
  let latest: string | null = null;
  for (const row of live) {
    const recId = row.recurrente_subscription_id as string;
    try {
      await cancelSubscription(recId);
    } catch (err) {
      // 404: ya no existe en Recurrente (se canceló desde su dashboard). Se marca igual aquí.
      if (!(err instanceof RecurrenteError && err.status === 404)) throw err;
      console.warn("[cancelar-membresia] la suscripción ya no existe en Recurrente:", recId);
    }
    const until = accessUntil(row);
    await rest(env, "PATCH", `subscriptions?id=${eq(row.id)}`, {
      body: { status: "canceled", canceled_at: now, updated_at: now, current_period_end: until },
      prefer: "return=minimal",
    });
    if (until && (!latest || Date.parse(until) > Date.parse(latest))) latest = until;
  }
  console.log(`[cancelar-membresia] usuaria ${user.id}: ${live.length} membresía(s) cancelada(s), acceso hasta ${latest ?? "—"}`);
  return done(latest);
}

function done(until: string | null): { ok: true; currentPeriodEnd?: string } {
  return until ? { ok: true, currentPeriodEnd: new Date(until).toISOString() } : { ok: true };
}
