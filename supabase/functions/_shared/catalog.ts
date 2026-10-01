/**
 * Lo que cobra Recurrente. Tiene que coincidir con lo que muestra la web
 * (src/content/plans.ts y docs/03-pricing.md): si cambia un precio, cámbialo en los dos
 * lados y vuelve a desplegar las funciones. El precio vive aquí (servidor) para que nadie
 * pueda mandar otro monto desde el navegador.
 */
export type PlanSlug = "flare-mensual" | "flare-anual";
export type Interval = "month" | "year";
export type Currency = "USD" | "GTQ";

export interface PlanPrice {
  /** Nombre que ve la usuaria en el checkout y en su factura. */
  name: string;
  amountCents: number;
  currency: Currency;
  interval: Interval;
}

export const PLANS: Record<PlanSlug, PlanPrice> = {
  "flare-mensual": { name: "The Flare Club · Flare Mensual", amountCents: 1500, currency: "USD", interval: "month" },
  "flare-anual": { name: "The Flare Club · Flare Anual", amountCents: 16500, currency: "USD", interval: "year" },
};

/** Prueba gratis de 7 días. Recurrente no acepta días como intervalo: 7 días = 1 semana. */
export const TRIAL = { interval: "week", count: 1, days: 7 } as const;

/**
 * Una sola prueba gratis por cuenta: si la usuaria ya tuvo una membresía (aunque la haya
 * cancelado), el nuevo checkout cobra desde el primer día. Pendiente de confirmar con las fundadoras.
 */
export const ONE_TRIAL_PER_ACCOUNT = true;

export interface ItemPrice {
  name: string;
  amountCents: number;
  currency: Currency;
}

/**
 * Cursos a la venta (pago único, aparte de la membresía). Vacío mientras están
 * "Próximamente". Para vender uno: `"<slug>": { name, amountCents, currency }` con el
 * mismo slug de src/content/courses.ts.
 */
export const COURSES: Record<string, ItemPrice> = {};

export const isPlanSlug = (v: unknown): v is PlanSlug =>
  typeof v === "string" && Object.prototype.hasOwnProperty.call(PLANS, v);

/** Claves de compra, iguales a purchases.item_key: course:<slug> | event:<slug> | workbook:<slug>. */
export const ITEM_KEY = /^(course|event|workbook):[a-z0-9][a-z0-9-]{0,150}$/;

/** Fin de periodo aproximado (solo si Recurrente no manda current_period_end). */
export function addInterval(from: Date, interval: Interval): Date {
  const d = new Date(from.getTime());
  if (interval === "month") d.setUTCMonth(d.getUTCMonth() + 1);
  else d.setUTCFullYear(d.getUTCFullYear() + 1);
  return d;
}

export function trialEndsAt(from: Date): string {
  return new Date(from.getTime() + TRIAL.days * 86_400_000).toISOString();
}

/**
 * Hasta cuándo conserva el acceso una membresía cancelada: el fin del periodo pagado o, si
 * la canceló en la prueba gratis, el fin de la prueba (la fecha más lejana de las dos).
 * Al cancelar se guarda en `current_period_end`, así la regla de acceso es una sola:
 * status = 'canceled' and current_period_end > now().
 */
export function accessUntil(row: { current_period_end: string | null; trial_ends_at: string | null }): string | null {
  const dates = [row.current_period_end, row.trial_ends_at].filter((d): d is string => Boolean(d) && Number.isFinite(Date.parse(d as string)));
  if (!dates.length) return null;
  return dates.reduce((a, b) => (Date.parse(b) > Date.parse(a) ? b : a));
}
