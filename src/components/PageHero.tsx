import Image from "next/image";
import type { ReactNode } from "react";
import type { Photo } from "@/content/types";

/**
 * Columnas desde lg: margen | texto | foto | margen. Las dos centrales suman el ancho de .container-x
 * (88rem menos el gutter a cada lado), así el título queda alineado con el resto de la página en
 * cualquier ancho y la foto corre hasta el borde derecho de la pantalla.
 */
const GRID_LG =
  "lg:grid lg:grid-cols-[minmax(var(--gutter),1fr)_minmax(0,calc(42rem_-_var(--gutter)))_minmax(0,calc(46rem_-_var(--gutter)))_minmax(var(--gutter),1fr)]";

/**
 * Cabecera de página (D2-C, 30-sep): sin bloques de color por módulo. La foto es la protagonista y el
 * título va en Gloock (text-display-xl) sobre la superficie neutra, con su entradilla.
 *
 * - Celular y tablet: la foto a sangre arriba (abre la sección, como en Inicio) y debajo el texto.
 * - Celular acostado (landscape-short): la foto pasa a una franja baja (32 % del alto) para que el título
 *   entre en el primer pantallazo.
 * - Desde lg: el texto a la izquierda, alineado abajo con la foto, que corre hasta el borde derecho.
 *
 * `eyebrow`: solo los kickers del documento; no se pasa si repite el título o la miga de pan.
 * `crumb`: miga de pan ("← Movement"), arriba del título y dentro del mismo bloque.
 * `image`: una ruta o una `Photo` de src/content/media.ts (usa su `focal` al recortar); `imagePosition`
 * fuerza el encuadre ("center 30%").
 * `compact`: páginas-buscador. La foto queda como una franja baja para que el contenido empiece pronto.
 *
 * Ni el texto ni la foto se animan: es el primer pantallazo y tiene que verse desde el HTML, sin
 * esperar al JavaScript (al navegar entre páginas ya lo anima template.tsx). Sin parallax (queda solo
 * en Inicio y Sobre nosotras).
 */
export function PageHero({
  eyebrow,
  crumb,
  title,
  description,
  image,
  imagePosition,
  children,
  compact = false,
}: {
  eyebrow?: string;
  crumb?: ReactNode;
  title: string;
  description?: string;
  image?: string | Photo;
  imagePosition?: string;
  children?: ReactNode;
  compact?: boolean;
}) {
  const photo = typeof image === "string" ? { src: image, focal: undefined } : image;
  const position = imagePosition ?? photo?.focal;

  return (
    <section className={`flex flex-col pb-10 sm:pb-12 ${GRID_LG} ${compact ? "lg:pb-12" : "lg:pb-16"}`}>
      {photo && (
        <div
          className={`relative overflow-hidden bg-surface-alt lg:col-start-3 lg:col-end-5 lg:row-start-1 landscape-short:aspect-auto landscape-short:h-[32svh] ${
            compact
              ? "aspect-[2/1] sm:aspect-[3/1] lg:aspect-auto lg:min-h-[clamp(15rem,22vw,21rem)]"
              : "aspect-[3/2] md:aspect-[2/1] lg:aspect-auto lg:min-h-[clamp(22rem,36vw,34rem)]"
          }`}
        >
          {/* Decorativa: el título ya dice de qué va la página */}
          <Image
            src={photo.src}
            alt=""
            fill
            sizes="(min-width: 1024px) 55vw, 100vw"
            className="object-cover"
            style={position ? { objectPosition: position } : undefined}
            // Es el LCP en todos los anchos: se precarga y se pide en prioridad alta (en Next 16, `preload`
            // solo agrega el <link>; sin fetchPriority la foto iba en Low, detrás de las fuentes)
            preload
            fetchPriority="high"
          />
        </div>
      )}
      <div
        className={`px-(--gutter) lg:col-start-2 lg:row-start-1 lg:self-end lg:px-0 lg:pr-10 xl:pr-12 ${
          photo ? (compact ? "pt-6 sm:pt-8 lg:pt-12" : "pt-8 sm:pt-10 lg:pt-16") : "pt-10 sm:pt-12 lg:pt-16"
        } ${photo ? "landscape-short:pt-6" : ""}`}
      >
        {crumb && <div className="mb-4 lg:mb-6">{crumb}</div>}
        {eyebrow && <p className="label mb-3 text-ink-muted">{eyebrow}</p>}
        {/* narrow: (bajo 360 px o con la letra agrandada) un escalón menos: a 280 px "Conversaciones" no
            cabía en display-xl y se partía en dos líneas */}
        <h1 className="font-display text-display-xl narrow:text-display-lg">{title}</h1>
        {description && (
          <p className={`max-w-[34rem] text-base leading-relaxed text-pretty text-ink-muted sm:text-lead ${compact ? "mt-3 sm:mt-4" : "mt-4 sm:mt-5"}`}>
            {description}
          </p>
        )}
        {children && <div className={compact ? "mt-5" : "mt-8"}>{children}</div>}
      </div>
    </section>
  );
}
