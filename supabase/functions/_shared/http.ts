/**
 * Respuestas JSON y CORS de las Edge Functions.
 *
 * Solo se responde CORS a los orígenes del sitio. Para sumar otro (p. ej. un preview en
 * Vercel) se usa el secreto ALLOWED_ORIGINS, separado por comas, sin tocar el código.
 */
const DEFAULT_ORIGINS = [
  "https://ianz98-lab.github.io", // prototipo en GitHub Pages (/TheFlareClub)
  "http://localhost:3000", // desarrollo
  "https://theflare.club", // dominio de lanzamiento
  "https://www.theflare.club",
];

/** Headers que manda supabase-js al invocar una función (ver @supabase/supabase-js/cors). */
const ALLOW_HEADERS = [
  "authorization",
  "x-client-info",
  "apikey",
  "content-type",
  "x-region",
  "x-retry-count",
  "traceparent",
  "tracestate",
  "baggage",
].join(", ");

const clean = (origin: string) => origin.trim().replace(/\/+$/, "").toLowerCase();

export function allowedOrigins(): string[] {
  const extra = (Deno.env.get("ALLOWED_ORIGINS") ?? "").split(",").map(clean).filter(Boolean);
  return [...new Set([...DEFAULT_ORIGINS, ...extra])];
}

export function isAllowedOrigin(origin: string | null | undefined): origin is string {
  return Boolean(origin) && allowedOrigins().includes(clean(origin as string));
}

/** CORS para la respuesta; si el origen no es nuestro no se agrega Allow-Origin (el navegador bloquea). */
export function corsHeaders(req: Request): Record<string, string> {
  const origin = req.headers.get("origin");
  const headers: Record<string, string> = {
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": ALLOW_HEADERS,
    "Access-Control-Max-Age": "86400",
    Vary: "Origin",
  };
  if (isAllowedOrigin(origin)) headers["Access-Control-Allow-Origin"] = origin;
  return headers;
}

export function json(body: unknown, status = 200, headers: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...headers, "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" },
  });
}

/** Token de "Authorization: Bearer <jwt>" o null. */
export function bearerToken(req: Request): string | null {
  const value = req.headers.get("authorization") ?? "";
  const match = /^Bearer\s+(.+)$/i.exec(value.trim());
  return match ? match[1].trim() : null;
}
