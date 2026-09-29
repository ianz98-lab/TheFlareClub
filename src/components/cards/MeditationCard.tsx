import type { Meditation } from "@/content/types";
import { videoById } from "@/content/videos";
import { Badge, AccessBadge } from "@/components/ui/Badge";
import { FEELINGS, MOMENTS, labelOf } from "@/content/taxonomies";
import { MediaCard } from "./MediaCard";

export function MeditationCard({ m, size = "grid" }: { m: Meditation; size?: "grid" | "row" }) {
  const video = videoById(m.videoId);
  return (
    <MediaCard
      href={`/meditaciones/${m.slug}`}
      image={video.thumbnail}
      title={m.title}
      subtitle={m.feelings.map((f) => labelOf(FEELINGS, f)).join(" · ")}
      meta={`${m.duration} min · ${labelOf(MOMENTS, m.moment)}`}
      favoriteKey={`meditation:${m.id}`}
      size={size}
      aspect="aspect-[4/3]"
      badges={
        <>
                    <AccessBadge access={m.access} />
        </>
      }
    />
  );
}
