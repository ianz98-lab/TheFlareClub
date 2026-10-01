/**
 * Acceso mínimo a Supabase desde las Edge Functions, sin dependencias: PostgREST y Auth
 * por fetch. Usa la service role (SUPABASE_SERVICE_ROLE_KEY, que Supabase inyecta en cada
 * función): salta RLS, así que estas funciones nunca devuelven datos de otras usuarias.
 */
import { asObj, str, type Json } from "./json.ts";

export interface SupabaseEnv {
  url: string;
  serviceKey: string;
  anonKey: string | null;
}

export function supabaseEnv(): SupabaseEnv {
  const url = Deno.env.get("SUPABASE_URL");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !serviceKey) throw new Error("Faltan SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en el entorno de la función");
  return { url: url.replace(/\/+$/, ""), serviceKey, anonKey: Deno.env.get("SUPABASE_ANON_KEY") ?? null };
}

/** Las llaves nuevas (sb_secret_…) van solo en `apikey`; las legacy (JWT) también como Bearer. */
function adminHeaders(env: SupabaseEnv): Record<string, string> {
  const headers: Record<string, string> = { apikey: env.serviceKey };
  if (env.serviceKey.startsWith("eyJ")) headers.Authorization = `Bearer ${env.serviceKey}`;
  return headers;
}

export class DbError extends Error {
  status: number;
  code: string | null;
  constructor(message: string, status: number, code: string | null) {
    super(message);
    this.name = "DbError";
    this.status = status;
    this.code = code;
  }
}

/** Respuesta de error de Auth (distinta de "no existe" o "token inválido", que devuelven null). */
export class AuthError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = "AuthError";
    this.status = status;
  }
}

/**
 * Falla pasajera, vale la pena reintentar: sin red, timeout, o un 5xx/408/429 de PostgREST,
 * Auth o Recurrente (DbError, AuthError y RecurrenteError traen `status`). Un 4xx o un dato
 * que no cuadra es permanente: reintentar daría lo mismo.
 */
export function isTransient(err: unknown): boolean {
  if (err instanceof TypeError) return true; // fetch sin conexión o conexión cortada
  if (err instanceof DOMException && (err.name === "TimeoutError" || err.name === "AbortError")) return true;
  const status = err instanceof Error ? (err as Error & { status?: unknown }).status : undefined;
  return typeof status === "number" && (status >= 500 || status === 408 || status === 429);
}

/** Violación de unicidad (23505): el registro ya existía. */
export const isUniqueViolation = (err: unknown): boolean =>
  err instanceof DbError && (err.code === "23505" || (err.status === 409 && err.code !== "23503"));

/** Llave foránea rota (23503): p. ej. un user_id de una cuenta que ya se borró. */
export const isForeignKeyViolation = (err: unknown): boolean => err instanceof DbError && err.code === "23503";

/** Valor para filtros de PostgREST: `eq.<valor>` escapado para la URL. */
export const eq = (value: string) => `eq.${encodeURIComponent(value)}`;

/**
 * Llamada a PostgREST con la service role. `path` incluye tabla y query, p. ej.
 * `subscriptions?select=id&user_id=eq.<uuid>`.
 */
export async function rest<T = unknown>(
  env: SupabaseEnv,
  method: "GET" | "POST" | "PATCH",
  path: string,
  opts: { body?: unknown; prefer?: string } = {},
): Promise<T> {
  const res = await fetch(`${env.url}/rest/v1/${path}`, {
    method,
    headers: {
      ...adminHeaders(env),
      "Content-Type": "application/json",
      Accept: "application/json",
      ...(opts.prefer ? { Prefer: opts.prefer } : {}),
    },
    body: opts.body === undefined ? undefined : JSON.stringify(opts.body),
    signal: AbortSignal.timeout(10_000),
  });
  const text = await res.text();
  if (!res.ok) {
    let code: string | null = null;
    let message = text.slice(0, 300);
    try {
      const body = asObj(JSON.parse(text));
      code = str(body?.code);
      message = str(body?.message) ?? message;
    } catch {
      // cuerpo no JSON: se deja el texto
    }
    throw new DbError(`PostgREST ${method} ${path.split("?")[0]} → HTTP ${res.status}: ${message}`, res.status, code);
  }
  return (text ? JSON.parse(text) : null) as T;
}

/* ---------------- Auth ---------------- */

export interface AuthUser {
  id: string;
  email?: string | null;
  email_confirmed_at?: string | null;
  confirmed_at?: string | null;
  user_metadata?: Json | null;
}

export const isConfirmed = (u: AuthUser): boolean => Boolean(u.email_confirmed_at ?? u.confirmed_at);

function toUser(value: unknown): AuthUser | null {
  const o = asObj(value);
  return o && typeof o.id === "string" ? (o as unknown as AuthUser) : null;
}

/** Usuaria dueña del JWT (lo valida el servidor de Auth, sirve con llaves legacy y nuevas). null si no sirve. */
export async function userFromToken(env: SupabaseEnv, token: string): Promise<AuthUser | null> {
  const res = await fetch(`${env.url}/auth/v1/user`, {
    headers: { apikey: env.anonKey ?? env.serviceKey, Authorization: `Bearer ${token}` },
    signal: AbortSignal.timeout(10_000),
  });
  if (res.status >= 400 && res.status < 500) return null;
  if (!res.ok) throw new AuthError(`Auth /user → HTTP ${res.status}`, res.status);
  return toUser(await res.json());
}

/** Usuaria por id (API de administración). null si no existe. */
export async function userById(env: SupabaseEnv, id: string): Promise<AuthUser | null> {
  const res = await fetch(`${env.url}/auth/v1/admin/users/${encodeURIComponent(id)}`, {
    headers: adminHeaders(env),
    signal: AbortSignal.timeout(10_000),
  });
  if (res.status === 404) return null;
  if (!res.ok) throw new AuthError(`Auth admin/users → HTTP ${res.status}`, res.status);
  return toUser(await res.json());
}
