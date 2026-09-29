import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { PageHero } from "@/components/PageHero";
import { EventLibrary } from "@/components/libraries/EventLibrary";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { pastEvents } from "@/content/events";
import { formatDate } from "@/lib/format";

export const metadata: Metadata = { title: "Eventos" };

export default function EventosPage() {
  const past = pastEvents();
  return (
    <>
      <PageHero
        eyebrow="Eventos"
        title="Vernos en persona"
        description="Flare Events de día y Night Editions. Clases, meditación, brunch y comunidad."
        tone="sky"
        image="/images/clase-03.jpg"
      />
      <Suspense>
        <EventLibrary />
      </Suspense>

      <section className="container-x py-10">
        <SectionHeading eyebrow="Recap" title="Eventos anteriores" description="Lo que ya vivimos juntas." />
        <div className="space-y-10">
          {past.map((e) => (
            <article key={e.id} className="grid gap-4 lg:grid-cols-[0.8fr_1.2fr]">
              <div>
                <p className="label text-cocoa">{formatDate(e.startsAt, { year: "numeric" })}</p>
                <h3 className="mt-1 font-display text-3xl leading-tight">{e.title}</h3>
                <p className="mt-2 text-[15px] text-cocoa">{e.description}</p>
                <Link href={`/eventos/${e.slug}`} className="mt-3 inline-block text-sm font-medium text-terracotta hover:underline">
                  Ver recap
                </Link>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {(e.gallery ?? [e.image]).slice(0, 3).map((g, i) => (
                  <div key={i} className={`relative overflow-hidden rounded-xs ${i === 0 ? "col-span-2 row-span-2 aspect-[4/3]" : "aspect-square"}`}>
                    <Image src={g} alt="" fill sizes="(min-width: 1024px) 300px, 45vw" className="object-cover" />
                  </div>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
