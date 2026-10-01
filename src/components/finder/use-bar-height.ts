"use client";

import { useEffect, type RefObject } from "react";

/** Variables de <html> que globals.css suma al scroll-padding (arriba y abajo). */
export type BarHeightVar = "--subheader-h" | "--bottom-bar-h";

/**
 * Publica en <html> el alto de una barra fija mientras está montada (y `active`): así el foco
 * y los #anclas no quedan tapados por ella (WCAG 2.4.11). Sigue los cambios de alto con un
 * ResizeObserver y al irse quita el valor, que vuelve al 0px de globals.css.
 * Lo usan la barra del buscador (--subheader-h) y la del constructor de rutinas (--bottom-bar-h).
 */
export function useBarHeight(ref: RefObject<HTMLElement | null>, name: BarHeightVar, active = true) {
  useEffect(() => {
    const el = ref.current;
    if (!active || !el) return;
    const style = document.documentElement.style;
    const ro = new ResizeObserver(() => style.setProperty(name, `${el.offsetHeight}px`));
    ro.observe(el);
    return () => {
      ro.disconnect();
      style.removeProperty(name);
    };
  }, [ref, name, active]);
}
