"use client";

import { LazyMotion, MotionConfig } from "motion/react";
import type { ReactNode } from "react";

/** Las funciones de animación de motion se descargan aparte, después de la página. */
const loadFeatures = () => import("./motion-features").then((m) => m.default);
const loadLayoutFeatures = () => import("./layout-features").then((m) => m.default);

/**
 * Motion queda solo para lo interactivo (menú móvil, hoja de filtros, visor de fotos, player
 * y constructor de rutina); las entradas al hacer scroll y la transición de página no lo usan.
 *
 * - LazyMotion: los componentes usan `m.*` (import * as m from "motion/react-m"), que pesa
 *   ~5 KB; el resto de motion llega en un chunk aparte: domAnimation (animaciones, exit, gestos) en
 *   todas las páginas. `strict`: un `motion.*` que se cuele avisa en consola.
 * - MotionConfig: respeta "reducir movimiento" del sistema (solo se desvanece, no se desplaza).
 */
export function MotionProvider({ children }: { children: ReactNode }) {
  return (
    <LazyMotion features={loadFeatures} strict>
      <MotionConfig reducedMotion="user">{children}</MotionConfig>
    </LazyMotion>
  );
}

/**
 * Para lo que usa `layout`, `layoutId` o `drag` (buscador, hoja de filtros, constructor de rutinas): carga
 * domMax solo en esas páginas. Hasta que llega, todo se ve y responde igual; solo falta la animación de
 * reacomodo.
 */
export function LayoutMotion({ children }: { children: ReactNode }) {
  return (
    <LazyMotion features={loadLayoutFeatures} strict>
      {children}
    </LazyMotion>
  );
}
