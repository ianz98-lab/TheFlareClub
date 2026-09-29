import Image from "next/image";
import type { PodcastEpisode } from "@/content/types";
import { PODCAST_CATEGORIES, labelOf } from "@/content/taxonomies";
import { formatDate } from "@/lib/format";

export function EpisodeRow({ ep }: { ep: PodcastEpisode }) {
  return (
    <a href={ep.spotifyUrl} target="_blank" rel="noreferrer" className="group rule-soft grid grid-cols-[64px_1fr_auto] items-center gap-4 py-4">
      <div className="relative h-16 w-16 card-media overflow-hidden rounded-md bg-cream-deep">
        <Image src={ep.image} alt="" fill sizes="64px" className="object-cover" />
      </div>
      <div className="min-w-0">
        <p className="label text-cocoa">
          Ep. {ep.number} · {labelOf(PODCAST_CATEGORIES, ep.category)}
        </p>
        <h3 className="mt-0.5 truncate font-display text-xl leading-tight group-hover:text-terracotta">{ep.title}</h3>
        <p className="clamp-2 mt-0.5 text-[13px] text-cocoa">{ep.description}</p>
      </div>
      <div className="text-right text-[12px] text-cocoa">
        <p>{formatDate(ep.publishedAt, { weekday: undefined })}</p>
        <p>{ep.durationMin} min</p>
      </div>
    </a>
  );
}
