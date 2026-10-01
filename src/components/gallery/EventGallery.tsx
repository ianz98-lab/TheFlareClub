"use client";

import dynamic from "next/dynamic";
import Image, { getImageProps } from "next/image";
import { createContext, use, useCallback, useEffect, useMemo, useRef, useState, type ReactNode, type RefObject } from "react";
import { preload } from "react-dom";
import { RevealList } from "@/components/motion/Reveal";
import type { Photo } from "@/content/types";

/* ---------------- Visor: se descarga aparte ---------------- */

// El visor no pesa en la carga de la página: se pide al primer gesto sobre la galería
// (pasar el puntero, tocar o enfocar una foto) y llega antes del clic.
const loadLightbox = () => import("./Lightbox");
const Lightbox = dynamic(() => loadLightbox().then((m) => m.Lightbox), { ssr: false });
const prefetchLightbox = () => {
  void loadLightbox();
};

/* ---------------- Filas justificadas ---------------- */

/*
 * Cada fila llena el ancho y sus fotos comparten altura (sin recortes). Las filas se arman de
 * antemano con la proporción de cada foto, no midiendo la pantalla: así el HTML estático ya
 * llega acomodado y la última fila también queda llena (antes quedaba con un hueco).
 * `target`: suma de proporciones (ancho / alto) buscada por fila; el alto de la fila es
 * ancho disponible / suma. `max`: fotos por fila como máximo.
 * `content`: ancho del contenedor (.container-x) en ese tramo, para declarar `sizes` reales.
 * `lead`: tramo en que la foto 0 va arriba del título (GalleryLead, bajo md) y sale de la grilla; las
 * filas se arman sin ella. Si no, el celular la bajaba dos veces, en dos tamaños (portada y miniatura).
 */
const BREAKPOINTS = [
  { min: 0, target: 1.85, max: 3, content: "100vw - 2.5rem", lead: true },
  { min: 640, target: 3.4, max: 5, content: "100vw - 4rem", lead: true },
  { min: 768, target: 3.4, max: 5, content: "100vw - 4rem", lead: false },
  { min: 1024, target: 4, max: 6, content: "100vw - 6rem", lead: false },
  { min: 1280, target: 4.7, max: 7, content: "100vw - 6rem", lead: false },
] as const;

/** .container-x deja de crecer en 88rem (1408 px): el contenido mide 1312 px de ahí en adelante. */
const MAX_CONTENT_PX = 1312;

/**
 * Separador de fila, visible solo en los tramos donde corta, y la foto 0, oculta donde la muestra
 * GalleryLead (clases completas para Tailwind; mismos tramos que BREAKPOINTS). Oculta y diferida, la
 * miniatura no se descarga.
 */
const BREAK_CLASS: readonly [on: string, off: string][] = [
  ["block", "hidden"],
  ["sm:block", "sm:hidden"],
  ["md:block", "md:hidden"],
  ["lg:block", "lg:hidden"],
  ["xl:block", "xl:hidden"],
];
const LEAD_HIDDEN = "max-md:hidden";

/** `sizes` de GalleryLead (a sangre): el visor lo repite para la foto 0 y reusa el archivo ya bajado. */
const LEAD_SIZES = "100vw";

/**
 * Reparte las fotos en filas consecutivas minimizando cuánto se aleja cada fila (también la
 * última) de `target`. Penaliza igual una fila el doble de alta que una de la mitad. Solo usa
 * sumas y divisiones: da el mismo resultado en el servidor y en cualquier navegador, así la
 * hidratación coincide. Devuelve la fila de cada foto y la suma de proporciones de cada fila.
 */
function justify(ratios: readonly number[], target: number, max: number): { rowOf: number[]; sums: number[] } {
  const n = ratios.length;
  const best = new Array<number>(n + 1).fill(Infinity);
  const from = new Array<number>(n + 1).fill(0);
  best[0] = 0;
  for (let j = 1; j <= n; j++) {
    let sum = 0;
    for (let i = j - 1; i >= 0 && j - i <= max; i--) {
      sum += ratios[i];
      const cost = best[i] + sum / target + target / sum - 2;
      if (cost < best[j]) {
        best[j] = cost;
        from[j] = i;
      }
    }
  }
  const rowOf = new Array<number>(n).fill(0);
  const sums: number[] = [];
  const starts: number[] = [];
  for (let j = n; j > 0; j = from[j]) starts.unshift(from[j]);
  starts.forEach((start, row) => {
    const end = starts[row + 1] ?? n;
    let sum = 0;
    for (let i = start; i < end; i++) {
      rowOf[i] = row;
      sum += ratios[i];
    }
    sums.push(sum);
  });
  return { rowOf, sums };
}

interface GalleryLayout {
  /** `sizes` de cada miniatura: el ancho real que ocupa en cada tramo. */
  sizes: string[];
  /** Clases del separador que va después de cada foto (null si en ningún tramo termina ahí una fila). */
  breaks: (string | null)[];
}

function galleryLayout(photos: readonly Photo[]): GalleryLayout {
  const ratios = photos.map((p) => p.width / p.height);
  // En los tramos con portada, las filas se arman sin la foto 0 (fila -1: no está en la grilla)
  const layouts = BREAKPOINTS.map((bp) => {
    if (!bp.lead) return justify(ratios, bp.target, bp.max);
    const rest = justify(ratios.slice(1), bp.target, bp.max);
    return { rowOf: [-1, ...rest.rowOf], sums: rest.sums };
  });
  // Fracción del ancho que ocupa cada foto en cada tramo (null: fuera de la grilla en ese tramo)
  const share = (bp: number, i: number) => {
    const { rowOf, sums } = layouts[bp];
    return rowOf[i] === -1 ? null : Number((ratios[i] / sums[rowOf[i]]).toFixed(4));
  };

  const sizes = photos.map((_, i) => {
    // Del tramo más ancho al más angosto, después del tope de .container-x. Fuera de la grilla, la
    // foto 0 declara el `sizes` de la portada: nunca se descarga ahí, y el visor reusa el archivo.
    const tiers = BREAKPOINTS.map((bp, b) => {
      const s = share(b, i);
      const w = s === null ? LEAD_SIZES : `calc((${bp.content}) * ${s})`;
      return b === 0 ? w : `(min-width: ${bp.min}px) ${w}`;
    }).reverse();
    const widest = share(BREAKPOINTS.length - 1, i) ?? 1;
    return [`(min-width: 1408px) ${Math.round(MAX_CONTENT_PX * widest)}px`, ...tiers].join(", ");
  });

  const breaks = photos.map((_, i) => {
    if (i === photos.length - 1) return null;
    // Después de la foto 0 oculta no hay fila que cortar
    const ends = layouts.map(({ rowOf }) => rowOf[i] !== -1 && rowOf[i] !== rowOf[i + 1]);
    if (!ends.some(Boolean)) return null;
    return ends.map((end, bp) => BREAK_CLASS[bp][end ? 0 : 1]).join(" ");
  });

  return { sizes, breaks };
}

/* ---------------- Estado compartido (miniaturas, foto de portada y visor) ---------------- */

interface GalleryApi {
  photos: Photo[];
  title: string;
  layout: GalleryLayout;
  /** Abre el visor en la foto `i`. `from`: lo que se tocó (si no es una miniatura, recibe el foco al cerrar). */
  openAt: (i: number, from?: HTMLElement | null) => void;
  /** Miniaturas de la grilla: al cerrar, el foco vuelve a la de la última foto vista. */
  thumbs: RefObject<(HTMLButtonElement | null)[]>;
}

const GalleryContext = createContext<GalleryApi | null>(null);

function useGallery(): GalleryApi {
  const api = use(GalleryContext);
  if (!api) throw new Error("EventGallery y GalleryLead van dentro de <GalleryProvider>.");
  return api;
}

const photoLabel = (p: Photo, i: number, n: number) => `Ver en grande la foto ${i + 1} de ${n}${p.alt ? `: ${p.alt}` : ""}`;

/**
 * Envuelve la ficha de un evento con galería: la grilla (EventGallery) y la foto de portada en
 * celular (GalleryLead) abren el mismo visor.
 */
export function GalleryProvider({ photos, title, children }: { photos: Photo[]; title: string; children: ReactNode }) {
  const [open, setOpen] = useState<number | null>(null);
  const thumbs = useRef<(HTMLButtonElement | null)[]>([]);
  const opener = useRef<HTMLElement | null>(null);
  const returnTo = useRef<number | null>(null);
  const layout = useMemo(() => galleryLayout(photos), [photos]);

  // Al cerrar: si se abrió desde la portada, el foco vuelve ahí; si no, a la miniatura de la última foto vista.
  useEffect(() => {
    if (open !== null || returnTo.current === null) return;
    const target = opener.current ?? thumbs.current[returnTo.current];
    target?.focus();
    returnTo.current = null;
    opener.current = null;
  }, [open]);

  const openAt = useCallback((i: number, from?: HTMLElement | null) => {
    opener.current = from && !thumbs.current.includes(from as HTMLButtonElement) ? from : null;
    setOpen(i);
  }, []);

  const close = useCallback(() => {
    returnTo.current = open;
    setOpen(null);
  }, [open]);

  const api = useMemo<GalleryApi>(() => ({ photos, title, layout, openAt, thumbs }), [photos, title, layout, openAt]);

  return (
    <GalleryContext value={api}>
      {children}
      {open !== null && (
        <Lightbox photos={photos} index={open} title={title} thumbSizes={layout.sizes} onIndexChange={setOpen} onClose={close} />
      )}
    </GalleryContext>
  );
}

/**
 * Galería del evento: filas justificadas que respetan la proporción de cada foto (vertical u
 * horizontal, sin recortes); en celular alterna fotos a todo el ancho y pares. Las mejores van
 * primero. Tocar una foto la abre en el visor a pantalla completa.
 * Bajo md la foto 0 no está en la grilla: ya va a sangre arriba del título (GalleryLead). Las
 * miniaturas van en prioridad baja: la portada y el resto del primer pantallazo pasan primero.
 */
export function EventGallery() {
  const { photos, layout, openAt, thumbs } = useGallery();

  return (
    <RevealList
      as="ul"
      onPointerEnter={prefetchLightbox}
      onFocus={prefetchLightbox}
      className="flex flex-wrap items-start gap-x-1.5 sm:gap-x-2"
    >
      {photos.flatMap((p, i) => {
        const brk = layout.breaks[i];
        const item = (
          <li
            key={p.src}
            // Ancho proporcional a la foto: la fila reparte el espacio y todas quedan del mismo alto
            className={`mb-1.5 min-w-0 basis-0 sm:mb-2 ${i === 0 ? LEAD_HIDDEN : ""}`}
            style={{ flexGrow: p.width / p.height }}
          >
            <button
              ref={(el) => {
                thumbs.current[i] = el;
              }}
              type="button"
              onClick={() => openAt(i)}
              aria-haspopup="dialog"
              aria-label={photoLabel(p, i, photos.length)}
              className="group block w-full"
            >
              <span
                className="card-media relative block overflow-hidden rounded-media bg-surface-alt"
                style={{ aspectRatio: `${p.width} / ${p.height}` }}
              >
                <Image src={p.src} alt="" fill sizes={layout.sizes[i]} fetchPriority="low" className="object-cover" />
              </span>
            </button>
          </li>
        );
        // El separador (alto 0) fuerza el salto de fila en los tramos donde la fila termina aquí
        return brk ? [item, <li key={`${p.src}-fila`} aria-hidden="true" className={`h-0 basis-full ${brk}`} />] : [item];
      })}
    </RevealList>
  );
}

/** Proporción de la portada: la de la foto, sin pasar de 4:5 (vertical) ni de 4:3 (horizontal). */
const leadRatio = (p: Photo) => Math.min(Math.max(p.width / p.height, 4 / 5), 4 / 3);

/**
 * Solo celular, en eventos anteriores: la primera foto de la galería a sangre arriba del título
 * (el flyer ahí no se muestra). Tocarla abre el visor. Se precarga solo en celular: en desktop
 * está oculta y, como es diferida, no se descarga.
 */
export function GalleryLead({ className = "" }: { className?: string }) {
  const { photos, openAt } = useGallery();
  const p = photos[0];
  const sizes = LEAD_SIZES;
  // Mismos src, fill y sizes que la <Image> de abajo: la precarga pide el mismo archivo que ella.
  const { props } = getImageProps({ src: p.src, alt: "", fill: true, sizes });
  preload(props.src, { as: "image", imageSrcSet: props.srcSet, imageSizes: props.sizes, media: "(max-width: 767px)", fetchPriority: "high" });

  return (
    <button
      type="button"
      onClick={(ev) => openAt(0, ev.currentTarget)}
      onPointerEnter={prefetchLightbox}
      onFocus={prefetchLightbox}
      aria-haspopup="dialog"
      aria-label={photoLabel(p, 0, photos.length)}
      // El ancho lo da `className` (a sangre: w-[calc(100%+…)] con márgenes negativos). El anillo de
      // foco va por dentro para que no lo corte el borde de la pantalla.
      className={`group block focus-visible:-outline-offset-4 ${className}`}
    >
      <span className="card-media relative block overflow-hidden bg-surface-alt" style={{ aspectRatio: leadRatio(p) }}>
        <Image
          src={p.src}
          alt=""
          fill
          sizes={sizes}
          loading="lazy"
          className="object-cover"
          style={p.focal ? { objectPosition: p.focal } : undefined}
        />
      </span>
    </button>
  );
}
