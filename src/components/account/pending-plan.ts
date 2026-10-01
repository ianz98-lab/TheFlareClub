"use client";

import { planById } from "@/content/plans";
import { readLocal, useLocal, writeLocal } from "@/lib/local-store";
import { PENDING_PLAN_KEY } from "@/lib/user-data";

/**
 * Plan elegido antes de crear la cuenta. Si hay que confirmar el correo, la usuaria sale del
 * sitio y vuelve desde el enlace: guardamos el plan para ofrecerle "Continuar con {plan}" en Mi cuenta.
 * Se borra al cerrar sesión (src/lib/user-data.ts) y al volver de pagar.
 */
export function savePendingPlan(planId: string) {
  if (planById(planId)) writeLocal<string | null>(PENDING_PLAN_KEY, planId);
}

export function clearPendingPlan() {
  if (readLocal<string | null>(PENDING_PLAN_KEY, null) !== null) writeLocal<string | null>(PENDING_PLAN_KEY, null);
}

/** Plan pendiente válido (o undefined). */
export function usePendingPlan() {
  const id = useLocal<string | null>(PENDING_PLAN_KEY, null);
  return id ? planById(id) : undefined;
}

const LOCAL_ORIGIN = "https://local.invalid";

/**
 * `next` solo puede ser una ruta interna (evita redirecciones a otros sitios). Se rechazan los
 * caracteres de control y la barra invertida (el navegador los quita o los cambia por "/", y
 * "/\t/sitio.com" terminaría en otro dominio) y se confirma el origen parseando la URL.
 */
export function safeNext(raw: string | null | undefined, fallback = "/cuenta"): string {
  if (!raw || /[\u0000-\u001F\u007F\\]/.test(raw) || !raw.startsWith("/") || raw.startsWith("//")) return fallback;
  try {
    const u = new URL(raw, LOCAL_ORIGIN);
    const out = u.pathname + u.search + u.hash;
    // Se revisa el resultado YA normalizado: "/.//x" o "/..//x" quedan como "//x" (otro dominio).
    return u.origin === LOCAL_ORIGIN && !out.startsWith("//") ? out : fallback;
  } catch {
    return fallback;
  }
}
