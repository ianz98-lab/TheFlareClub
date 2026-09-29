"use client";

import { ParamChips, useParam } from "@/components/ui/ParamChips";
import { EventCard } from "@/components/cards/EventCard";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { upcomingEvents } from "@/content/events";
import { EVENT_CATEGORIES } from "@/content/taxonomies";

export function EventLibrary() {
  const cat = useParam("cat");
  const upcoming = upcomingEvents().filter((e) => !cat || e.category === cat);
  return (
    <section className="container-x py-8">
      <ParamChips param="cat" allLabel="Todos" options={EVENT_CATEGORIES} />
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
  );
}
