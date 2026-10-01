import type { MovementClass } from "@/content/types";
import { videoById } from "@/content/videos";
import { Badge, AccessBadge } from "@/components/ui/Badge";
import { FOCUS, labelOf } from "@/content/taxonomies";
import { CLASS_TYPE_SINGULAR } from "@/lib/movement";
import { MediaCard } from "./MediaCard";

export function ClassCard({ c, size = "grid" }: { c: MovementClass; size?: "grid" | "row" }) {
  const video = videoById(c.videoId);
  const focus = c.focus.slice(0, 2).map((f) => labelOf(FOCUS, f)).join(" · ");
  return (
    <MediaCard
      href={`/movement/${c.slug}`}
      image={video.thumbnail}
      focal={video.thumbnailFocal}
      title={c.title}
      subtitle={focus}
      // "5 min · Calentamiento": tipo en singular y en español
      meta={`${c.duration} min · ${CLASS_TYPE_SINGULAR[c.type]}`}
      favoriteKey={`class:${c.id}`}
      size={size}
      aspect="aspect-[3/2]"
      badges={
        <>
          {c.isNew && <Badge tone="accent">Nuevo</Badge>}
          <AccessBadge access={c.access} />
        </>
      }
    />
  );
}
