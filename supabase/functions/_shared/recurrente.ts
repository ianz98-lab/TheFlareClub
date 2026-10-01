/**
 * Cliente mínimo de la API de Recurrente y verificación de webhooks (Svix). Solo servidor.
 *
 * - Auth: header X-SECRET-KEY (sk_live_… o sk_test_…). La misma URL sirve pruebas y
 *   producción: la llave decide el ambiente.
 * - Docs: https://docs.recurrente.com (checkouts, customers, subscriptions, webhooks).
 */
import { asObj, str } from "./json.ts";

const API_BASE = "https://app.recurrente.com/api";

export class RecurrenteError extends Error {
  status: number;
  code: string | null;
  constructor(message: string, status: number, code: string | null) {
    super(message);
    this.name = "RecurrenteError";
    this.status = status;
    this.code = code;
  }
}

export const recurrenteConfigured = (): boolean => Boolean(Deno.env.get("RECURRENTE_SECRET_KEY"));

async function api<T>(path: string, init: { method?: "GET" | "POST" | "DELETE"; body?: unknown } = {}): Promise<T> {
  const key = Deno.env.get("RECURRENTE_SECRET_KEY");
  if (!key) throw new Error("Falta RECURRENTE_SECRET_KEY");
  const method = init.method ?? "GET";
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers: { "X-SECRET-KEY": key, "Content-Type": "application/json", Accept: "application/json" },
    body: init.body === undefined ? undefined : JSON.stringify(init.body),
    signal: AbortSignal.timeout(15_000),
  });
  const text = await res.text();
  let data: unknown = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = null;
  }
  if (!res.ok) {
    const o = asObj(data);
    const detail = str(o?.message) ?? str(o?.error) ?? text.slice(0, 200);
    throw new RecurrenteError(`Recurrente ${method} ${path} → HTTP ${res.status}: ${detail}`, res.status, str(o?.code));
  }
  return data as T;
}

/* ---------------- tipos (solo los campos que usamos) ---------------- */

export interface RecurrenteCustomer {
  id: string;
  email?: string;
}

export interface RecurrenteCheckout {
  id: string;
  checkout_url: string;
  status?: string;
  live_mode?: boolean;
}

export interface RecurrenteSubscription {
  id: string;
  status?: string;
  current_period_start?: string | null;
  current_period_end?: string | null;
  metadata?: Record<string, unknown> | null;
  checkout?: { id?: string } | null;
  product?: { id?: string } | null;
  subscriber?: { email?: string | null; full_name?: string | null } | null;
}

/** Ítem inline del checkout (Recurrente crea un producto invisible para él). */
export interface CheckoutItem {
  name: string;
  amount_in_cents: number;
  currency: "USD" | "GTQ";
  quantity: number;
  charge_type: "one_time" | "recurring";
  billing_interval?: "day" | "week" | "month" | "year";
  billing_interval_count?: number;
  free_trial_interval?: "week" | "month" | "year";
  free_trial_interval_count?: number;
  /** FEL: membresías y cursos son servicios. */
  tax_category?: "good" | "service";
  metadata?: Record<string, string>;
}

export interface CheckoutInput {
  items: CheckoutItem[];
  success_url: string;
  cancel_url: string;
  /** Persiste en la suscripción y en todos sus webhooks (renovaciones, cancelación). */
  metadata: Record<string, string>;
  /** Prellena nombre y correo en la página de pago. */
  customer_id?: string;
}

/* ---------------- endpoints ---------------- */

/** Crea el cliente, o devuelve el existente si ese correo ya existe en Recurrente. */
export const createCustomer = (email: string, fullName?: string | null) =>
  api<RecurrenteCustomer>("/customers", { method: "POST", body: { email, ...(fullName ? { full_name: fullName } : {}) } });

export const createCheckout = (input: CheckoutInput) =>
  api<RecurrenteCheckout>("/checkouts", { method: "POST", body: input });

export const getSubscription = (id: string) =>
  api<RecurrenteSubscription>(`/subscriptions/${encodeURIComponent(id)}`);

/**
 * Cancela la suscripción: Recurrente deja de cobrar desde ya (no hay "al final del periodo").
 * El acceso hasta el fin del periodo pagado lo damos nosotras con `current_period_end`.
 * Responde 200 `{ message: "Suscripcion cancelada" }`; después llega el webhook subscription.cancel.
 */
export const cancelSubscription = (id: string) =>
  api<{ message?: string } | null>(`/subscriptions/${encodeURIComponent(id)}`, { method: "DELETE" });

/* ---------------- webhooks (Svix) ---------------- */

function base64ToBytes(b64: string) {
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

/** Comparación en tiempo constante (no corta en el primer byte distinto). */
function timingSafeEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i];
  return diff === 0;
}

/**
 * Verifica la firma Svix de un webhook de Recurrente.
 * Contenido firmado: `${svix-id}.${svix-timestamp}.${rawBody}` (el body CRUDO, sin re-serializar).
 * Llave: base64 de lo que va después de `whsec_`. Header: "v1,<base64> v1,<base64> …".
 * Tolerancia de 5 minutos contra repeticiones.
 */
export async function verifySvixSignature(o: {
  rawBody: string;
  id: string | null;
  timestamp: string | null;
  signature: string | null;
  secret: string;
  toleranceSec?: number;
}): Promise<{ ok: true } | { ok: false; reason: string }> {
  const { rawBody, id, timestamp, signature, secret } = o;
  if (!id || !timestamp || !signature) return { ok: false, reason: "faltan headers svix" };
  const ts = Number(timestamp);
  if (!Number.isInteger(ts) || Math.abs(Date.now() / 1000 - ts) > (o.toleranceSec ?? 300)) {
    return { ok: false, reason: "timestamp fuera de tolerancia" };
  }
  let keyBytes: ReturnType<typeof base64ToBytes>;
  try {
    keyBytes = base64ToBytes(secret.startsWith("whsec_") ? secret.slice("whsec_".length) : secret);
  } catch {
    return { ok: false, reason: "RECURRENTE_WEBHOOK_SECRET mal formado" };
  }
  const key = await crypto.subtle.importKey("raw", keyBytes, { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const signed = new TextEncoder().encode(`${id}.${timestamp}.${rawBody}`);
  const expected = new Uint8Array(await crypto.subtle.sign("HMAC", key, signed));
  for (const part of signature.split(" ")) {
    const [version, sig] = part.split(",", 2);
    if (version !== "v1" || !sig) continue;
    let given: Uint8Array;
    try {
      given = base64ToBytes(sig);
    } catch {
      continue;
    }
    if (timingSafeEqual(given, expected)) return { ok: true };
  }
  return { ok: false, reason: "firma no coincide" };
}
