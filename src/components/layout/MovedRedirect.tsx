"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

/** Direcciones viejas que siguen circulando (links compartidos) → su página nueva. */
const MOVED: Record<string, string> = {
  "/nosotras": "/sobre-nosotras",
};

/**
 * El sitio estático no tiene redirecciones de servidor: la 404 revisa en el navegador si la
 * dirección se mudó y, si es así, lleva a la nueva (sin dejar la vieja en el historial).
 */
export function MovedRedirect() {
  const router = useRouter();

  useEffect(() => {
    const base = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
    let path = window.location.pathname;
    if (base && path.startsWith(base)) path = path.slice(base.length);
    const to = MOVED[path.replace(/\/+$/, "") || "/"];
    if (to) router.replace(to);
  }, [router]);

  return null;
}
