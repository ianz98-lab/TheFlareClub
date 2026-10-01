import type { Metadata } from "next";
import type { Photo } from "@/content/types";
import {
  ABOUT_PHOTOS,
  CORPORATE_HERO,
  CORPORATE_PHOTOS,
  EVENT_COVERS,
  EVENT_GALLERIES,
  MEDITATION_PHOTOS,
  STUDIO_PHOTOS,
  WORKBOOK_COVER,
} from "@/content/media";
import { hasVariants, variantPath } from "./image-variants";

/**
 * Metadatos por página: título, descripción, canonical y vista previa al compartir (og y
 * twitter) en un solo llamado. Next NO mezcla el `openGraph` de una página con el del layout
 * (lo reemplaza entero): por eso cada página arma el suyo completo con `pageMetadata`.
 *
 * Rutas e imágenes van crudas ("/eventos/…", "/images/…"): Next las une con `metadataBase`
 * (que en GitHub Pages ya incluye /TheFlareClub) y agrega la barra final si el sitio la usa.
 * Nunca pasar por assetUrl: duplica el basePath.
 */

export const SITE_NAME = "The Flare Club";

/** Dominio público. En Pages lo define el workflow (NEXT_PUBLIC_SITE_URL); el respaldo es el dominio final. */
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://theflare.club";

/** Foto por defecto al compartir: las fundadoras. */
export const DEFAULT_SHARE_PHOTO: Photo = {
  src: "/images/fundadoras-mariana-sofi-estudio.jpg",
  width: 2400,
  height: 1416,
  alt: "Mariana y Sofi Wer, fundadoras de The Flare Club",
};

/** Ancho de la variante JPEG que se comparte (WhatsApp e Instagram no siempre leen WebP). */
const SHARE_WIDTH = 1600;

type ShareImage = Photo | string;

export interface PageMeta {
  /** Título sin la marca: el layout agrega " · The Flare Club" (`template`). */
  title: string;
  /** Usar `title` tal cual, sin la marca al final (Inicio). */
  absoluteTitle?: boolean;
  description: string;
  /** Ruta canónica sin basePath: "/movement", "/eventos/night-edition-vol-1-oct-2026". Se ignoran query y hash. */
  path: string;
  /**
   * Foto al compartir: una Photo de media.ts (con medidas), una ruta de /images o una URL
   * absoluta (portada de Spotify). Por defecto, las fundadoras. Para clases y meditaciones,
   * el póster de su video.
   */
  image?: ShareImage;
  /** "article" para piezas con fecha (episodio, charla). */
  type?: "website" | "article";
}

/**
 * Inventario de media.ts por ruta: una página que pasa solo la ruta (el póster de un video, que en
 * videos.ts es un string) igual publica ancho y alto. Sin medidas, WhatsApp recorta mal la foto vertical.
 */
const PHOTO_BY_SRC = new Map<string, Photo>(
  [
    ...Object.values(EVENT_COVERS),
    ...Object.values(EVENT_GALLERIES).flat(),
    ...MEDITATION_PHOTOS,
    ...CORPORATE_PHOTOS,
    ...ABOUT_PHOTOS,
    ...Object.values(STUDIO_PHOTOS),
    WORKBOOK_COVER,
    CORPORATE_HERO,
  ].map((p) => [p.src, p]),
);

/** Imagen para og/twitter: la variante JPEG de 1600 px si la foto es local, siempre con medidas si se conocen. */
export function shareImage(image: ShareImage, alt: string): { url: string; width?: number; height?: number; alt: string } {
  const photo: Photo | null = typeof image === "string" ? (PHOTO_BY_SRC.get(image) ?? null) : image;
  const src = photo ? photo.src : (image as string);
  if (!hasVariants(src)) return { url: src, alt: photo?.alt ?? alt, ...(photo ? { width: photo.width, height: photo.height } : {}) };
  const url = variantPath(src, SHARE_WIDTH, "jpg");
  if (!photo) return { url, alt };
  // La variante no agranda: si la original es más angosta, conserva su tamaño.
  const width = Math.min(photo.width, SHARE_WIDTH);
  return { url, width, height: Math.round((photo.height * width) / photo.width), alt: photo.alt ?? alt };
}

/** "/movement?duration=5#clases" → "/movement". */
function canonicalPath(path: string): string {
  const clean = path.split(/[?#]/)[0] || "/";
  return clean.startsWith("/") ? clean : `/${clean}`;
}

export function pageMetadata({ title, absoluteTitle, description, path, image = DEFAULT_SHARE_PHOTO, type = "website" }: PageMeta): Metadata {
  const url = canonicalPath(path);
  const fullTitle = absoluteTitle ? title : `${title} · ${SITE_NAME}`;
  const images = [shareImage(image, title)];
  return {
    title: absoluteTitle ? { absolute: title } : title,
    description,
    alternates: { canonical: url },
    openGraph: { type, title: fullTitle, description, url, siteName: SITE_NAME, locale: "es_GT", images },
    twitter: { card: "summary_large_image", title: fullTitle, description, images },
  };
}
