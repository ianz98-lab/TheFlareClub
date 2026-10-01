"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type Ref } from "react";
import type { Video } from "@/content/types";
import { embedUrl, useVimeoEvents } from "@/lib/video";
import { Icon } from "@/components/ui/Icon";
import { PlayOverlay } from "@/components/ui/PlayOverlay";
import { minutes } from "@/lib/format";
import { prefersReducedMotion } from "@/lib/motion";
import { markCompleted, markStarted, useHistory } from "@/lib/user-data";

/** Celular acostado (en el piso): la misma condición que la variante landscape-short de globals.css. */
export const LANDSCAPE_SHORT = "(orientation: landscape) and (max-height: 500px)";

let playingCount = 0;

/**
 * Marca `data-playing` en <html> mientras `active`: la barra inferior móvil (y el header, con el
 * celular acostado) se ocultan solo mientras hay un video en curso, no por ruta. Cuenta los
 * players montados, así uno que se desmonta no le quita la marca a otro.
 */
export function usePlayingFlag(active: boolean) {
  useEffect(() => {
    if (!active) return;
    const html = document.documentElement;
    playingCount += 1;
    html.dataset.playing = "true";
    return () => {
      playingCount = Math.max(0, playingCount - 1);
      if (!playingCount) delete html.dataset.playing;
    };
  }, [active]);
}

/**
 * Aviso sobre el póster mientras el video sea de muestra (`video.placeholder`: aún no hay id real
 * de Vimeo). Evita la pantalla de error en inglés de Vimeo; capa plana, sin degradado.
 * Se puede enfocar (tabIndex -1): al darle play el foco pasa aquí y el lector lo lee.
 */
export function PlaceholderNotice({ hint, ref }: { hint?: string; ref?: Ref<HTMLDivElement> }) {
  return (
    <div ref={ref} tabIndex={-1} role="status" className="on-dark absolute inset-0 flex flex-col items-center justify-center bg-scrim-strong px-6 text-center focus:outline-none">
      <p className="font-display text-display-md sm:text-display-lg">Video de muestra</p>
      <p className="mt-2 max-w-xs text-sm leading-snug text-ink-muted">
        El video real llega pronto.{hint ? ` ${hint}` : ""}
      </p>
    </div>
  );
}

/** Ancho del póster: todo el ancho hasta lg (detalle en una columna) y la columna del video después. */
const POSTER_SIZES = "(min-width: 1408px) 800px, (min-width: 1024px) 60vw, 100vw";

/**
 * Player embebido (Vimeo/YouTube). Poster limpio con botón de play grande (PlayOverlay).
 * Al darle play la clase entra a "Continuar viendo"; cuando Vimeo avisa que el video
 * terminó (evento `ended` por postMessage) o la usuaria marca "Ya la vi", pasa a su
 * historial de "Ya vistas" (src/lib/user-data.ts → tabla watch_history).
 * No se muestra porcentaje de avance: hoy no se mide (sería un número inventado).
 * Con el celular acostado el video nunca es más alto que la pantalla y, al darle play, queda centrado
 * (sin header: data-playing también con el aviso de muestra, que si no quedaba debajo del header).
 */
export function VideoPlayer({ video, title, contentKey, label }: { video: Video; title: string; contentKey: string; label?: string }) {
  const [playing, setPlaying] = useState(false);
  const [ended, setEnded] = useState(false);
  const stage = useRef<HTMLDivElement>(null);
  const frame = useRef<HTMLIFrameElement>(null);
  const notice = useRef<HTMLDivElement>(null);
  const focusAfterStart = useRef(false);
  const history = useHistory();
  const done = Boolean(history[contentKey]?.done);
  // Con video de muestra no se monta el iframe: se queda el póster con el aviso
  const live = playing && !video.placeholder;

  usePlayingFlag(playing && !ended);

  const start = () => {
    focusAfterStart.current = true;
    setPlaying(true);
    markStarted(contentKey);
  };

  // El botón de play desaparece al tocarlo: el foco pasa al video (o al aviso de muestra) y no
  // cae a <body>. Con el celular acostado, el video se centra en la pantalla.
  useEffect(() => {
    if (!playing || !focusAfterStart.current) return;
    focusAfterStart.current = false;
    (frame.current ?? notice.current)?.focus({ preventScroll: true });
    const el = stage.current;
    if (el && window.matchMedia(LANDSCAPE_SHORT).matches) {
      const top = el.getBoundingClientRect().top + window.scrollY - Math.max(0, (window.innerHeight - el.offsetHeight) / 2);
      window.scrollTo({ top, behavior: prefersReducedMotion() ? "auto" : "smooth" });
    }
  }, [playing]);

  useVimeoEvents(
    frame,
    {
      play: () => setEnded(false),
      ended: () => {
        markCompleted(contentKey);
        setEnded(true);
      },
    },
    live && video.provider === "vimeo",
  );

  const poster = video.thumbnailFocal ? { objectPosition: video.thumbnailFocal } : undefined;

  return (
    <div>
      {/* Nunca más alto que la pantalla (celular acostado): el ancho se limita y el video queda centrado */}
      <div ref={stage} className="relative mx-auto aspect-video w-full max-w-[calc((100svh-2rem)*16/9)] overflow-hidden rounded-media bg-espresso">
        {live ? (
          // `fullscreen` ya va en allow (allowFullScreen duplicado genera un aviso en consola)
          <iframe ref={frame} src={embedUrl(video, true)} title={title} className="absolute inset-0 h-full w-full" allow="autoplay; fullscreen; picture-in-picture" />
        ) : playing ? (
          <>
            <Image src={video.thumbnail} alt="" fill sizes={POSTER_SIZES} className="object-cover" style={poster} />
            <PlaceholderNotice ref={notice} />
          </>
        ) : (
          <PlayOverlay image={video.thumbnail} focal={video.thumbnailFocal} sizes={POSTER_SIZES} label={`Reproducir ${title}`} onClick={start} />
        )}
      </div>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
        <p className="text-body-sm text-ink-muted">{label ?? minutes(video.durationSec)}</p>
        {/* Interruptor con nombre fijo: el estado lo dicen la casilla y aria-pressed */}
        <button type="button" onClick={() => markCompleted(contentKey, !done)} aria-pressed={done} className="group -my-1 flex min-h-11 items-center gap-2.5 text-body-sm font-medium text-ink">
          <span
            aria-hidden="true"
            className={`flex h-5 w-5 shrink-0 items-center justify-center border transition-colors ${done ? "border-ink bg-ink text-on-ink" : "border-line-input group-hover:border-ink group-active:bg-press"}`}
          >
            {done && <Icon name="check" size={14} strokeWidth={2} />}
          </span>
          Ya la vi
        </button>
      </div>
    </div>
  );
}
