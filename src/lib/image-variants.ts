/**
 * Variantes de las fotos de public/images para el sitio estático (GitHub Pages no tiene
 * optimizador de imágenes). Las genera scripts/fotos/variantes.mjs antes de cada build:
 * - WebP en cada ancho de VARIANT_WIDTHS: `foto.w640.webp`. Es lo que pide el loader.
 * - JPEG de respaldo en los anchos hasta 1600: `foto.w1600.jpg` (og:image y descargas).
 * Si cambias los anchos, cámbialos también en variantes.mjs y en next.config.ts (deviceSizes).
 */
export const VARIANT_WIDTHS = [480, 640, 960, 1200, 1600, 2400] as const;
export const JPEG_WIDTHS = [480, 640, 960, 1200, 1600] as const;

const VARIANT = /\.w\d+\.(jpg|webp)$/;

/** Foto local con variantes: una .jpg de /images que no sea ya una variante. */
export const hasVariants = (src: string) => src.startsWith("/images/") && src.endsWith(".jpg") && !VARIANT.test(src);

/**
 * Ruta (sin basePath) de la variante más chica que cubre `width`. WebP por defecto; con
 * `format: "jpg"`, el respaldo JPEG (máximo 1600). Si la foto no tiene variantes, la ruta tal cual.
 */
export function variantPath(src: string, width: number, format: "webp" | "jpg" = "webp"): string {
  if (!hasVariants(src)) return src;
  const widths: readonly number[] = format === "jpg" ? JPEG_WIDTHS : VARIANT_WIDTHS;
  const w = widths.find((x) => x >= width) ?? widths[widths.length - 1];
  return `${src.slice(0, -4)}.w${w}.${format}`;
}

/*
 * Portadas de Spotify (podcast): el mismo id existe en 64, 300 y 640 px; cambia el prefijo.
 * Así una miniatura de 88 px no baja la de 640 (80 KB).
 */
const SPOTIFY = /^https:\/\/i\.scdn\.co\/image\/ab676563(0000f68d|00005f1f|0000ba8a)([0-9a-f]+)$/;
const SPOTIFY_SIZES = [
  [64, "0000f68d"],
  [300, "00005f1f"],
  [640, "0000ba8a"],
] as const;

export function spotifyImage(src: string, width: number): string {
  const m = SPOTIFY.exec(src);
  if (!m) return src;
  const size = SPOTIFY_SIZES.find(([w]) => w >= width) ?? SPOTIFY_SIZES[SPOTIFY_SIZES.length - 1];
  return `https://i.scdn.co/image/ab676563${size[1]}${m[2]}`;
}
