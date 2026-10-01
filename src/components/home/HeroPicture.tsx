"use client";

import { getImageProps } from "next/image";

/**
 * Foto con dirección de arte: el recorte vertical en el celular y la horizontal desde 640 px, en un
 * solo <picture> (el navegador baja solo la que corresponde). Se comporta como `fill`: ocupa su
 * contenedor, que debe tener position.
 *
 * Es de cliente a propósito: el loader de Pages (src/lib/image-loader.ts) es un módulo "use client",
 * y getImageProps no puede llamarlo desde un componente de servidor. Igual se renderiza en el HTML.
 */
export function HeroPicture({
  wide,
  tall,
  alt,
  sizes,
  className,
  eager = false,
}: {
  /** Foto horizontal (desde 640 px). */
  wide: string;
  /** Recorte vertical para el celular. */
  tall: string;
  alt: string;
  /** Ancho real que ocupa cada versión (con `fill` y object-cover puede pasar de 100vw). */
  sizes: { wide: string; tall: string };
  className?: string;
  /** Primer pantallazo: carga inmediata y prioridad alta (sin preload: precargaría las dos). */
  eager?: boolean;
}) {
  const common = { alt, fill: true, className, ...(eager ? { loading: "eager" as const, fetchPriority: "high" as const } : {}) };
  const {
    props: { srcSet: tallSrcSet, sizes: tallSizes },
  } = getImageProps({ ...common, src: tall, sizes: sizes.tall });
  const { props: img } = getImageProps({ ...common, src: wide, sizes: sizes.wide });

  return (
    <picture>
      <source media="(max-width: 639.98px)" srcSet={tallSrcSet} sizes={tallSizes} />
      {/* Los props de next/image (srcset del loader, sizes, fill): no es un <img> suelto */}
      <img {...img} alt={alt} />
    </picture>
  );
}
