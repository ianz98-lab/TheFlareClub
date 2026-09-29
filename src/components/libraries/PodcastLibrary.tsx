"use client";

import { ParamChips, useParam } from "@/components/ui/ParamChips";
import { EpisodeRow } from "@/components/cards/EpisodeRow";
import { episodes } from "@/content/podcast";
import { PODCAST_CATEGORIES } from "@/content/taxonomies";

export function PodcastLibrary() {
  const cat = useParam("cat");
  const items = cat ? episodes.filter((e) => e.category === cat) : episodes;
  return (
    <>
      <ParamChips param="cat" allLabel="Todos" options={PODCAST_CATEGORIES} />
      <div className="mt-6 divide-y divide-sand/50">
        {items.map((e) => (
          <div key={e.id} className="py-2">
            <EpisodeRow ep={e} />
          </div>
        ))}
      </div>
    </>
  );
}
