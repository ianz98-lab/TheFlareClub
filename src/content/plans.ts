import type { Plan } from "./types";

/**
 * Membresía (definida por las fundadoras el 30-sep-2026). Ver docs/03-pricing.md.
 * Ambos planes tienen exactamente los mismos beneficios: el anual solo cuesta menos.
 * `checkoutUrl`: link de Recurrente de cada suscripción (con 7 días de prueba) cuando exista.
 */
const FEATURES = [
  "Todas las clases de Movement",
  "Arma tu rutina",
  "Biblioteca de meditaciones",
  "Charlas y sus grabaciones",
  "Workbooks incluidos en membresía",
  "Favoritos y continuar viendo",
  "Nuevo contenido conforme se publique",
];

export const personalPlans: Plan[] = [
  {
    id: "flare-mensual",
    name: "Flare Mensual",
    kind: "personal",
    price: 15,
    currency: "USD",
    period: "mes",
    features: FEATURES,
    finePrint: "Después de los 7 días gratis, tu membresía se renovará automáticamente por USD 15 al mes hasta que decidas cancelarla.",
    cta: "Empezar 7 días gratis",
  },
  {
    id: "flare-anual",
    name: "Flare Anual",
    kind: "personal",
    price: 165,
    currency: "USD",
    period: "año",
    tagline: "Ahorra USD 15 al elegir el plan anual.",
    features: FEATURES,
    finePrint: "Después de los 7 días gratis, tu membresía se renovará automáticamente por USD 165 al año hasta que decidas cancelarla.",
    cta: "Empezar 7 días gratis",
  },
];

export const planById = (id: string) => personalPlans.find((p) => p.id === id);
