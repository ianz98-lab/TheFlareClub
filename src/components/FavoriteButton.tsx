"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence } from "motion/react";
import * as m from "motion/react-m";
import { Icon } from "@/components/ui/Icon";
import { useAuth } from "@/lib/auth";
import { readLocal, writeLocal } from "@/lib/local-store";
import { DUR, EASE_OUT, RISE } from "@/lib/motion";
import { toggleFavorite, useFavorites } from "@/lib/user-data";

/** Ya se le dijo a la visitante dónde quedan sus favoritos (una vez por dispositivo). */
const HINT_KEY = "tfc:fav-hint";
const HINT_MS = 6000;

/** Fondo propio del botón: el de la superficie donde va (sobre una foto, surface). */
const TONE = { surface: "bg-surface", "surface-alt": "bg-surface-alt" } as const;

/**
 * Favoritos. Se guardan en el navegador y, con sesión iniciada, en la tabla `favorites`
 * de Supabase con la misma clave `${type}:${id}` (ver src/lib/user-data.ts).
 * Interruptor: el nombre no cambia ("Guardar {título} en favoritos") y el estado va en aria-pressed,
 * así el lector dice "presionado" sin que el botón cambie de nombre. `title` dice de qué ítem es
 * (en una grilla hay un corazón por tarjeta).
 * - `tone`: el fondo del botón; `framed`: filete alrededor (junto al título de una ficha). Así nadie
 *   pisa sus clases desde afuera; `className` queda para posicionarlo.
 * - Sin sesión, el primer favorito avisa dónde quedó (en este dispositivo) e invita a crear la cuenta.
 */
export function FavoriteButton({
  itemKey,
  title,
  size = "md",
  tone = "surface",
  framed = false,
  className = "",
}: {
  itemKey: string;
  title?: string;
  size?: "sm" | "md";
  tone?: keyof typeof TONE;
  framed?: boolean;
  className?: string;
}) {
  const favs = useFavorites();
  const fav = favs.includes(itemKey);
  const { status } = useAuth();
  /**
   * Aviso del primer favorito: "mounting" monta la región role=status vacía y "on" le pone el texto (así el
   * lector lo anuncia); "leaving" lo desvanece y al terminar se desmonta todo.
   */
  const [hint, setHint] = useState<"off" | "mounting" | "on" | "leaving">("off");
  const [holdHint, setHoldHint] = useState(false);

  const toggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!fav && status === "signed-out" && !readLocal<boolean>(HINT_KEY, false)) {
      writeLocal(HINT_KEY, true);
      setHint("mounting");
    }
    toggleFavorite(itemKey);
  };

  // Aparece enseguida y se va solo (salvo mientras el puntero o el foco estén en él)
  useEffect(() => {
    if (hint === "mounting") {
      const t = setTimeout(() => setHint("on"), 50);
      return () => clearTimeout(t);
    }
    if (hint !== "on" || holdHint) return;
    const t = setTimeout(() => setHint("leaving"), HINT_MS);
    return () => clearTimeout(t);
  }, [hint, holdHint]);

  // md = 44 px (detalle). sm = 32 px en las tarjetas, que agrandan el área táctil con un ::after.
  // shrink-0: junto a un título largo en Gloock no se aplasta (debe quedar de 44 × 44).
  const dim = size === "sm" ? "h-8 w-8" : "h-11 w-11";
  return (
    <>
      <button
        type="button"
        onClick={toggle}
        aria-pressed={fav}
        aria-label={title ? `Guardar ${title} en favoritos` : "Guardar en favoritos"}
        // Tinta espresso fija: el botón trae su propio fondo claro (también sobre fotos). Presionado: el velo
        // de press por dentro (inset), que no transparenta la foto de abajo.
        className={`group/fav flex ${dim} shrink-0 items-center justify-center rounded-control ${TONE[tone]} ${framed ? "border border-line" : ""} text-espresso transition-[color,box-shadow] duration-(--duration-fast) hover:text-accent-ink active:shadow-[inset_0_0_0_2.75rem_var(--color-press)] ${className}`}
      >
        {/* Corazón lleno al guardar: el acento tiene 3.95:1 sobre surface (gráfico, mínimo 3:1) */}
        <Icon name="heart" size={size === "sm" ? 16 : 18} className={`transition-transform duration-(--duration-fast) motion-safe:group-active/fav:scale-90 ${fav ? "fill-accent text-accent" : ""}`} />
      </button>
      {hint !== "off" &&
        createPortal(
          // Fijo sobre la barra inferior (y la del constructor). En el <body>: dentro de una tarjeta animada,
          // `fixed` quedaría atado a ella.
          <div
            role="status"
            className="fixed inset-x-0 bottom-[calc(var(--tabbar-space)+var(--bottom-bar-h)+0.75rem)] z-(--z-toast) px-(--gutter) md:bottom-6 md:left-auto md:w-[26rem] md:px-0 md:pr-(--gutter)"
            onPointerEnter={() => setHoldHint(true)}
            onPointerLeave={() => setHoldHint(false)}
            onFocus={() => setHoldHint(true)}
            onBlur={() => setHoldHint(false)}
          >
            <AnimatePresence onExitComplete={() => setHint("off")}>
              {hint === "on" && (
                <m.p
                  initial={{ opacity: 0, y: RISE.block }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: DUR.base, ease: EASE_OUT }}
                  className="on-dark rounded-control bg-espresso px-4 py-3 text-sm leading-snug"
                >
                  Guardada en este dispositivo.{" "}
                  <Link href="/cuenta/crear" className="link py-3 font-medium">
                    Crea tu cuenta
                  </Link>{" "}
                  para verla en Mi cuenta.
                </m.p>
              )}
            </AnimatePresence>
          </div>,
          document.body,
        )}
    </>
  );
}

export { useFavorites };
