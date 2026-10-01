"use client";

import { useState } from "react";
import { EpisodeRow } from "@/components/cards/EpisodeRow";
import { RevealList } from "@/components/motion/Reveal";
import { Button } from "@/components/ui/Button";
import { episodes } from "@/content/podcast";

/** Episodios que se ven de entrada; el resto aparece con "Ver todos". */
const INITIAL = 8;
const LIST_ID = "podcast-episodios";

/**
 * Lista completa de episodios (datos reales de Spotify), del más nuevo al más viejo.
 * Sin categorías: las de antes eran inventadas. Los episodios ocultos igual van en el HTML
 * (solo se esconden con CSS) para que el export estático los tenga todos.
 * Las filas entran solo con opacidad (RevealList); las que se muestran con "Ver todos" aparecen sin animación.
 */
export function PodcastLibrary() {
  const [expanded, setExpanded] = useState(false);
  const hasMore = episodes.length > INITIAL;

  const showAll = () => {
    setExpanded(true);
    // El botón desaparece: el foco pasa al primer episodio recién mostrado.
    requestAnimationFrame(() => document.getElementById(LIST_ID)?.children[INITIAL]?.querySelector("a")?.focus());
  };

  return (
    <>
      <RevealList as="ul" id={LIST_ID} className="mt-4 border-b border-line">
        {episodes.map((ep, i) => (
          <li key={ep.id} className={`rule-soft ${i >= INITIAL && !expanded ? "hidden" : ""}`}>
            <EpisodeRow ep={ep} />
          </li>
        ))}
      </RevealList>

      {hasMore && !expanded && (
        <Button variant="outline" size="lg" onClick={showAll} aria-controls={LIST_ID} aria-expanded={false} className="mt-8 w-full sm:w-auto">
          Ver todos los episodios ({episodes.length})
        </Button>
      )}
    </>
  );
}
