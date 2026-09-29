import type { Talk } from "@/content/types";
import { videoById } from "@/content/videos";
import { instructorById } from "@/content/instructors";
import { Badge, AccessBadge } from "@/components/ui/Badge";
import { TALK_CATEGORIES, labelOf } from "@/content/taxonomies";
import { MediaCard } from "./MediaCard";

export function TalkCard({ t, size = "grid" }: { t: Talk; size?: "grid" | "row" }) {
  const video = videoById(t.videoId);
  const expert = instructorById(t.expertId);
  return (
    <MediaCard
      href={`/charlas/${t.slug}`}
      image={video.thumbnail}
      title={t.title}
      subtitle={`${expert.name} · ${t.specialty}`}
      meta={`${t.durationMin} min · ${labelOf(TALK_CATEGORIES, t.category)}`}
      favoriteKey={`talk:${t.id}`}
      size={size}
      aspect="aspect-[4/3]"
      badges={
        <>
          {t.isNew && <Badge tone="terracotta">Nuevo</Badge>}
          <AccessBadge access={t.access} />
        </>
      }
    />
  );
}
