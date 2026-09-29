import type { Plan } from "./types";

/** Montos placeholder. Ver docs/03-pricing.md. */
export const personalPlans: Plan[] = [
  {
    id: "flare-mensual",
    name: "Flare Mensual",
    kind: "personal",
    price: 19,
    currency: "USD",
    period: "mes",
    tagline: "Flexibilidad total. Cancela cuando quieras.",
    features: [
      "Todas las clases de Movement",
      "Biblioteca completa de meditaciones",
      "Charlas con expertos",
      "Workbooks de membresía",
      "Favoritos y continuar viendo",
    ],
    cta: "Empezar 7 días gratis",
  },
  {
    id: "flare-anual",
    name: "Flare Anual",
    kind: "personal",
    price: 190,
    currency: "USD",
    period: "año",
    tagline: "Dos meses gratis y acceso anticipado.",
    features: [
      "Todo lo del plan mensual",
      "Acceso anticipado a cursos nuevos",
      "15% de descuento en eventos",
      "Un workbook premium al año",
      "Comunidad privada",
    ],
    highlight: true,
    cta: "Empezar 7 días gratis",
  },
];

export const corporatePlans: Plan[] = [
  {
    id: "corp-team",
    name: "Team",
    kind: "corporate",
    tagline: "Membresías para tu equipo con precio por asiento.",
    features: ["Desde 10 colaboradores", "Precio decreciente por volumen", "Reporte mensual de uso", "Onboarding en vivo"],
    cta: "Cotizar",
  },
  {
    id: "corp-experiencia",
    name: "Experiencia",
    kind: "corporate",
    tagline: "Un evento de bienestar presencial u online.",
    features: ["Pilates, meditación o journaling", "Vision boards y actividades creativas", "Charla con experta invitada", "Materiales incluidos"],
    highlight: true,
    cta: "Cotizar",
  },
  {
    id: "corp-programa",
    name: "Programa anual",
    kind: "corporate",
    tagline: "Bienestar continuo para toda la empresa.",
    features: ["Plataforma para todos los colaboradores", "Sesiones en vivo mensuales", "Charlas trimestrales", "Eventos especiales"],
    cta: "Cotizar",
  },
];
