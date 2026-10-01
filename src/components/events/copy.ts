/**
 * Textos de la compra de entradas (Recurrente). Sin "use client": los usan la ficha del evento
 * (componente de servidor) y EventTicket.
 */
export const TICKET_COPY = {
  /** Junto al botón de compra: el pago sale del sitio. */
  newTab: "Se abre Recurrente en una pestaña nueva.",
  /** Sin sesión: no hace falta cuenta para comprar. */
  noAccount: "No necesitas cuenta para comprar.",
  /** El webhook de Recurrente asocia la entrada a la cuenta por correo: con otro correo no aparece en Mi cuenta. */
  sameEmail: "Si ya tienes una, paga con ese mismo correo y tu entrada aparecerá en Mi cuenta.",
} as const;
