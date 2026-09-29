import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/PageHero";
import { TalkCard } from "@/components/cards/TalkCard";
import { talks } from "@/content/talks";
import { TALK_CATEGORIES } from "@/content/taxonomies";
import type { TalkCategory } from "@/content/types";

export const metadata: Metadata = { title: "Charlas" };

export default async function CharlasPage({ searchParams }: PageProps<"/charlas">) {
  const sp = await searchParams;
  const cat = typeof sp.cat === "string" ? (sp.cat as TalkCategory) : undefined;
  const items = cat ? talks.filter((t) => t.category === cat) : talks;
  const used = new Set(talks.map((t) => t.category));

  return (
    <>
      <PageHero
        eyebrow="Charlas"
        title="Conversaciones con expertas"
        description="Nutrición, autoestima, relaciones, hábitos, sueño, finanzas. Charlas pregrabadas para ver cuando quieras."
        tone="sand"
        image="/images/coaches-mariana-sofi-retrato.jpg"
      />
      <section className="container-x py-8">
        <div className="scroll-row -mx-4 px-4 sm:mx-0 sm:flex-wrap sm:px-0">
          <Link href="/charlas" className={`h-9 shrink-0 rounded-full border px-3.5 text-[13px] font-medium leading-9 ${!cat ? "border-espresso bg-espresso text-cream" : "border-sand"}`}>
            Todas
          </Link>
          {TALK_CATEGORIES.map((c) => (
            <Link
              key={c.value}
              href={`/charlas?cat=${c.value}`}
              className={`h-9 shrink-0 rounded-full border px-3.5 text-[13px] font-medium leading-9 ${
                cat === c.value ? "border-espresso bg-espresso text-cream" : "border-sand"
              } ${used.has(c.value) ? "" : "opacity-50"}`}
            >
              {c.label}
            </Link>
          ))}
        </div>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((t) => (
            <TalkCard key={t.id} t={t} />
          ))}
        </div>
        {!items.length && <p className="rounded-2xl bg-cream-deep p-6 text-cocoa">Pronto habrá charlas en esta categoría.</p>}
      </section>
    </>
  );
}
