import Image from "next/image";
import type { PodcastEpisode } from "@/content/types";
import { formatDate } from "@/lib/format";

/**
 * Fila de episodio tal como aparece en Spotify: imagen, número, fecha con año, duración,
 * título (en minúsculas cuando así está allá) y descripción corta. Toda la fila abre el
 * episodio en Spotify: el enlace vive en el título y se estira sobre la fila, así el lector
 * de pantalla solo anuncia el título y la descripción se lee aparte. El anillo de foco lo
 * dibuja la fila entera (el del enlace quedaría solo alrededor del título).
 */
export function EpisodeRow({ ep }: { ep: PodcastEpisode }) {
  const date = formatDate(ep.publishedAt, { weekday: undefined, year: "numeric" });
  return (
    <article className="group relative grid grid-cols-[64px_minmax(0,1fr)] items-start gap-4 py-5 outline-offset-4 has-[a:focus-visible]:outline-2 has-[a:focus-visible]:outline-focus sm:grid-cols-[88px_minmax(0,1fr)_auto] sm:gap-6 sm:py-6">
      <div className="card-media relative aspect-square w-full overflow-hidden rounded-media bg-surface-alt">
        <Image src={ep.image} alt="" fill sizes="(min-width: 640px) 88px, 64px" className="object-cover" />
      </div>

      <div className="min-w-0">
        <p className="label text-ink-muted">
          Ep. {ep.number} · <time dateTime={ep.publishedAt}>{date}</time> · {ep.durationMin} min
        </p>
        {/* Sin color al pasar: la respuesta es la portada (card-media) y la pista "Escuchar" */}
        <h3 className="mt-1.5 font-display text-display-md">
          <a href={ep.spotifyUrl} target="_blank" rel="noopener noreferrer" className="after:absolute after:inset-0 focus-visible:outline-none">
            {ep.title}
            <span className="sr-only"> (escuchar en Spotify, se abre en una pestaña nueva)</span>
          </a>
        </h3>
        <p className="mt-2 line-clamp-2 max-w-[68ch] text-sm leading-relaxed text-ink-muted sm:text-body-sm">{ep.description}</p>
      </div>

      {/* Pista visual de la fila (el enlace ya está en el título) */}
      <span
        aria-hidden="true"
        className="hidden items-center gap-1.5 self-center text-body-sm font-medium text-ink transition-colors group-hover:text-accent-ink sm:inline-flex"
      >
        Escuchar
        <span className="transition-transform duration-(--duration-base) ease-out-quint group-hover:-translate-y-0.5 group-hover:translate-x-0.5 motion-reduce:transition-none">↗</span>
      </span>
    </article>
  );
}
