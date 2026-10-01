"use client";

import type { ImageLoaderProps } from "next/image";
import { spotifyImage, variantPath } from "./image-variants";

/**
 * Loader de next/image para el export estático (GitHub Pages no optimiza imágenes).
 * - Fotos de /images: la variante WebP más chica que cubre el ancho pedido (ver image-variants.ts).
 *   Nunca baja la original: hasta 2400 px hay variante.
 * - Portadas de Spotify: el tamaño de 64, 300 o 640 px según el ancho.
 * Antepone el basePath a las rutas locales.
 */
export default function imageLoader({ src, width }: ImageLoaderProps): string {
  if (!src.startsWith("/")) return spotifyImage(src, width);
  return `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}${variantPath(src, width)}`;
}
