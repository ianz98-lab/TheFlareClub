/**
 * Colores de la marca para donde no llega CSS (meta theme-color, manifest, el embed de Vimeo).
 * Son copia de los tokens de src/app/globals.css: si cambia uno, cambiar el otro (scripts/marca/iconos.py
 * también copia surface y espresso). En componentes, usar siempre las clases de Tailwind (bg-surface,
 * text-ink…), nunca estos valores.
 */
export const BRAND_COLORS = {
  surface: "#f6f5f3",
  espresso: "#2f2823",
  /** Terracota para texto chico y la acción principal: los controles del player de Vimeo (src/lib/video.ts). */
  accentInk: "#8f4d36",
} as const;

/** Color de la barra del navegador en el celular: el fondo del sitio. */
export const THEME_COLOR = BRAND_COLORS.surface;
