"use client";

import { useReducedMotion } from "motion/react";
import * as m from "motion/react-m";
import Image from "next/image";
import { useCallback, useEffect, useLayoutEffect, useRef, type PointerEvent as ReactPointerEvent } from "react";
import { createPortal } from "react-dom";
import { Icon } from "@/components/ui/Icon";
import type { Photo } from "@/content/types";
import { useFocusTrap } from "@/lib/focus";
import { DUR, EASE_OUT, EASE_OUT_CSS, ms } from "@/lib/motion";

interface Drag {
  id: number;
  x: number;
  y: number;
  t: number;
  dx: number;
  dy: number;
  /** Se decide tras los primeros px: horizontal = cambiar de foto, vertical = cerrar */
  axis: "x" | "y" | null;
}

// Botón de ícono sobre espresso: .on-dark en la raíz da el anillo de foco claro y vuelve claros hover y press
const ICON_BTN =
  "grid h-12 w-12 shrink-0 place-items-center rounded-control transition-colors hover:bg-hover active:bg-press aria-disabled:opacity-(--opacity-disabled) aria-disabled:hover:bg-transparent";

/**
 * `sizes` de la foto grande: el área del escenario (menos los márgenes laterales), pero sin pasar
 * del ancho que deja el alto disponible (object-contain): una vertical en desktop pide ~640 px y no 1600.
 */
function stageSizes(p: Photo): string {
  const r = (p.width / p.height).toFixed(3);
  return [
    `(min-width: 1024px) min(calc(100vw - 14rem), calc((100vh - 6rem) * ${r}))`,
    `(min-width: 640px) min(calc(100vw - 10rem), calc((100vh - 6rem) * ${r}))`,
    `min(calc(100vw - 1.5rem), calc((100vh - 9rem) * ${r}))`,
  ].join(", ");
}

/**
 * Visor de fotos a pantalla completa.
 * - Flechas en pantalla (abajo en celular, a los lados en desktop), teclado ← → Inicio Fin.
 * - Deslizar a los lados cambia de foto; deslizar hacia abajo, Esc o el botón cierran.
 * - Bloquea el scroll, atrapa el foco y deja inerte el resto de la página (el padre devuelve el foco al cerrar).
 * - Se monta en <body>: los contenedores animados con transform romperían el position: fixed.
 * La tira de fotos se mueve por estilo directo (sin re-render en cada pointermove).
 * `thumbSizes`: los `sizes` de cada miniatura; la capa de baja resolución los repite para que el
 * navegador use el archivo ya descargado y la foto aparezca al instante mientras llega la grande.
 */
export function Lightbox({
  photos,
  index,
  title,
  thumbSizes,
  onIndexChange,
  onClose,
}: {
  photos: Photo[];
  index: number;
  title: string;
  thumbSizes: readonly string[];
  onIndexChange: (i: number) => void;
  onClose: () => void;
}) {
  const n = photos.length;
  const reduce = useReducedMotion() ?? false;
  const rootRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const drag = useRef<Drag | null>(null);
  const placed = useRef(false);

  // Foco en "Cerrar", Tab contenido, Esc cierra, scroll bloqueado y el resto de la página inerte
  useFocusTrap(rootRef, true, {
    lockScroll: true,
    restoreFocus: false,
    initialFocus: () => closeRef.current,
    onEscape: onClose,
  });

  /** Coloca la tira en la foto actual, desplazada dx/dy px (arrastre). */
  const place = useCallback(
    (dx: number, dy: number, animate: boolean) => {
      const track = trackRef.current;
      const backdrop = backdropRef.current;
      if (!track || !backdrop) return;
      const smooth = animate && !reduce;
      const transition = (prop: string) => (smooth ? `${prop} ${ms(DUR.base)}ms ${EASE_OUT_CSS}` : "none");
      track.style.transition = transition("transform");
      track.style.transform = `translate3d(calc(${(-index * 100) / n}% + ${dx}px), ${dy}px, 0)`;
      backdrop.style.transition = transition("opacity");
      backdrop.style.opacity = String(1 - Math.min(Math.abs(dy) / 500, 0.5));
    },
    [index, n, reduce],
  );

  // Cada cambio de foto anima la tira (la primera vez se coloca sin animación).
  useLayoutEffect(() => {
    place(0, 0, placed.current);
    placed.current = true;
  }, [place]);

  const go = useCallback(
    (dir: number) => {
      const next = index + dir;
      if (next < 0 || next >= n) place(0, 0, true);
      else onIndexChange(next);
    },
    [index, n, onIndexChange, place],
  );

  // Navegación con teclado (Esc y Tab los maneja useFocusTrap)
  useEffect(() => {
    const onKey = (ev: KeyboardEvent) => {
      switch (ev.key) {
        case "ArrowRight":
          ev.preventDefault();
          go(1);
          break;
        case "ArrowLeft":
          ev.preventDefault();
          go(-1);
          break;
        case "Home":
          ev.preventDefault();
          onIndexChange(0);
          break;
        case "End":
          ev.preventDefault();
          onIndexChange(n - 1);
          break;
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go, n, onIndexChange]);

  /* ---------- Deslizar (pointer events: dedo, lápiz o mouse) ---------- */

  const onPointerDown = (ev: ReactPointerEvent<HTMLDivElement>) => {
    if (ev.pointerType === "mouse" && ev.button !== 0) return;
    drag.current = { id: ev.pointerId, x: ev.clientX, y: ev.clientY, t: ev.timeStamp, dx: 0, dy: 0, axis: null };
    ev.currentTarget.setPointerCapture(ev.pointerId);
  };

  const onPointerMove = (ev: ReactPointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d || d.id !== ev.pointerId) return;
    const dx = ev.clientX - d.x;
    const dy = ev.clientY - d.y;
    if (!d.axis) {
      if (Math.hypot(dx, dy) < 8) return;
      d.axis = Math.abs(dx) >= Math.abs(dy) ? "x" : "y";
    }
    if (d.axis === "x") {
      // Resistencia en la primera y la última foto
      const atEdge = (index === 0 && dx > 0) || (index === n - 1 && dx < 0);
      d.dx = atEdge ? dx * 0.3 : dx;
      d.dy = 0;
    } else {
      d.dx = 0;
      d.dy = dy;
    }
    place(d.dx, d.dy, false);
  };

  const onPointerEnd = (ev: ReactPointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d || d.id !== ev.pointerId) return;
    drag.current = null;
    if (ev.type === "pointercancel" || !d.axis) {
      place(0, 0, true);
      return;
    }
    const dt = Math.max(1, ev.timeStamp - d.t);
    if (d.axis === "x") {
      const width = stageRef.current?.clientWidth ?? window.innerWidth;
      const flick = Math.abs(d.dx) > 30 && Math.abs(d.dx) / dt > 0.45;
      if (Math.abs(d.dx) > width * 0.18 || flick) go(d.dx < 0 ? 1 : -1);
      else place(0, 0, true);
    } else {
      const flick = Math.abs(d.dy) > 40 && Math.abs(d.dy) / dt > 0.5;
      if (Math.abs(d.dy) > 120 || flick) onClose();
      else place(0, 0, true);
    }
  };

  const stopDrag = (ev: ReactPointerEvent) => ev.stopPropagation();
  const atStart = index === 0;
  const atEnd = index === n - 1;

  return createPortal(
    <m.div
      ref={rootRef}
      role="dialog"
      aria-modal="true"
      aria-label={`Galería de ${title}`}
      data-lenis-prevent
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: reduce ? 0 : DUR.fast, ease: EASE_OUT }}
      className="on-dark fixed inset-0 z-(--z-modal) flex touch-none select-none flex-col overscroll-contain"
    >
      <div ref={backdropRef} aria-hidden="true" className="absolute inset-0 bg-espresso" />
      <p className="sr-only" aria-live="polite" aria-atomic="true">
        Foto {index + 1} de {n}
      </p>

      {/* Barra superior */}
      <div className="relative flex items-center justify-between gap-4 pl-5 pr-2 pt-[env(safe-area-inset-top)] sm:pl-8 sm:pr-4">
        {/* Título en minúscula legible (no versalitas: no es meta corta) y el conteo en cifras tabulares */}
        <p className="min-w-0 truncate py-4 text-body-sm font-medium text-ink-muted">
          {title}
          {n > 1 && (
            <span aria-hidden="true" className="hidden tabular-nums sm:inline">
              {" "}
              · {index + 1} / {n}
            </span>
          )}
        </p>
        <button ref={closeRef} type="button" onClick={onClose} aria-label="Cerrar galería" className={ICON_BTN}>
          <Icon name="close" size={24} />
        </button>
      </div>

      {/* Escenario: tira con todas las fotos; solo se cargan la actual y sus vecinas.
          overflow: clip (no hidden) para que nada lo desplace por código (scrollIntoView de un
          lector de pantalla o de una prueba) y la foto quede corrida; si el navegador no lo
          soporta, onScroll lo regresa a su lugar. */}
      <div
        ref={stageRef}
        className={`relative min-h-0 flex-1 overflow-hidden supports-[overflow:clip]:overflow-clip ${n > 1 ? "sm:cursor-grab sm:active:cursor-grabbing" : ""}`}
        onScroll={(ev) => {
          ev.currentTarget.scrollLeft = 0;
          ev.currentTarget.scrollTop = 0;
        }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerEnd}
        onPointerCancel={onPointerEnd}
      >
        <div ref={trackRef} className="flex h-full will-change-transform" style={{ width: `${n * 100}%` }}>
          {photos.map((p, i) => (
            <div
              key={p.src}
              className="relative h-full shrink-0"
              style={{ width: `${100 / n}%` }}
              aria-hidden={i === index ? undefined : true}
            >
              {Math.abs(i - index) <= 1 && (
                <div className="absolute inset-x-3 inset-y-2 sm:inset-x-20 sm:inset-y-4 lg:inset-x-28">
                  {/* Capa chica (la de la miniatura, ya en caché) debajo de la grande */}
                  <Image
                    src={p.src}
                    alt=""
                    aria-hidden="true"
                    fill
                    sizes={thumbSizes[i]}
                    loading="eager"
                    draggable={false}
                    className="object-contain"
                  />
                  {/* La actual primero; las vecinas, sin competir con ella */}
                  <Image
                    src={p.src}
                    alt={i === index ? (p.alt ?? `Foto ${i + 1} de ${n} de ${title}`) : ""}
                    fill
                    sizes={stageSizes(p)}
                    loading="eager"
                    fetchPriority={i === index ? "high" : "low"}
                    draggable={false}
                    className="object-contain"
                  />
                </div>
              )}
            </div>
          ))}
        </div>

        {n > 1 && (
          <>
            <button
              type="button"
              onClick={() => go(-1)}
              onPointerDown={stopDrag}
              aria-label="Foto anterior"
              aria-disabled={atStart}
              className={`${ICON_BTN} absolute left-3 top-1/2 hidden -translate-y-1/2 sm:grid lg:left-8`}
            >
              <Icon name="arrow-left" size={24} />
            </button>
            <button
              type="button"
              onClick={() => go(1)}
              onPointerDown={stopDrag}
              aria-label="Foto siguiente"
              aria-disabled={atEnd}
              className={`${ICON_BTN} absolute right-3 top-1/2 hidden -translate-y-1/2 sm:grid lg:right-8`}
            >
              <Icon name="arrow" size={24} />
            </button>
          </>
        )}
      </div>

      {/* Barra inferior en celular: flechas al alcance del pulgar */}
      {n > 1 && (
        <div className="relative flex items-center justify-between px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2 sm:hidden">
          <button type="button" onClick={() => go(-1)} aria-label="Foto anterior" aria-disabled={atStart} className={ICON_BTN}>
            <Icon name="arrow-left" size={24} />
          </button>
          <p aria-hidden="true" className="text-body-sm font-medium tabular-nums text-ink-muted">
            {index + 1} / {n}
          </p>
          <button type="button" onClick={() => go(1)} aria-label="Foto siguiente" aria-disabled={atEnd} className={ICON_BTN}>
            <Icon name="arrow" size={24} />
          </button>
        </div>
      )}
    </m.div>,
    document.body,
  );
}
