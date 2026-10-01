import { useEffect, useEffectEvent, type RefObject } from "react";
import type { Video } from "@/content/types";
import { BRAND_COLORS } from "@/components/ui/tokens";

/** Controles del player de Vimeo en el terracota de la marca (sin #). */
const VIMEO_COLOR = BRAND_COLORS.accentInk.slice(1);

/**
 * URL de embed según proveedor. El sitio nunca aloja video: solo embebe.
 * Vimeo privado: usar "Ocultar de Vimeo" + dominio permitido en la cuenta. `api=1`: el player avisa
 * sus eventos por postMessage (useVimeoEvents).
 */
export function embedUrl(video: Video, autoplay = false): string {
  const ap = autoplay ? 1 : 0;
  switch (video.provider) {
    case "vimeo":
      return `https://player.vimeo.com/video/${video.providerId}?autoplay=${ap}&title=0&byline=0&portrait=0&color=${VIMEO_COLOR}&dnt=1&api=1`;
    case "mux":
      return `https://stream.mux.com/${video.providerId}.m3u8`;
    case "youtube":
      return `https://www.youtube-nocookie.com/embed/${video.providerId}?autoplay=${ap}&rel=0&modestbranding=1`;
  }
}

/** Solo mensajes del player de Vimeo (no "algo-vimeo.com"). */
export const isVimeoOrigin = (origin: string) => {
  try {
    return /(^|\.)vimeo\.com$/.test(new URL(origin).hostname);
  } catch {
    return false;
  }
};

/** Eventos del player de Vimeo que usan los players del sitio. */
export type VimeoEvent = "play" | "ended";

/**
 * Escucha los eventos del player de Vimeo (Player API por postMessage) del iframe `frame` mientras
 * `active`. Cuando el player avisa "ready", se suscribe a cada evento que tenga handler. Solo atiende
 * a ese iframe (puede haber otro player en la página) y siempre llama a la versión más reciente de
 * los handlers. Lo comparten VideoPlayer y RoutinePlayer.
 */
export function useVimeoEvents(frame: RefObject<HTMLIFrameElement | null>, handlers: Partial<Record<VimeoEvent, () => void>>, active = true) {
  const subscribed = useEffectEvent(() => (Object.keys(handlers) as VimeoEvent[]).filter((k) => handlers[k]));
  const emit = useEffectEvent((event: VimeoEvent) => handlers[event]?.());

  useEffect(() => {
    if (!active) return;
    const onMessage = (e: MessageEvent) => {
      const win = frame.current?.contentWindow;
      if (!win || e.source !== win || !isVimeoOrigin(e.origin)) return;
      try {
        const data = typeof e.data === "string" ? JSON.parse(e.data) : e.data;
        if (data?.event === "ready") {
          for (const value of subscribed()) win.postMessage(JSON.stringify({ method: "addEventListener", value }), e.origin);
          return;
        }
        if (data?.event === "play" || data?.event === "ended") emit(data.event);
      } catch {}
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [active, frame]);
}
