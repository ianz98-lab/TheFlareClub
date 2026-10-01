/**
 * Lectura tolerante de payloads (los de Recurrente cambian de forma según el evento).
 * Nada de `as` a ciegas: cada campo se valida al leerlo.
 */
export type Json = Record<string, unknown>;

export const asObj = (v: unknown): Json | null =>
  v !== null && typeof v === "object" && !Array.isArray(v) ? (v as Json) : null;

export const asArr = (v: unknown): unknown[] => (Array.isArray(v) ? v : []);

export const str = (v: unknown): string | null => (typeof v === "string" && v.trim() ? v.trim() : null);

export const num = (v: unknown): number | null => (typeof v === "number" && Number.isFinite(v) ? v : null);

const EMAIL = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
/** Correo normalizado (minúsculas) o null si no parece un correo. */
export const email = (v: unknown): string | null => {
  const s = str(v)?.toLowerCase() ?? null;
  return s && s.length <= 254 && EMAIL.test(s) ? s : null;
};

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export const uuid = (v: unknown): string | null => {
  const s = str(v);
  return s && UUID.test(s) ? s.toLowerCase() : null;
};

export const errorMessage = (err: unknown): string => (err instanceof Error ? err.message : String(err));
