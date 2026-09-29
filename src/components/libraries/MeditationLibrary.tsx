"use client";

import Link from "next/link";
import { ParamChips, useParam } from "@/components/ui/ParamChips";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Row } from "@/components/Row";
import { MeditationCard } from "@/components/cards/MeditationCard";
import { meditations } from "@/content/meditations";
import { FEELINGS, MEDITATION_DURATIONS, MOMENTS, MOMENT_DESCRIPTIONS, labelOf } from "@/content/taxonomies";
import type { Feeling, Moment } from "@/content/types";

export function MeditationLibrary() {
  const moment = useParam("moment") as Moment | undefined;
  const feeling = useParam("feeling") as Feeling | undefined;
  const duration = Number(useParam("duration")) || undefined;

  const filtered = meditations.filter(
    (m) => (!moment || m.moment === moment) && (!feeling || m.feelings.includes(feeling)) && (!duration || m.duration === duration),
  );
  const isFiltering = !!(moment || feeling || duration);

  return (
    <>
      <section className="container-x space-y-4 py-8">
        <ParamChips param="moment" label="Por momento" options={MOMENTS} />
        <ParamChips param="feeling" label="Por lo que estás sintiendo" options={FEELINGS} />
        <ParamChips param="duration" label="Duración" options={MEDITATION_DURATIONS} />
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
            <div className="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 lg:grid-cols-4">
              {filtered.map((m) => (
                <MeditationCard key={m.id} m={m} />
              ))}
            </div>
          ) : (
            <p className="rounded-xs bg-cream-deep p-6 text-cocoa">Aún no hay meditaciones con esa combinación.</p>
          )}
        </section>
      ) : (
        MOMENTS.map((mo) => {
          const items = meditations.filter((m) => m.moment === mo.value);
          if (!items.length) return null;
          return (
            <section key={mo.value} className="container-x py-6 sm:py-8">
              <SectionHeading title={labelOf(MOMENTS, mo.value)} description={MOMENT_DESCRIPTIONS[mo.value]} href={`/meditaciones?moment=${mo.value}`} />
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
