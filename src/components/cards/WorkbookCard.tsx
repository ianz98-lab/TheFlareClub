import Image from "next/image";
import type { Workbook } from "@/content/types";
import { Badge } from "@/components/ui/Badge";
import { Icon } from "@/components/ui/Icon";
import { formatPrice } from "@/lib/format";

const ACCESS: Record<Workbook["access"], { label: string; tone: "sage" | "rose" | "terracotta" }> = {
  free: { label: "Gratis", tone: "sage" },
  member: { label: "Membresía", tone: "rose" },
  paid: { label: "Compra", tone: "terracotta" },
};

export function WorkbookCard({ w }: { w: Workbook }) {
  const a = ACCESS[w.access];
  return (
    <article className="group flex gap-4 rounded-3xl bg-white/60 p-3 shadow-card ring-1 ring-sand/50 sm:flex-col sm:p-0">
      <div className="relative aspect-[3/4] w-24 shrink-0 overflow-hidden rounded-2xl sm:w-full sm:rounded-b-none sm:rounded-t-3xl">
        <Image src={w.cover} alt="" fill sizes="(min-width: 640px) 300px, 100px" className="object-cover" />
        <div className="absolute inset-0 bg-espresso/25" />
        <div className="absolute inset-x-2 bottom-2 hidden sm:block">
          <p className="font-display text-2xl leading-none text-cream">{w.title}</p>
        </div>
      </div>
      <div className="flex flex-1 flex-col sm:p-4">
        <div className="flex items-center justify-between gap-2">
          <Badge tone={a.tone}>{a.label}</Badge>
          <span className="text-xs text-cocoa">{w.pages} págs.</span>
        </div>
        <h3 className="mt-2 font-display text-xl leading-tight sm:hidden">{w.title}</h3>
        <p className="clamp-2 mt-1.5 text-[14px] text-cocoa">{w.description}</p>
        <a
          href={w.fileUrl}
          className="mt-auto inline-flex h-10 items-center justify-center gap-2 self-start rounded-full bg-espresso px-4 pt-0.5 text-sm font-medium text-cream sm:mt-4 sm:self-stretch"
        >
          {w.access === "paid" ? (
            <>Comprar · {formatPrice(w.price ?? 0)}</>
          ) : (
            <>
              <Icon name="download" size={16} /> Descargar
            </>
          )}
        </a>
      </div>
    </article>
  );
}
