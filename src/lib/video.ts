import type { Video } from "@/content/types";

/**
 * URL de embed según proveedor. El sitio nunca aloja video: solo embebe.
 * Vimeo privado: usar "Ocultar de Vimeo" + dominio permitido en la cuenta.
 */
export function embedUrl(video: Video, autoplay = false): string {
  const ap = autoplay ? 1 : 0;
  switch (video.provider) {
    case "vimeo":
      return `https://player.vimeo.com/video/${video.providerId}?autoplay=${ap}&title=0&byline=0&portrait=0&color=b4664b&dnt=1`;
    case "mux":
      return `https://stream.mux.com/${video.providerId}.m3u8`;
    case "youtube":
      return `https://www.youtube-nocookie.com/embed/${video.providerId}?autoplay=${ap}&rel=0&modestbranding=1`;
  }
}
