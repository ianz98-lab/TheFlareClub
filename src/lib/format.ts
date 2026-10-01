export function minutes(sec: number): string {
  return `${Math.round(sec / 60)} min`;
}

/**
 * "2026-06-15" se ancla al mediodía de Guatemala (UTC-6, sin horario de verano): así el día es el
 * mismo en cualquier navegador (con new Date() a secas sería UTC y saldría el día anterior).
 */
export function toDate(iso: string): Date {
  return new Date(/^\d{4}-\d{2}-\d{2}$/.test(iso) ? `${iso}T12:00:00-06:00` : iso);
}

/**
 * Siempre en hora de Guatemala: el sitio se genera en servidores con hora UTC y sin esto
 * un evento de las 6 p. m. saldría al día siguiente.
 */
export const TZ = "America/Guatemala";

export function formatDate(iso: string, opts: Intl.DateTimeFormatOptions = {}): string {
  return new Intl.DateTimeFormat("es-GT", {
    timeZone: TZ,
    weekday: "short",
    day: "numeric",
    month: "short",
    ...opts,
  }).format(toDate(iso));
}

export function formatDateLong(iso: string): string {
  return new Intl.DateTimeFormat("es-GT", {
    timeZone: TZ,
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(toDate(iso));
}

const NBSP = "\u00a0";

/** Hora y "a. m." / "p. m." por separado, en hora de Guatemala. Sin ":00" en las horas en punto. */
function timeParts(iso: string): { time: string; period: string } {
  const parts = new Intl.DateTimeFormat("es-GT", { timeZone: TZ, hour: "numeric", minute: "2-digit", hour12: true }).formatToParts(new Date(iso));
  const get = (type: Intl.DateTimeFormatPartTypes) => parts.find((p) => p.type === type)?.value ?? "";
  const minute = get("minute");
  const time = minute && minute !== "00" ? `${get("hour")}:${minute}` : get("hour");
  return { time, period: get("dayPeriod").toLowerCase().replace(/\s/g, NBSP) };
}

/**
 * "6 p. m." / "6:30 p. m.": compacta, en minúscula y con espacios duros (nunca se parte en dos
 * líneas). Mostrarla fuera de `.label`: las versalitas la vuelven "P. M.".
 */
export function formatTime(iso: string): string {
  const { time, period } = timeParts(iso);
  return `${time}${NBSP}${period}`;
}

/**
 * Rango de horas de un evento: "6 a 9 p. m." si comparten a. m./p. m.; si no, "11 a. m. a 2 p. m.".
 * Sin `end`, solo la hora de inicio. Solo puede partirse antes de la "a".
 */
export function formatTimeRange(start: string, end?: string): string {
  if (!end) return formatTime(start);
  const a = timeParts(start);
  const b = timeParts(end);
  const from = a.period === b.period ? a.time : formatTime(start);
  return `${from} a${NBSP}${formatTime(end)}`;
}

/** Día y mes por separado (para tarjetas de evento con el número grande). */
export function dateParts(iso: string): { day: string; month: string; weekday: string; year: string } {
  const d = toDate(iso);
  const f = (o: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat("es-GT", { timeZone: TZ, ...o }).format(d);
  return { day: f({ day: "numeric" }), month: f({ month: "long" }), weekday: f({ weekday: "long" }), year: f({ year: "numeric" }) };
}

/** Q450 · USD 15 (formato de la marca: "Q" pegado al monto; dólares con "USD") */
export function formatPrice(amount: number, currency = "USD"): string {
  const n = new Intl.NumberFormat("es-GT", { maximumFractionDigits: 0 }).format(amount);
  return currency === "GTQ" ? `Q${n}` : `${currency} ${n}`;
}

export const ACCESS_LABEL: Record<string, string> = {
  public: "Gratis",
  free: "Gratis con cuenta",
  member: "Membresía",
  paid: "Compra individual",
};
