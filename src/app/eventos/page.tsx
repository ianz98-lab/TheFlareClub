import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { PageHero } from "@/components/PageHero";
import { EventCard } from "@/components/cards/EventCard";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { pastEvents, upcomingEvents } from "@/content/events";
import { EVENT_CATEGORIES } from "@/content/taxonomies";
import { formatDate } from "@/lib/format";
import type { EventCategory } from "@/content/types";

export const metadata: Metadata = { title: "Eventos" };

export default async function EventosPage({ searchParams }: PageProps<"/eventos">) {
  const sp = await searchParams;
  const cat = typeof sp.cat === "string" ? (sp.cat as EventCategory) : undefined;
  const upcoming = upcomingEvents().filter((e) => !cat || e.category === cat);
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
      <section className="container-x py-8">
        <div className="scroll-row -mx-4 px-4 sm:mx-0 sm:flex-wrap sm:px-0">
          <Link href="/eventos" className={`h-9 shrink-0 rounded-full border px-3.5 text-[13px] font-medium leading-9 ${!cat ? "border-espresso bg-espresso text-cream" : "border-sand"}`}>
            Todos
          </Link>
          {EVENT_CATEGORIES.map((c) => (
            <Link key={c.value} href={`/eventos?cat=${c.value}`} className={`h-9 shrink-0 rounded-full border px-3.5 text-[13px] font-medium leading-9 ${cat === c.value ? "border-espresso bg-espresso text-cream" : "border-sand"}`}>
              {c.label}
            </Link>
          ))}
        </div>
        <div className="mt-8">
          <SectionHeading title="Próximos eventos" />
          <div className="grid gap-4 lg:grid-cols-2">
            {upcoming.map((e) => (
              <EventCard key={e.id} e={e} />
            ))}
          </div>
          {!upcoming.length && <p className="rounded-2xl bg-cream-deep p-6 text-cocoa">No hay eventos próximos en esta categoría.</p>}
        </div>
      </section>

      <section className="container-x py-10">
        <SectionHeading eyebrow="Recap" title="Eventos anteriores" description="Lo que ya vivimos juntas." />
        <div className="space-y-10">
          {past.map((e) => (
            <article key={e.id} className="grid gap-4 lg:grid-cols-[0.8fr_1.2fr]">
              <div>
                <p className="eyebrow">{formatDate(e.startsAt, { year: "numeric" })}</p>
                <h3 className="mt-1 font-display text-3xl leading-tight">{e.title}</h3>
                <p className="mt-2 text-[15px] text-cocoa">{e.description}</p>
                <Link href={`/eventos/${e.slug}`} className="mt-3 inline-block text-sm font-medium text-terracotta hover:underline">
                  Ver recap
                </Link>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {(e.gallery ?? [e.image]).slice(0, 3).map((g, i) => (
                  <div key={i} className={`relative overflow-hidden rounded-2xl ${i === 0 ? "col-span-2 row-span-2 aspect-[4/3]" : "aspect-square"}`}>
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
