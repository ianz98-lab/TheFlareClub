import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/PageHero";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Row } from "@/components/Row";
import { MeditationCard } from "@/components/cards/MeditationCard";
import { meditations } from "@/content/meditations";
import { FEELINGS, MEDITATION_DURATIONS, MOMENTS, MOMENT_DESCRIPTIONS, labelOf } from "@/content/taxonomies";
import type { Feeling, Moment } from "@/content/types";

export const metadata: Metadata = { title: "Meditaciones" };

export default async function MeditacionesPage({ searchParams }: PageProps<"/meditaciones">) {
  const sp = await searchParams;
  const moment = typeof sp.moment === "string" ? (sp.moment as Moment) : undefined;
  const feeling = typeof sp.feeling === "string" ? (sp.feeling as Feeling) : undefined;
  const duration = typeof sp.duration === "string" ? Number(sp.duration) : undefined;

  const filtered = meditations.filter(
    (m) =>
      (!moment || m.moment === moment) &&
      (!feeling || m.feelings.includes(feeling)) &&
      (!duration || m.duration === duration),
  );
  const isFiltering = !!(moment || feeling || duration);

  const chip = (active: boolean) =>
    `h-9 shrink-0 rounded-full border px-3.5 text-[13px] font-medium transition-colors ${
      active ? "border-espresso bg-espresso text-cream" : "border-sand bg-cream hover:bg-cream-deep"
    }`;

  const qs = (patch: Record<string, string | undefined>) => {
    const p = new URLSearchParams();
    const merged = { moment, feeling, duration: duration ? String(duration) : undefined, ...patch };
    Object.entries(merged).forEach(([k, v]) => v && p.set(k, v));
    const s = p.toString();
    return `/meditaciones${s ? `?${s}` : ""}`;
  };

  return (
    <>
      <PageHero
        eyebrow="Meditaciones"
        title="Calma para cualquier momento"
        description="Por momento del día o por lo que estás sintiendo. De cinco a veinte minutos, guiadas por Sofi."
        tone="sage"
        image="/images/meditacion-clase-ventanal.jpg"
      />

      <section className="container-x space-y-4 py-8">
        <div>
          <p className="mb-2 text-[11px] font-medium uppercase tracking-[0.18em] text-cocoa">Por momento</p>
          <div className="scroll-row -mx-4 px-4 sm:mx-0 sm:flex-wrap sm:px-0">
            {MOMENTS.map((o) => (
              <Link key={o.value} href={qs({ moment: moment === o.value ? undefined : o.value })} className={chip(moment === o.value)}>
                {o.label}
              </Link>
            ))}
          </div>
        </div>
        <div>
          <p className="mb-2 text-[11px] font-medium uppercase tracking-[0.18em] text-cocoa">Por lo que estás sintiendo</p>
          <div className="scroll-row -mx-4 px-4 sm:mx-0 sm:flex-wrap sm:px-0">
            {FEELINGS.map((o) => (
              <Link key={o.value} href={qs({ feeling: feeling === o.value ? undefined : o.value })} className={chip(feeling === o.value)}>
                {o.label}
              </Link>
            ))}
          </div>
        </div>
        <div>
          <p className="mb-2 text-[11px] font-medium uppercase tracking-[0.18em] text-cocoa">Duración</p>
          <div className="scroll-row -mx-4 px-4 sm:mx-0 sm:flex-wrap sm:px-0">
            {MEDITATION_DURATIONS.map((o) => (
              <Link key={o.value} href={qs({ duration: duration === o.value ? undefined : String(o.value) })} className={chip(duration === o.value)}>
                {o.label}
              </Link>
            ))}
          </div>
        </div>
        {isFiltering && (
          <Link href="/meditaciones" className="inline-block text-sm font-medium text-terracotta hover:underline">
            Limpiar filtros
          </Link>
        )}
      </section>

      {isFiltering ? (
        <section className="container-x pb-12">
          <SectionHeading title={`${filtered.length} ${filtered.length === 1 ? "meditación" : "meditaciones"}`} />
          {filtered.length ? (
            <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
              {filtered.map((m) => (
                <MeditationCard key={m.id} m={m} />
              ))}
            </div>
          ) : (
            <p className="rounded-2xl bg-cream-deep p-6 text-cocoa">Aún no hay meditaciones con esa combinación.</p>
          )}
        </section>
      ) : (
        MOMENTS.map((mo) => {
          const items = meditations.filter((m) => m.moment === mo.value);
          if (!items.length) return null;
          return (
            <section key={mo.value} className="container-x py-6 sm:py-8">
              <SectionHeading title={labelOf(MOMENTS, mo.value)} description={MOMENT_DESCRIPTIONS[mo.value]} href={qs({ moment: mo.value })} />
              <Row>
                {items.map((m) => (
                  <MeditationCard key={m.id} m={m} size="row" />
                ))}
              </Row>
            </section>
          );
        })
      )}
    </>
  );
}
