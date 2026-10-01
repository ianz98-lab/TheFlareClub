"use client";

import { ContentFinder } from "./ContentFinder";
import { ClassCard } from "@/components/cards/ClassCard";
import { MeditationCard } from "@/components/cards/MeditationCard";
import { classes } from "@/content/classes";
import { meditations } from "@/content/meditations";
import { CLASS_TYPES, DURATIONS, FEELINGS, FOCUS, FOCUS_PRIMARY, MEDITATION_DURATIONS, MOMENTS } from "@/content/taxonomies";
import type { MovementClass } from "@/content/types";

/*
 * Buscadores de biblioteca. Solo Movement y Meditaciones: Charlas y Workbooks ya no usan
 * filtros (pedido de las fundadoras, 30-sep-2026; se activan cuando haya suficiente contenido).
 */

const byNewest = <T extends { publishedAt: string }>(a: T, b: T) => b.publishedAt.localeCompare(a.publishedAt);
const str = (o: { value: string | number; label: string }) => ({ value: String(o.value), label: o.label });

/* ---------------- Movement ---------------- */
export function MovementFinder({ pool = classes }: { pool?: MovementClass[] }) {
  return (
    <ContentFinder
      items={pool}
      getKey={(c) => c.id}
      renderItem={(c) => <ClassCard c={c} />}
      // Pestañas: Todas · Pilates · Barre · Calentamientos · Estiramientos (?type=warmup|stretching)
      tabParam="type"
      tabs={[{ value: "", label: "Todas" }, ...CLASS_TYPES.map((t) => ({ value: t.value, label: t.label, match: (c: MovementClass) => c.type === t.value }))]}
      facets={[
        { key: "duration", label: "Duración", multi: true, options: DURATIONS.map(str), match: (c, v) => v.includes(String(c.duration)) },
        { key: "focus", label: "Enfoque", multi: true, options: FOCUS.filter((f) => FOCUS_PRIMARY.includes(f.value)).map(str), match: (c, v) => v.some((x) => c.focus.includes(x as MovementClass["focus"][number])) },
        {
          key: "style",
          label: "Estilo",
          options: [
            { value: "pilates-flow", label: "Flow" },
            { value: "pilates-strength", label: "Strength" },
          ],
          match: (c, v) => v.includes(c.style),
        },
      ]}
      search={(c, q) => c.title.toLowerCase().includes(q.toLowerCase())}
      searchPlaceholder="Buscar clase"
      sorts={[
        { value: "new", label: "Más nuevas", cmp: byNewest },
        { value: "short", label: "Más cortas", cmp: (a, b) => a.duration - b.duration },
        { value: "long", label: "Más largas", cmp: (a, b) => b.duration - a.duration },
      ]}
      noun={["clase", "clases"]}
      // Movement ya pone el h2 «Clases» justo encima del buscador
      resultsHeading={null}
    />
  );
}

/* ---------------- Meditaciones ---------------- */
export function MeditationFinder() {
  return (
    <ContentFinder
      items={meditations}
      getKey={(m) => m.id}
      renderItem={(m) => <MeditationCard m={m} />}
      tabParam="moment"
      tabs={[{ value: "", label: "Todas" }, ...MOMENTS.map((mo) => ({ value: mo.value, label: mo.label, match: (m: (typeof meditations)[number]) => m.moment === mo.value }))]}
      facets={[
        { key: "feeling", label: "Cómo te sientes", multi: true, options: FEELINGS.map(str), match: (m, v) => v.some((x) => (m.feelings as string[]).includes(x)) },
        { key: "duration", label: "Duración", multi: true, options: MEDITATION_DURATIONS.map(str), match: (m, v) => v.includes(String(m.duration)) },
      ]}
      search={(m, q) => m.title.toLowerCase().includes(q.toLowerCase())}
      searchPlaceholder="Buscar meditación"
      sorts={[
        { value: "new", label: "Más nuevas", cmp: byNewest },
        { value: "short", label: "Más cortas", cmp: (a, b) => a.duration - b.duration },
      ]}
      noun={["meditación", "meditaciones"]}
    />
  );
}
