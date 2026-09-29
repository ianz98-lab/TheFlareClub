import Image from "next/image";
import type { PodcastEpisode } from "@/content/types";
import { Icon } from "@/components/ui/Icon";
import { PODCAST_CATEGORIES, labelOf } from "@/content/taxonomies";
import { formatDate } from "@/lib/format";

export function EpisodeRow({ ep }: { ep: PodcastEpisode }) {
  return (
    <a
      href={ep.spotifyUrl}
      target="_blank"
      rel="noreferrer"
      className="group flex items-center gap-4 rounded-2xl p-2 transition-colors hover:bg-cream-deep"
    >
      <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl">
        <Image src={ep.image} alt="" fill sizes="80px" className="object-cover" />
        <span className="absolute inset-0 flex items-center justify-center bg-espresso/30 text-cream opacity-0 transition-opacity group-hover:opacity-100">
          <Icon name="play" size={22} />
        </span>
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[11px] uppercase tracking-[0.16em] text-terracotta">
          Ep. {ep.number} · {labelOf(PODCAST_CATEGORIES, ep.category)}
        </p>
        <h3 className="mt-0.5 truncate font-display text-xl leading-tight">{ep.title}</h3>
        <p className="clamp-2 mt-0.5 text-[13px] text-cocoa">{ep.description}</p>
        <p className="mt-1 text-xs text-cocoa/80">{formatDate(ep.publishedAt, { weekday: undefined })} · {ep.durationMin} min</p>
      </div>
      <Icon name="spotify" size={22} className="hidden shrink-0 text-[#1DB954] sm:block" />
    </a>
  );
}
