import type { Metadata } from "next";
import { Suspense } from "react";
import { PageHero } from "@/components/PageHero";
import { MovementFilters } from "@/components/MovementFilters";
import { ClassCard } from "@/components/cards/ClassCard";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Row } from "@/components/Row";
import { classes } from "@/content/classes";
import { activeFilterCount, filterClasses, MOVEMENT_SECTIONS, parseMovementFilters } from "@/lib/movement";

export const metadata: Metadata = { title: "Movement" };

export default async function MovementPage({ searchParams }: PageProps<"/movement">) {
  const sp = await searchParams;
  const filters = parseMovementFilters(sp);
  const filtered = filterClasses(filters);
  const isFiltering = activeFilterCount(filters) > 0 || !!filters.q;

  return (
    <>
      <PageHero
        eyebrow="Movement"
        title="Tu biblioteca de clases"
        description="Pilates Mat, Barre, warm-ups y stretching. Filtra por tiempo, tipo y zona. Cada clase incluye un short de calentamiento."
        tone="rose"
        image="/images/clase-pilates-squat-ventanal.jpg"
      />

      <section className="container-x py-8">
        <div className="rounded-3xl bg-white/60 p-4 ring-1 ring-sand/60 sm:p-6">
          <Suspense>
            <MovementFilters total={filtered.length} />
          </Suspense>
        </div>
      </section>

      {isFiltering ? (
        <section className="container-x pb-12">
          <SectionHeading title={`${filtered.length} ${filtered.length === 1 ? "clase" : "clases"}`} description="Resultado de tus filtros." />
          {filtered.length ? (
            <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
              {filtered.map((c) => (
                <ClassCard key={c.id} c={c} />
              ))}
            </div>
          ) : (
            <p className="rounded-2xl bg-cream-deep p-6 text-cocoa">
              No hay clases con esa combinación todavía. Prueba quitando un filtro.
            </p>
          )}
        </section>
      ) : (
        MOVEMENT_SECTIONS.map((s) => {
          const items = classes.filter((c) => c.type === s.type);
          return (
            <section key={s.type} className="container-x py-6 sm:py-8">
              <SectionHeading title={s.title} description={s.blurb} href={`/movement?type=${s.type}`} linkLabel={`Ver ${s.title}`} />
              <Row>
                {items.map((c) => (
                  <ClassCard key={c.id} c={c} size="row" />
                ))}
              </Row>
            </section>
          );
        })
      )}
    </>
  );
}
