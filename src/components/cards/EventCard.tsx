import Image from "next/image";
import Link from "next/link";
import type { FlareEvent } from "@/content/types";
import { Badge } from "@/components/ui/Badge";
import { EVENT_CATEGORIES, labelOf } from "@/content/taxonomies";
import { formatDate, formatPrice, formatTime } from "@/lib/format";

export function EventCard({ e, compact = false }: { e: FlareEvent; compact?: boolean }) {
  const d = new Date(e.startsAt);
  return (
    <Link href={`/eventos/${e.slug}`} className={`group rule-soft grid gap-4 pt-4 ${compact ? "grid-cols-[96px_1fr]" : "sm:grid-cols-[240px_1fr]"}`}>
      <div className={`relative overflow-hidden rounded-xs bg-cream-deep ${compact ? "aspect-square" : "aspect-[4/3]"}`}>
        <Image src={e.image} alt="" fill sizes="300px" className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]" />
      </div>
      <div className="flex flex-col">
        <div className="flex items-center gap-3">
          <span className="font-display text-3xl leading-none">{d.getDate()}</span>
          <span className="label text-cocoa">
            {new Intl.DateTimeFormat("es-GT", { month: "long" }).format(d)} · {formatTime(e.startsAt)}
          </span>
        </div>
        <h3 className="mt-2 font-display text-2xl leading-[1.08] sm:text-[26px]">{e.title}</h3>
        {!compact && <p className="clamp-2 mt-2 text-[14px] text-cocoa">{e.description}</p>}
        <p className="mt-2 text-[13px] text-cocoa">{e.location}</p>
        <div className="mt-auto flex items-center justify-between pt-3">
          <Badge tone={e.category === "night-editions" ? "rose" : "sky"}>{labelOf(EVENT_CATEGORIES, e.category)}</Badge>
          {e.status !== "past" && <span className="text-[13px]">{formatPrice(e.price, e.currency)}</span>}
          {e.status === "soldout" && <Badge tone="dark">Agotado</Badge>}
        </div>
      </div>
    </Link>
  );
}

export { formatDate };
