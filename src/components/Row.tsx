import type { ReactNode } from "react";

/** Carrusel horizontal en móvil, grid en desktop. */
export function Row({ children, cols = "lg:grid-cols-4" }: { children: ReactNode; cols?: string }) {
  return (
    <div className={`scroll-row -mx-4 px-4 sm:mx-0 sm:px-0 md:grid md:grid-cols-3 md:gap-5 md:overflow-visible ${cols}`}>
      {children}
    </div>
  );
}
