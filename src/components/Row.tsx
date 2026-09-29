import type { ReactNode } from "react";

/** Carrusel horizontal en móvil, grilla desde tablet. */
export function Row({ children, cols = "lg:grid-cols-4" }: { children: ReactNode; cols?: string }) {
  return <div className={`scroll-row -mx-5 px-5 sm:mx-0 sm:px-0 md:grid md:grid-cols-3 md:gap-x-6 md:gap-y-10 md:overflow-visible ${cols}`}>{children}</div>;
}
