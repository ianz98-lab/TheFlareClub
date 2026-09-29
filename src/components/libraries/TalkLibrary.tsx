"use client";

import { ParamChips, useParam } from "@/components/ui/ParamChips";
import { TalkCard } from "@/components/cards/TalkCard";
import { talks } from "@/content/talks";
import { TALK_CATEGORIES } from "@/content/taxonomies";

export function TalkLibrary() {
  const cat = useParam("cat");
  const items = cat ? talks.filter((t) => t.category === cat) : talks;
  const used = new Set<string>(talks.map((t) => t.category));

  return (
    <section className="container-x py-8">
      <ParamChips param="cat" allLabel="Todas" options={TALK_CATEGORIES.map((c) => ({ ...c, muted: !used.has(c.value) }))} />
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((t) => (
          <TalkCard key={t.id} t={t} />
        ))}
      </div>
      {!items.length && <p className="rounded-2xl bg-cream-deep p-6 text-cocoa">Pronto habrá charlas en esta categoría.</p>}
    </section>
  );
}
