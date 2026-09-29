"use client";

import { ContentFinder } from "./ContentFinder";
import { ClassCard } from "@/components/cards/ClassCard";
import { MeditationCard } from "@/components/cards/MeditationCard";
import { TalkCard } from "@/components/cards/TalkCard";
import { WorkbookCard } from "@/components/cards/WorkbookCard";
import { classes } from "@/content/classes";
import { meditations } from "@/content/meditations";
import { talks } from "@/content/talks";
import { workbooks } from "@/content/workbooks";
import { instructorById } from "@/content/instructors";
import { CLASS_TYPES, DURATIONS, FEELINGS, FOCUS, FOCUS_PRIMARY, MEDITATION_DURATIONS, MOMENTS, TALK_CATEGORIES } from "@/content/taxonomies";
import type { MovementClass } from "@/content/types";

const byNewest = <T extends { publishedAt: string }>(a: T, b: T) => b.publishedAt.localeCompare(a.publishedAt);
const str = (o: { value: string | number; label: string }) => ({ value: String(o.value), label: o.label });

/* ---------------- Movement ---------------- */
export function MovementFinder({ pool = classes }: { pool?: MovementClass[] }) {
  return (
    <ContentFinder
      items={pool}
      getKey={(c) => c.id}
      renderItem={(c) => <ClassCard c={c} />}
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

/* ---------------- Charlas ---------------- */
export function TalkFinder() {
  const used = new Set(talks.map((t) => t.category));
  return (
    <ContentFinder
      items={talks}
      getKey={(t) => t.id}
      renderItem={(t) => <TalkCard t={t} />}
      tabParam="cat"
      tabs={[{ value: "", label: "Todas" }, ...TALK_CATEGORIES.filter((c) => used.has(c.value)).map((c) => ({ value: c.value, label: c.label, match: (t: (typeof talks)[number]) => t.category === c.value }))]}
      facets={[
        {
          key: "expert",
          label: "Experta",
          options: [...new Set(talks.map((t) => t.expertId))].map((id) => ({ value: id, label: instructorById(id).name })),
          match: (t, v) => v.includes(t.expertId),
        },
      ]}
      search={(t, q) => `${t.title} ${t.specialty}`.toLowerCase().includes(q.toLowerCase())}
      searchPlaceholder="Buscar charla o tema"
      sorts={[
        { value: "new", label: "Más nuevas", cmp: byNewest },
        { value: "short", label: "Más cortas", cmp: (a, b) => a.durationMin - b.durationMin },
      ]}
      noun={["charla", "charlas"]}
      gridClass="grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
    />
  );
}

/* ---------------- Workbooks ---------------- */
export function WorkbookFinder() {
  return (
    <ContentFinder
      items={workbooks}
      getKey={(w) => w.id}
      renderItem={(w) => <WorkbookCard w={w} />}
      tabParam="access"
      tabs={[
        { value: "", label: "Todos" },
        { value: "member", label: "Membresía", match: (w) => w.access === "member" },
        { value: "free", label: "Gratuitos", match: (w) => w.access === "free" },
        { value: "paid", label: "Pago individual", match: (w) => w.access === "paid" },
      ]}
      facets={[]}
      search={(w, q) => w.title.toLowerCase().includes(q.toLowerCase())}
      searchPlaceholder="Buscar workbook"
      noun={["workbook", "workbooks"]}
      gridClass="grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
    />
  );
}
