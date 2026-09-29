import Image from "next/image";
import Link from "next/link";
import type { FlareEvent } from "@/content/types";
import { Badge } from "@/components/ui/Badge";
import { Icon } from "@/components/ui/Icon";
import { EVENT_CATEGORIES, labelOf } from "@/content/taxonomies";
import { formatDate, formatPrice, formatTime } from "@/lib/format";

export function EventCard({ e, compact = false }: { e: FlareEvent; compact?: boolean }) {
  const d = new Date(e.startsAt);
  return (
    <Link
      href={`/eventos/${e.slug}`}
      className={`group flex overflow-hidden rounded-3xl bg-white/60 shadow-card ring-1 ring-sand/50 transition-shadow hover:shadow-soft ${
        compact ? "flex-row" : "flex-col sm:flex-row"
      }`}
    >
      <div className={`relative shrink-0 overflow-hidden ${compact ? "w-28" : "aspect-[16/10] sm:aspect-auto sm:w-64"}`}>
        <Image src={e.image} alt="" fill sizes="300px" className="object-cover transition-transform duration-700 group-hover:scale-[1.04]" />
        <div className="absolute left-3 top-3 rounded-2xl bg-cream px-3 py-2 text-center leading-none shadow-card">
          <p className="text-[10px] uppercase tracking-widest text-terracotta">
            {new Intl.DateTimeFormat("es-GT", { month: "short" }).format(d)}
          </p>
          <p className="font-display text-2xl">{d.getDate()}</p>
        </div>
      </div>
      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone={e.category === "night-editions" ? "rose" : "sky"}>
            {labelOf(EVENT_CATEGORIES, e.category)}
          </Badge>
          {e.status === "soldout" && <Badge tone="dark">Agotado</Badge>}
        </div>
        <h3 className="mt-2 font-display text-[22px] leading-tight sm:text-2xl">{e.title}</h3>
        {!compact && <p className="clamp-2 mt-1.5 text-[14px] text-cocoa">{e.description}</p>}
        <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[13px] text-cocoa">
          <li className="flex items-center gap-1"><Icon name="calendar" size={14} /> {formatDate(e.startsAt)} · {formatTime(e.startsAt)}</li>
          <li className="flex items-center gap-1"><Icon name="pin" size={14} /> {e.location}</li>
        </ul>
        {e.status !== "past" && (
          <div className="mt-4 flex items-center justify-between">
            <span className="font-medium">{formatPrice(e.price, e.currency)}</span>
            <span className="inline-flex items-center gap-1 text-sm font-medium text-terracotta">
              Comprar entrada <Icon name="arrow" size={16} />
            </span>
          </div>
        )}
      </div>
    </Link>
  );
}
