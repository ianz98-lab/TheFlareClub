/**
 * Clases de botón, sin React: sirven en componentes de servidor y de cliente, y para dar forma de botón
 * a otros elementos (<a> de descarga, <label>, <summary>). Los componentes están en ./Button.tsx.
 *
 * Decisión D3-B de Ian (30-sep): texto normal de 15 px en peso medio (se lee de lejos con el celular en el
 * piso), radio único de 6 px y la acción principal en el acento terracota (D2-C).
 * Los contornos van por rol (ink, line-input, press): dentro de .on-dark se invierten solos.
 */

export type ButtonVariant =
  | "primary" // sólido terracota (accent-ink): la acción principal, una por pantalla
  | "outline" // contorno en tinta: secundaria
  | "outline-soft" // contorno suave: secundaria junto a otro outline (Anterior / Siguiente)
  | "outline-on-dark" // contorno claro sobre espresso (player, constructor, bloques oscuros); va dentro de .on-dark
  | "light"; // sólido claro sobre espresso

/** Alto mínimo (crece si el texto se parte) y padding. sm 44 · md 48 · lg 52 · xl 56 px. */
export type ButtonSize = "sm" | "md" | "lg" | "xl";

const BASE =
  "inline-flex items-center justify-center gap-2 rounded-control text-center text-body-sm font-medium leading-tight transition-colors " +
  // Respuesta al presionar (táctil y mouse); sin desplazamiento si se pidió reducir el movimiento
  "active:translate-y-px motion-reduce:active:translate-y-0 " +
  // Deshabilitado y "ocupado" (aria-disabled conserva el foco) se ven igual
  "disabled:pointer-events-none disabled:opacity-(--opacity-disabled) aria-disabled:pointer-events-none aria-disabled:opacity-(--opacity-disabled)";

const VARIANTS: Record<ButtonVariant, string> = {
  // Blanco sobre accent-ink: 6.4:1. Al pasar/presionar baja a espresso (13:1).
  primary: "bg-accent-ink text-on-accent hover:bg-espresso active:bg-espresso",
  // Con mouse, presionar mantiene el relleno del hover; en táctil (sin hover) se tiñe
  outline: "border border-ink text-ink hover:bg-ink hover:text-on-ink pointer-coarse:active:bg-press",
  "outline-soft": "border border-line-strong text-ink hover:border-ink active:bg-press",
  // En .on-dark, line-input es surface al 55 %: 4.9:1 sobre espresso
  "outline-on-dark": "border border-line-input text-ink hover:bg-ink hover:text-on-ink pointer-coarse:active:bg-press",
  light: "bg-surface text-espresso hover:bg-surface-alt active:bg-surface-alt",
};

const SIZES: Record<ButtonSize, string> = {
  sm: "min-h-11 px-4",
  md: "min-h-12 px-5",
  lg: "min-h-13 px-6 sm:px-7",
  xl: "min-h-14 px-6 sm:px-8",
};

export interface ButtonClassOptions {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /**
   * Sin `wrap` el texto va en una línea desde 640 px y en el celular puede partirse (antes que
   * desbordar a 320 px). Con `wrap` se parte en todos los anchos (botones a todo el ancho con texto largo).
   */
  wrap?: boolean;
  className?: string;
}

export function buttonClass({ variant = "primary", size = "md", wrap = false, className = "" }: ButtonClassOptions = {}): string {
  const wrapping = wrap ? "text-balance" : "max-sm:text-balance sm:whitespace-nowrap";
  return `${BASE} ${VARIANTS[variant]} ${SIZES[size]} py-2 ${wrapping} ${className}`.replace(/\s+/g, " ").trim();
}
