"use client";

import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Cliente de Supabase para el navegador. El sitio se exporta estático (GitHub Pages),
 * así que todo lo de cuentas corre en el cliente con la llave pública + RLS.
 * Si faltan las variables, la app funciona en "modo demo" (todo se guarda en el navegador).
 *
 * supabase-js (~60 KB) se carga aparte y solo si hay Supabase: en modo demo nunca se
 * descarga. Por eso `getSupabase()` es async; para decidir algo sin esperar (demo o no),
 * usar `supabaseEnabled`. Desde otros módulos, los tipos van con `import type`.
 */
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabaseEnabled = Boolean(url && key);

let client: Promise<SupabaseClient> | null = null;

export function getSupabase(): Promise<SupabaseClient | null> {
  if (!supabaseEnabled) return Promise.resolve(null);
  client ??= import("@supabase/supabase-js")
    .then(({ createClient }) =>
      createClient(url!, key!, {
        auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true, flowType: "pkce" },
      }),
    )
    .catch((err: unknown) => {
      // Si falló la descarga (red), el próximo intento vuelve a pedirla.
      client = null;
      throw err;
    });
  return client;
}

/** URL absoluta dentro del sitio (respeta el basePath de GitHub Pages). Para redirects de correo. */
export function siteUrl(path: string): string {
  const base = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
  const origin = typeof window === "undefined" ? (process.env.NEXT_PUBLIC_SITE_URL ?? "") : window.location.origin;
  return `${origin}${base}${path}`;
}
