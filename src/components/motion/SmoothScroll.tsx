"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import type Lenis from "lenis";

/** Rutas con player (rutina, clase, meditación, charla, curso): scroll nativo, sin inercia. */
const WITH_PLAYER = /^\/(rutina\/reproducir|movement\/[^/]+|meditaciones\/[^/]+|charlas\/[^/]+|cursos\/[^/]+)\/?$/;

/**
 * Scroll suave con inercia (Lenis), solo donde aporta: rueda de mouse o trackpad
 * (`hover: hover` y `pointer: fine`). En el celular el scroll nativo ya es suave, así que
 * Lenis ni se descarga. Tampoco con "reducir movimiento" ni en las páginas con player.
 *
 * Sin bucle perpetuo: el requestAnimationFrame corre solo mientras Lenis anima un scroll de
 * rueda y se detiene al terminar; la siguiente rueda lo despierta.
 * Al cambiar de página se corta cualquier inercia pendiente: si no, Lenis "regresa" la página
 * al destino de su animación y la vista nueva puede quedar a media página.
 */
export function SmoothScroll() {
  const pathname = usePathname();
  const lenisRef = useRef<Lenis | null>(null);
  const enabled = !WITH_PLAYER.test(pathname);

  useEffect(() => {
    if (!enabled) return;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let cancelled = false;
    let lenis: Lenis | null = null;
    let raf = 0;
    let resumed = true;

    const tick = (time: number) => {
      raf = 0;
      if (!lenis) return;
      // Al despertar, Lenis mediría el tiempo dormido como un solo cuadro y saltaría al destino.
      if (resumed) lenis.time = time - 1000 / 60;
      resumed = false;
      lenis.raf(time);
      if (lenis.isScrolling === "smooth") raf = requestAnimationFrame(tick);
      else resumed = true;
    };
    // Después del listener de Lenis (registrado antes): ya sabe que empezó a animar.
    const wake = () => {
      if (!raf) raf = requestAnimationFrame(tick);
    };

    void import("lenis")
      .then(({ default: LenisClass }) => {
        if (cancelled) return;
        lenis = new LenisClass({ lerp: 0.12, wheelMultiplier: 0.9, smoothWheel: true });
        lenisRef.current = lenis;
        window.addEventListener("wheel", wake, { passive: true });
      })
      .catch(() => {
        // Sin Lenis queda el scroll nativo: no hace falta avisar.
      });

    return () => {
      cancelled = true;
      window.removeEventListener("wheel", wake);
      cancelAnimationFrame(raf);
      lenis?.destroy();
      lenisRef.current = null;
    };
  }, [enabled]);

  useEffect(() => {
    const lenis = lenisRef.current;
    if (!lenis) return;
    lenis.stop();
    lenis.start();
  }, [pathname]);

  return null;
}
