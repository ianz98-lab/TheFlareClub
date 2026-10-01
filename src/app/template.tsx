"use client";

import { useLayoutEffect, useRef, type ReactNode } from "react";
import { DUR, EASE_OUT_CSS, RISE, ms, prefersReducedMotion } from "@/lib/motion";

/**
 * La primera carga NO se anima: así la página se ve desde el HTML estático sin esperar a
 * que cargue el JavaScript (mejor LCP). Solo cambia a `false` en el navegador.
 */
let firstLoad = true;

/**
 * Transición suave entre páginas (sube 12 px y aparece) con Web Animations: sin librería y
 * sin dejar transform al terminar (un transform fijo rompería los `position: fixed` de adentro).
 * Con "reducir movimiento", solo un fundido corto.
 */
export default function Template({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  // Antes de pintar: la página nueva nunca se ve un cuadro sin animar.
  useLayoutEffect(() => {
    if (firstLoad) {
      firstLoad = false;
      return;
    }
    const el = ref.current;
    if (!el || typeof el.animate !== "function") return;
    const reduce = prefersReducedMotion();
    el.animate(
      reduce
        ? [{ opacity: 0 }, { opacity: 1 }]
        : [
            { opacity: 0, transform: `translateY(${RISE.page}px)` },
            { opacity: 1, transform: "none" },
          ],
      { duration: ms(reduce ? DUR.fast : DUR.base), easing: EASE_OUT_CSS },
    );
  }, []);

  return <div ref={ref}>{children}</div>;
}
