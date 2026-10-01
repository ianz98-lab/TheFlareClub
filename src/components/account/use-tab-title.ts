"use client";

import { useEffect } from "react";
import { SITE_NAME } from "@/lib/seo";

/**
 * Título de la pestaña para un estado que la metadata no conoce (F048): /cuenta/crear dice "Crear
 * cuenta" en el HTML, pero con sesión la página es "Activa tu membresía.". Toma el título visible sin
 * el punto final y le suma la marca como el `template` del layout (salvo que ya la traiga). Con `null`
 * queda el de la metadata.
 *
 * Next vuelve a montar la metadata después de este efecto (al hidratar y en cada cambio de query) y
 * pisa el título: un observador del <head> lo repone mientras la ruta sea la misma. Solo se reescribe
 * el <title> que ya existe: `document.title = …` en el hueco de una navegación crearía uno propio
 * que React no maneja y quedaría colgado en las demás páginas. Al cambiar de estado o salir se
 * devuelve el último título ajeno, si sigue puesto el nuestro.
 */
export function useTabTitle(title: string | null) {
  useEffect(() => {
    if (!title) return;
    const base = title.trim().replace(/\.$/, "");
    const next = base.includes(SITE_NAME) ? base : `${base} · ${SITE_NAME}`;
    const path = window.location.pathname;
    const current = () => document.head.querySelector("title");
    let prev: string | null = null;
    const apply = () => {
      const el = current();
      // Sin <title> (a media navegación) o ya en otra ruta: no es nuestro.
      if (!el || window.location.pathname !== path || el.textContent === next) return;
      prev = el.textContent;
      el.textContent = next;
    };
    apply();
    const observer = new MutationObserver(apply);
    observer.observe(document.head, { childList: true, subtree: true, characterData: true });
    return () => {
      observer.disconnect();
      const el = current();
      if (el && prev !== null && el.textContent === next) el.textContent = prev;
    };
  }, [title]);
}
