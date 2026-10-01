import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { FavoriteButton } from "@/components/FavoriteButton";

/**
 * Ancho real de la foto: en la grilla del buscador 2 columnas en móvil, 3 en md y 4 desde lg (tope de
 * .container-x: 88rem); en las filas, 250–290 px en móvil y la grilla de Row desde md.
 */
const SIZES = {
  grid: "(min-width: 1408px) 320px, (min-width: 1024px) 23vw, (min-width: 768px) 31vw, 47vw",
  row: "(min-width: 1408px) 320px, (min-width: 1024px) 23vw, (min-width: 768px) 46vw, 290px",
} as const;

/**
 * Card de contenido: imagen limpia arriba, texto debajo. Sin degradados ni texto sobre foto.
 * El corazón va FUERA del link (un botón dentro de un <a> no es HTML válido y confunde a
 * los lectores de pantalla); se posiciona encima de la esquina de la foto.
 * El título es un encabezado (h3 por defecto) para poder recorrer el listado por títulos.
 */
export function MediaCard({
  href,
  image,
  focal,
  title,
  subtitle,
  meta,
  badges,
  favoriteKey,
  aspect = "aspect-[4/5]",
  size = "grid",
  headingLevel: Heading = "h3",
}: {
  href: string;
  image: string;
  /** object-position de la foto al recortarla (Video.thumbnailFocal, Photo.focal) */
  focal?: string;
  title: string;
  subtitle?: string;
  meta?: string;
  badges?: ReactNode;
  favoriteKey?: string;
  aspect?: string;
  size?: "grid" | "row";
  headingLevel?: "h2" | "h3" | "h4";
}) {
  return (
    <div className={`group relative ${size === "row" ? "w-[250px] sm:w-[290px] md:w-full" : "w-full"}`}>
      <Link href={href} className="block">
        <div className={`card-media relative ${aspect} overflow-hidden rounded-media bg-surface-alt`}>
          <Image src={image} alt="" fill sizes={SIZES[size]} className="object-cover" style={focal ? { objectPosition: focal } : undefined} />
        </div>
        <div className="mt-3">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-ink-muted">
            {meta && <p className="label">{meta}</p>}
            {badges}
          </div>
          <Heading className="mt-1.5 font-display text-display-sm">{title}</Heading>
          {subtitle && <p className="mt-1 line-clamp-2 text-sm text-ink-muted">{subtitle}</p>}
        </div>
      </Link>
      {favoriteKey && (
        // after: agranda el área táctil a ~44 px sin agrandar el ícono
        <FavoriteButton itemKey={favoriteKey} title={title} size="sm" className="absolute right-2 top-2 after:absolute after:-inset-1.5 after:content-['']" />
      )}
    </div>
  );
}
