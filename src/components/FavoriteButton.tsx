"use client";

import { Icon } from "@/components/ui/Icon";
import { KEYS, readLocal, useLocal, writeLocal } from "@/lib/local-store";

const EMPTY: string[] = [];

/**
 * Favoritos. Hoy persiste en el navegador; en Fase 2 se sincroniza con la
 * tabla `favorites` de Supabase con la misma clave `${type}:${id}`.
 */
export function FavoriteButton({
  itemKey,
  size = "md",
  className = "",
}: {
  itemKey: string;
  size?: "sm" | "md";
  className?: string;
}) {
  const favs = useLocal<string[]>(KEYS.favorites, EMPTY);
  const fav = favs.includes(itemKey);

  const toggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const list = readLocal<string[]>(KEYS.favorites, EMPTY);
    writeLocal(KEYS.favorites, list.includes(itemKey) ? list.filter((k) => k !== itemKey) : [...list, itemKey]);
  };

  const dim = size === "sm" ? "h-9 w-9" : "h-11 w-11";
  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={fav}
      aria-label={fav ? "Quitar de favoritos" : "Guardar en favoritos"}
      className={`flex ${dim} items-center justify-center rounded-full bg-cream/90 text-espresso backdrop-blur transition-transform active:scale-90 ${className}`}
    >
      <Icon name="heart" size={size === "sm" ? 17 : 20} className={fav ? "fill-terracotta text-terracotta" : ""} />
    </button>
  );
}

export function useFavorites() {
  return useLocal<string[]>(KEYS.favorites, EMPTY);
}
