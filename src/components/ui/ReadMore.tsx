"use client";

import { useId, useRef, useState } from "react";

/**
 * Texto largo en párrafos: muestra los primeros `visible` y un "Leer más". Todo el texto viene en el
 * HTML (SEO) y al abrir, el foco pasa al primer párrafo nuevo para que el lector de pantalla siga ahí.
 * `collapse`: "mobile" (por defecto) recorta solo en el celular; "always" también en desktop (p. ej.
 * para que dos bios vecinas muestren el mismo largo).
 */
export function ReadMore({
  paragraphs,
  visible = 2,
  collapse = "mobile",
  className = "",
  paragraphClassName = "",
  moreLabel = "Leer más",
  lessLabel = "Leer menos",
}: {
  paragraphs: readonly string[];
  visible?: number;
  collapse?: "mobile" | "always";
  className?: string;
  paragraphClassName?: string;
  moreLabel?: string;
  lessLabel?: string;
}) {
  const [open, setOpen] = useState(false);
  const id = useId();
  const firstExtra = useRef<HTMLParagraphElement>(null);
  const top = useRef<HTMLDivElement>(null);
  const head = paragraphs.slice(0, visible);
  const rest = paragraphs.slice(visible);
  const always = collapse === "always";

  const toggle = () => {
    if (open) {
      setOpen(false);
      // Al cerrar, vuelve al inicio del texto para no quedar perdida más abajo (sin animar si se
      // pidió reducir el movimiento).
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      top.current?.scrollIntoView({ block: "nearest", behavior: reduce ? "auto" : "smooth" });
      return;
    }
    setOpen(true);
    requestAnimationFrame(() => firstExtra.current?.focus({ preventScroll: true }));
  };

  return (
    <div ref={top} className={`space-y-4 ${className}`}>
      {head.map((p) => (
        <p key={p} className={paragraphClassName}>
          {p}
        </p>
      ))}
      {rest.length > 0 && (
        <>
          <div id={id} className={`space-y-4 ${open ? "block" : always ? "hidden" : "hidden md:block"}`}>
            {rest.map((p, i) => (
              <p
                key={p}
                ref={i === 0 ? firstExtra : undefined}
                tabIndex={i === 0 ? -1 : undefined}
                className={`focus:outline-none ${paragraphClassName}`}
              >
                {p}
              </p>
            ))}
          </div>
          <button
            type="button"
            onClick={toggle}
            aria-expanded={open}
            aria-controls={id}
            className={`link-action -my-2 text-ink ${always ? "" : "md:hidden"}`}
          >
            {open ? lessLabel : moreLabel}
          </button>
        </>
      )}
    </div>
  );
}
