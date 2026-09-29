export function minutes(sec: number): string {
  return `${Math.round(sec / 60)} min`;
}

export function formatDate(iso: string, opts: Intl.DateTimeFormatOptions = {}): string {
  return new Intl.DateTimeFormat("es-GT", {
    weekday: "short",
    day: "numeric",
    month: "short",
    ...opts,
  }).format(new Date(iso));
}

export function formatDateLong(iso: string): string {
  return new Intl.DateTimeFormat("es-GT", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(iso));
}

export function formatTime(iso: string): string {
  return new Intl.DateTimeFormat("es-GT", { hour: "numeric", minute: "2-digit" }).format(
    new Date(iso),
  );
}

export function formatPrice(amount: number, currency = "USD"): string {
  return new Intl.NumberFormat("es-GT", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

export const ACCESS_LABEL: Record<string, string> = {
  public: "Gratis",
  free: "Gratis con cuenta",
  member: "Membresía",
  paid: "Compra individual",
};
