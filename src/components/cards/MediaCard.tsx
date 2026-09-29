import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { Icon } from "@/components/ui/Icon";
import { FavoriteButton } from "@/components/FavoriteButton";

/**
 * Card genérica de contenido con imagen. La usan clases, meditaciones, charlas, cursos.
 * Vertical en carruseles móviles, se adapta en grids.
 */
export function MediaCard({
  href,
  image,
  title,
  subtitle,
  meta,
  badges,
  favoriteKey,
  aspect = "aspect-[4/5]",
  size = "grid",
  overlay,
}: {
  href: string;
  image: string;
  title: string;
  subtitle?: string;
  meta?: string;
  badges?: ReactNode;
  favoriteKey?: string;
  aspect?: string;
  size?: "grid" | "row";
  overlay?: ReactNode;
}) {
  return (
    <Link
      href={href}
      className={`group relative block ${size === "row" ? "w-[220px] sm:w-[250px]" : "w-full"}`}
    >
      <div className={`relative ${aspect} overflow-hidden rounded-2xl bg-cream-deep shadow-card`}>
        <Image
          src={image}
          alt=""
          fill
          sizes="(min-width: 1024px) 300px, (min-width: 640px) 45vw, 70vw"
          className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-espresso/75 via-espresso/5 to-transparent" />
        {badges && <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">{badges}</div>}
        {favoriteKey && (
          <FavoriteButton itemKey={favoriteKey} size="sm" className="absolute right-3 top-3" />
        )}
        <span className="absolute right-3 bottom-3 flex h-10 w-10 items-center justify-center rounded-full bg-cream text-espresso opacity-0 shadow-soft transition-opacity group-hover:opacity-100">
          <Icon name="play" size={18} className="ml-0.5" />
        </span>
        <div className="absolute inset-x-3 bottom-3 pr-12 text-cream">
          {meta && (
            <p className="mb-1 flex items-center gap-1 text-[11px] uppercase tracking-[0.16em] text-cream/85">
              {meta}
            </p>
          )}
          <p className="font-display text-xl leading-tight sm:text-[22px]">{title}</p>
          {subtitle && <p className="clamp-2 mt-1 text-[13px] text-cream/85">{subtitle}</p>}
        </div>
        {overlay}
      </div>
    </Link>
  );
}
