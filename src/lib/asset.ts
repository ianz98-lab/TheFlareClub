/**
 * Ruta a un archivo de /public para <a href> o descargas (PDF, etc.).
 * next/image y next/link ya agregan el basePath de GitHub Pages; un <a> normal no.
 *
 * Solo para el HTML. En metadatos (og:image, canonical) NO: Next ya une la ruta cruda
 * ("/images/…") con `metadataBase`, que en Pages incluye /TheFlareClub; con assetUrl la ruta
 * sale duplicada y la vista previa al compartir queda sin imagen. Para eso, `pageMetadata`
 * de src/lib/seo.ts.
 */
export function assetUrl(path: string): string {
  if (!path.startsWith("/")) return path;
  return `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}${path}`;
}
