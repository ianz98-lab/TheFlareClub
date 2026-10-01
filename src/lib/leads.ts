"use client";

import { reportError } from "./report";
import { getSupabase, supabaseEnabled } from "./supabase";

/**
 * Formularios públicos (cotizaciones, listas de espera, avisos por correo).
 * Se guardan en la tabla `leads` de Supabase (solo inserción pública, ver migración 0002).
 * Sin Supabase configurado (prototipo) NO se envían ni se guardan: `submitLead` responde
 * `{ demo: true }` y el formulario lo dice con LEAD_DEMO (nunca se finge el envío).
 */
export type LeadKind = "corporativo" | "lista-espera-cursos" | "notificaciones-charlas" | "lista-espera-evento";

export interface LeadInput {
  kind: LeadKind;
  email: string;
  name?: string;
  company?: string;
  phone?: string;
  message?: string;
  /** de dónde vino: slug del evento, página, etc. */
  source?: string;
  /**
   * Campo trampa (honeypot): va oculto en el formulario, así que una persona nunca lo llena.
   * Si llega con algo, es un bot: se finge el envío sin guardar nada.
   */
  website?: string;
}

/** Hay a dónde mandar los formularios. En false (prototipo), mostrar LEAD_DEMO.notice bajo el botón. */
export const leadsLive = supabaseEnabled;

/** Textos honestos del modo demo: bajo el botón antes de enviar, y debajo del texto de gracias al terminar. */
export const LEAD_DEMO = {
  notice: "Modo demo: este formulario todavía no nos llega.",
  sent: "Modo demo: tu solicitud no se envió.",
} as const;

/**
 * `demo`: no hay Supabase y no se envió nada (mostrar LEAD_DEMO.sent).
 * Sin `error` ni `demo`: llegó.
 */
export type LeadResult = { error?: string; demo?: boolean };

/** Largos máximos: los mismos CHECK de la tabla `leads` (0002_cuentas.sql). Úsalos como maxLength. */
export const LEAD_LIMITS = { email: 254, name: 200, company: 200, phone: 40, message: 5000, source: 200 } as const;

const FIELD_NAME: Record<keyof typeof LEAD_LIMITS, string> = {
  email: "tu correo",
  name: "tu nombre",
  company: "el nombre de la empresa",
  phone: "tu teléfono",
  message: "tu mensaje",
  source: "el origen",
};

/** Validación del correo con mensajes en español; `null` si está bien. Misma regla que el CHECK de la tabla. */
export function emailError(value: string): string | null {
  const email = value.trim();
  if (!email) return "Escribe tu correo.";
  if (email.length > LEAD_LIMITS.email) return `Revisa tu correo: admite hasta ${LEAD_LIMITS.email} caracteres.`;
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return "Ese correo no parece válido. Revísalo.";
  return null;
}

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function submitLead(input: LeadInput): Promise<LeadResult> {
  const invalid = emailError(input.email);
  if (invalid) return { error: invalid };

  // Bot: respuesta de éxito normal (con la misma espera) para que no sepa que lo detectamos.
  if (input.website?.trim()) {
    await wait(500);
    return {};
  }

  const row = {
    kind: input.kind,
    email: input.email.trim(),
    name: input.name?.trim() || null,
    company: input.company?.trim() || null,
    phone: input.phone?.trim() || null,
    message: input.message?.trim() || null,
    source: input.source?.trim() || null,
  };

  // Mismos límites que la tabla, con un mensaje que dice qué campo corregir (en vez del genérico).
  for (const field of Object.keys(LEAD_LIMITS) as (keyof typeof LEAD_LIMITS)[]) {
    const max = LEAD_LIMITS[field];
    if ((row[field]?.length ?? 0) > max) return { error: `Revisa ${FIELD_NAME[field]}: admite hasta ${max} caracteres.` };
  }

  // Prototipo sin base: no se guarda nada (tampoco en el navegador: son datos personales).
  if (!supabaseEnabled) return { demo: true };

  try {
    const sb = await getSupabase();
    const { error } = await sb!.from("leads").insert(row);
    if (!error) return {};
    reportError("leads", error);
    // 23514 = falló un CHECK de la tabla (formato o largo de algún campo).
    if (error.code === "23514") return { error: "Revisa tus datos: algún campo es demasiado largo o no tiene el formato correcto." };
  } catch (e) {
    reportError("leads", e);
  }
  return { error: "No pudimos enviar tus datos. Intenta de nuevo en un momento." };
}
