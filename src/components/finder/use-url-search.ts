"use client";

import { useSyncExternalStore } from "react";

/*
 * La búsqueda de la URL (`?duration=…`) sin useSearchParams. useSearchParams obliga a envolver el
 * buscador en Suspense y, en el HTML estático, deja solo el fallback: sin JS (o mientras baja) no se
 * veía ninguna clase ni meditación. Así el catálogo completo viene en el HTML y los filtros de la URL
 * se aplican al hidratar.
 */

const EVENT = "tfc:url-search";

function subscribe(onChange: () => void) {
  window.addEventListener("popstate", onChange);
  window.addEventListener(EVENT, onChange);
  return () => {
    window.removeEventListener("popstate", onChange);
    window.removeEventListener(EVENT, onChange);
  };
}

const serverSearch = () => "";

/**
 * `location.search` (con "?"), o "" en el HTML estático y al hidratar. getSnapshot va en línea a
 * propósito: siendo nuevo en cada render, React vuelve a leer la URL después de cada commit, y así ve
 * también la que Next cambia al navegar (la escribe en el mismo commit, después del render).
 */
export function useUrlSearch(): string {
  return useSyncExternalStore(subscribe, () => window.location.search, serverSearch);
}

/**
 * Reemplaza la búsqueda de la URL sin navegar ni sumar historial (con su basePath y su #ancla). El
 * history.replaceState nativo también mantiene al día el router de Next.
 */
export function replaceUrlSearch(params: URLSearchParams) {
  const { pathname, hash } = window.location;
  const search = params.toString();
  window.history.replaceState(null, "", `${pathname}${search ? `?${search}` : ""}${hash}`);
  window.dispatchEvent(new Event(EVENT));
}
