import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { FavoriteButton } from "@/components/FavoriteButton";

/**
 * Card de contenido: imagen limpia arriba, texto debajo. Sin degradados ni texto sobre foto.
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
    <Link href={href} className={`group block ${size === "row" ? "w-[250px] sm:w-[290px] md:w-full" : "w-full"}`}>
      <div className={`relative ${aspect} overflow-hidden rounded-xs bg-cream-deep`}>
        <Image
          src={image}
          alt=""
          fill
          sizes="(min-width: 1024px) 320px, (min-width: 640px) 45vw, 70vw"
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
        />
        {favoriteKey && <FavoriteButton itemKey={favoriteKey} size="sm" className="absolute right-2 top-2" />}
      </div>
      <div className="mt-3">
        <div className="flex items-center gap-3 text-cocoa">
          {meta && <p className="label">{meta}</p>}
          {badges}
        </div>
        <p className="mt-1 font-display text-[22px] leading-[1.1]">{title}</p>
        {subtitle && <p className="clamp-2 mt-1 text-[13px] text-cocoa">{subtitle}</p>}
      </div>
    </Link>
  );
}
