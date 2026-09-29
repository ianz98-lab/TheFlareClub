"use client";

import { useSearchParams } from "next/navigation";
import { MovementFilters } from "@/components/MovementFilters";
import { ClassCard } from "@/components/cards/ClassCard";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Row } from "@/components/Row";
import { classes } from "@/content/classes";
import { activeFilterCount, filterClasses, MOVEMENT_SECTIONS, parseMovementFilters } from "@/lib/movement";

export function MovementLibrary() {
  const sp = useSearchParams();
  const filters = parseMovementFilters(Object.fromEntries(sp.entries()));
  const filtered = filterClasses(filters);
  const isFiltering = activeFilterCount(filters) > 0 || !!filters.q;

  return (
    <>
      <section className="container-x py-8">
        <div className="border-t border-espresso pt-5">
          <MovementFilters total={filtered.length} />
        </div>
      </section>

      {isFiltering ? (
        <section className="container-x pb-12">
          <SectionHeading title={`${filtered.length} ${filtered.length === 1 ? "clase" : "clases"}`} description="Resultado de tus filtros." />
          {filtered.length ? (
            <div className="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 lg:grid-cols-4">
              {filtered.map((c) => (
                <ClassCard key={c.id} c={c} />
              ))}
            </div>
          ) : (
            <p className="rounded-xs bg-cream-deep p-6 text-cocoa">No hay clases con esa combinación todavía. Prueba quitando un filtro.</p>
          )}
        </section>
      ) : (
        MOVEMENT_SECTIONS.map((s) => (
          <section key={s.type} className="container-x py-6 sm:py-8">
            <SectionHeading title={s.title} description={s.blurb} href={`/movement?type=${s.type}`} linkLabel={`Ver ${s.title}`} />
            <Row>
              {classes
                .filter((c) => c.type === s.type)
                .map((c) => (
                  <ClassCard key={c.id} c={c} size="row" />
                ))}
            </Row>
          </section>
        ))
      )}
    </>
  );
}
