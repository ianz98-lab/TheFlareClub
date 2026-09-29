import Image from "next/image";
import type { Workbook } from "@/content/types";
import { Badge } from "@/components/ui/Badge";
import { formatPrice } from "@/lib/format";

const ACCESS: Record<Workbook["access"], { label: string; tone: "sage" | "rose" | "terracotta" }> = {
  free: { label: "Gratis", tone: "sage" },
  member: { label: "Membresía", tone: "rose" },
  paid: { label: "Compra", tone: "terracotta" },
};

export function WorkbookCard({ w }: { w: Workbook }) {
  const a = ACCESS[w.access];
  return (
    <article className="rule-soft flex gap-4 pt-4 sm:block">
      <div className="relative aspect-[3/4] w-24 shrink-0 card-media overflow-hidden rounded-md bg-cream-deep sm:w-full">
        <Image src={w.cover} alt="" fill sizes="(min-width: 640px) 320px, 100px" className="object-cover" />
        <div className="absolute inset-0 bg-espresso/20" />
        <p className="absolute inset-x-3 bottom-3 hidden font-display text-2xl leading-none text-cream sm:block">{w.title}</p>
      </div>
      <div className="flex flex-1 flex-col sm:mt-3">
        <div className="flex items-center justify-between gap-2">
          <Badge tone={a.tone}>{a.label}</Badge>
          <span className="label text-cocoa">{w.pages} págs.</span>
        </div>
        <h3 className="mt-1 font-display text-xl leading-tight sm:hidden">{w.title}</h3>
        <p className="clamp-2 mt-1.5 text-[14px] text-cocoa">{w.description}</p>
        <a href={w.fileUrl} className="label link mt-3 inline-block self-start">
          {w.access === "paid" ? `Comprar · ${formatPrice(w.price ?? 0)}` : "Descargar"}
        </a>
      </div>
    </article>
  );
}
