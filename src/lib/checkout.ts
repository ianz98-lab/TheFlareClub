"use client";

import { planById } from "@/content/plans";
import { getSupabase, siteUrl, supabaseEnabled } from "./supabase";
import { cancelDemoMembership, refreshMembership, startDemoTrial } from "./user-data";

/**
 * Pagos con Recurrente.
 * - Membresías y cursos: la Edge Function `crear-checkout` (supabase/functions) crea un checkout
 *   con la metadata de la usuaria (así el webhook sabe a quién activar) y devuelve la URL.
 *   Requiere sesión iniciada.
 * - Cancelar: la Edge Function `cancelar-membresia` la cancela en Recurrente y en la base; la
 *   usuaria conserva el acceso hasta el final del periodo.
 * - Eventos: link público de Recurrente (`ticketUrl`); el webhook los asocia por correo.
 * - Sin Supabase (prototipo): se simula en el navegador.
 */
export type CheckoutResult = { url?: string; demo?: boolean; error?: string };
export type CancelResult = { ok?: boolean; currentPeriodEnd?: string; error?: string };

/**
 * Mensaje de error que la función manda en el cuerpo (ya en español), si lo hay.
 * Se reconoce por el nombre y no con `instanceof FunctionsHttpError`: importar esa clase
 * metería supabase-js en el paquete inicial de la página (ver supabase.ts).
 */
async function functionError(error: unknown): Promise<string | undefined> {
  if (!(error instanceof Error) || error.name !== "FunctionsHttpError") return undefined;
  const context = (error as Error & { context?: unknown }).context;
  if (!(context instanceof Response)) return undefined;
  const body = (await context.json().catch(() => null)) as { error?: string } | null;
  return body?.error || undefined;
}

export async function startMembershipCheckout(planId: string): Promise<CheckoutResult> {
  const plan = planById(planId);
  if (!plan) return { error: "Ese plan no existe." };
  if (!supabaseEnabled) {
    startDemoTrial(planId);
    return { demo: true };
  }
  const sb = (await getSupabase())!;
  const { data, error } = await sb.functions.invoke<{ url?: string }>("crear-checkout", {
    body: { kind: "plan", plan: planId, successUrl: siteUrl("/cuenta/?pago=ok"), cancelUrl: siteUrl("/membresia/?pago=cancelado") },
  });
  if (!error && data?.url) return { url: data.url };
  // La función responde errores con mensaje para la usuaria (ya tienes membresía, confirma tu correo…).
  const message = await functionError(error);
  if (message) return { error: message };
  // Función aún sin desplegar: si el plan ya tiene link público de Recurrente, se usa ese.
  if (plan.checkoutUrl) return { url: plan.checkoutUrl };
  return { error: "Estamos terminando de activar los pagos. Tu cuenta ya quedó creada: te avisaremos por correo cuando puedas empezar tu prueba." };
}

/** Cancela la membresía de la usuaria con sesión. Responde hasta cuándo conserva el acceso. */
export async function cancelMembership(): Promise<CancelResult> {
  if (!supabaseEnabled) return cancelDemoMembership();
  const sb = (await getSupabase())!;
  const { data, error } = await sb.functions.invoke<CancelResult>("cancelar-membresia", { method: "POST", body: {} });
  if (!error && data?.ok) {
    refreshMembership();
    return { ok: true, currentPeriodEnd: data.currentPeriodEnd };
  }
  const message = (await functionError(error)) ?? data?.error;
  return { error: message ?? "No pudimos cancelar tu membresía en este momento. Intenta de nuevo en unos minutos." };
}
