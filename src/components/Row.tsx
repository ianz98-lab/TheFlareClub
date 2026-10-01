import type { ReactNode } from "react";

/**
 * Carrusel horizontal a sangre en móvil (alineado con el margen de .container-x vía --gutter) y grilla
 * desde tablet: 2 columnas en md (2×2 con 4 tarjetas) y `cols` desde lg.
 */
export function Row({ children, cols = "lg:grid-cols-4" }: { children: ReactNode; cols?: string }) {
  return (
    <div
      className={`scroll-row -mx-(--gutter) scroll-px-(--gutter) px-(--gutter) md:mx-0 md:grid md:grid-cols-2 md:gap-x-6 md:gap-y-10 md:overflow-visible md:px-0 ${cols}`}
    >
      {children}
    </div>
  );
}
