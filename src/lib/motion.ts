/**
 * Tokens de motion: una sola curva y pocas duraciones para todo el sitio (antes había la curva
 * copiada en 9 lugares y 12 duraciones). Este archivo es la fuente: en CSS son `--ease-out-quint`
 * (clase `ease-out-quint`) y `--duration-fast|base|slow|media|settle` en :root de src/app/globals.css
 * (clase `duration-(--duration-base)`). Si cambia un valor aquí, cambiarlo allá.
 *
 * Vocabulario (ver src/components/motion/Reveal.tsx):
 * - Fotos: cortina que sube (clip-path) con un leve zoom de 1.06 a 1.
 * - Titulares: suben 0.4em por líneas, sin blur.
 * - Filas de lista: solo opacidad, 40 ms entre filas y 250 ms en total.
 * - Párrafos largos, biografías y formularios: sin animación de entrada.
 * Con "reducir movimiento" nada se desplaza: solo cambios de opacidad cortos, o nada.
 */

/** Curva de salida para motion (`ease`). */
export const EASE_OUT = [0.22, 1, 0.36, 1] as const;
/** La misma curva para CSS y Web Animations (`easing`). */
export const EASE_OUT_CSS = "cubic-bezier(0.22, 1, 0.36, 1)";

/** Duraciones en segundos (motion). Para Web Animations usar `ms()`. Copia en CSS: --duration-*. */
export const DUR = {
  /** Estados: presionado, foco, desvanecer con movimiento reducido. */
  fast: 0.2,
  /** Header que se oculta, overlays, menús, hojas, cambios de lista y transición entre páginas. */
  base: 0.45,
  /** Entradas de texto y bloques (Reveal). */
  slow: 0.7,
  /** Fotos: la cortina de RevealImage. */
  media: 0.8,
  /** Zoom de la foto bajo la cortina (termina después, para que se asiente). */
  settle: 1.2,
} as const;

export const ms = (seconds: number) => Math.round(seconds * 1000);

/** Cascada de filas: 40 ms entre filas, como máximo 250 ms en total. */
export const STAGGER = { step: 0.04, max: 0.25 } as const;

/** Distancias de entrada. */
export const RISE = {
  /** Titulares: por líneas, relativo a su tamaño de letra. */
  heading: "0.4em",
  /** Bloques cortos (tarjetas, CTAs). */
  block: "1rem",
  /** Página nueva al navegar, en px. */
  page: 12,
} as const;

/** Resortes para motion (`transition`). */
export const SPRING = {
  /** Indicadores que se deslizan (pestaña activa del buscador). */
  snappy: { type: "spring", stiffness: 500, damping: 40 },
  /** Hojas y paneles que entran desde un borde (filtros, menú). */
  sheet: { type: "spring", stiffness: 380, damping: 38 },
} as const;

/** "Reducir movimiento" del sistema. En el servidor responde false. */
export function prefersReducedMotion(): boolean {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
