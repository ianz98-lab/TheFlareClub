import type { MovementClass } from "@/content/types";
import { videoById } from "@/content/videos";
import { Badge, AccessBadge } from "@/components/ui/Badge";
import { CLASS_TYPES, FOCUS, labelOf } from "@/content/taxonomies";
import { MediaCard } from "./MediaCard";

export function ClassCard({ c, size = "grid" }: { c: MovementClass; size?: "grid" | "row" }) {
  const video = videoById(c.videoId);
  const focus = c.focus.slice(0, 2).map((f) => labelOf(FOCUS, f)).join(" · ");
  return (
    <MediaCard
      href={`/movement/${c.slug}`}
      image={video.thumbnail}
      title={c.title}
      subtitle={focus}
      meta={`${c.duration} min · ${labelOf(CLASS_TYPES, c.type)}`}
      favoriteKey={`class:${c.id}`}
      size={size}
      badges={
        <>
          {c.isNew && <Badge tone="terracotta">Nueva</Badge>}
          <AccessBadge access={c.access} />
        </>
      }
    />
  );
}
