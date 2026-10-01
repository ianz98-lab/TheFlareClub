import { classes } from "@/content/classes";
import { meditations } from "@/content/meditations";
import { videoById } from "@/content/videos";
import type { Meditation, MovementClass, Video } from "@/content/types";

/**
 * Rutinas: el usuario arma una sesión por pasos. Cada paso solo ofrece el
 * contenido que tiene sentido ahí (calentamiento → clase → estiramiento → cierre).
 * Se reproduce en un solo player con transición automática entre videos.
 */

export type StepKey = "warmup" | "classes" | "stretch" | "close";

export interface RoutineStepDef {
  key: StepKey;
  title: string;
  hint: string;
  optional: boolean;
  /** cuántos ítems admite el paso */
  max: number;
}

export const STEPS: RoutineStepDef[] = [
  { key: "warmup", title: "Calentamiento", hint: "De 5 a 10 minutos para activar el cuerpo.", optional: true, max: 1 },
  { key: "classes", title: "Clase", hint: "Pilates o Barre. Puedes combinar hasta tres.", optional: false, max: 3 },
  { key: "stretch", title: "Estiramiento", hint: "Cierra el cuerpo con un estiramiento.", optional: true, max: 1 },
  { key: "close", title: "Meditación", hint: "Si quieres, una meditación corta para cerrar y volver a ti.", optional: true, max: 1 },
];

export interface Routine {
  id: string;
  name: string;
  warmup?: string;
  classes: string[];
  stretch?: string;
  close?: string;
  createdAt: number;
}

export interface QueueItem {
  kind: "class" | "meditation";
  stepKey: StepKey;
  id: string;
  slug: string;
  title: string;
  video: Video;
  durationMin: number;
}

/* ---------- pools por paso: solo lo que tiene sentido ---------- */
export const poolFor = (key: StepKey): (MovementClass | Meditation)[] => {
  switch (key) {
    case "warmup":
      return classes.filter((c) => c.type === "warmup");
    case "classes":
      return classes.filter((c) => c.type === "pilates" || c.type === "barre");
    case "stretch":
      return classes.filter((c) => c.type === "stretching");
    case "close":
      return meditations.filter((m) => m.duration <= 10);
  }
};

export const isClass = (x: MovementClass | Meditation): x is MovementClass => "type" in x;

export function idsOf(r: Routine, key: StepKey): string[] {
  if (key === "classes") return r.classes;
  const v = r[key];
  return v ? [v] : [];
}

export function withIds(r: Routine, key: StepKey, ids: string[]): Routine {
  if (key === "classes") return { ...r, classes: ids };
  return { ...r, [key]: ids[0] };
}

export function toQueue(r: Routine): QueueItem[] {
  const out: QueueItem[] = [];
  for (const step of STEPS) {
    for (const id of idsOf(r, step.key)) {
      if (step.key === "close") {
        const m = meditations.find((x) => x.id === id);
        if (m) out.push({ kind: "meditation", stepKey: step.key, id: m.id, slug: m.slug, title: m.title, video: videoById(m.videoId), durationMin: m.duration });
      } else {
        const c = classes.find((x) => x.id === id);
        if (c) out.push({ kind: "class", stepKey: step.key, id: c.id, slug: c.slug, title: c.title, video: videoById(c.videoId), durationMin: c.duration });
      }
    }
  }
  return out;
}

export const totalMinutes = (r: Routine) => toQueue(r).reduce((a, q) => a + q.durationMin, 0);

export const emptyRoutine = (): Routine => ({ id: `r-${Date.now().toString(36)}`, name: "", classes: [], createdAt: Date.now() });

/* ---------- rutinas predeterminadas (CAMBIOS PAGINA WEB.docx) ---------- */
const find = (slug: string) => classes.find((c) => c.slug === slug)?.id ?? "";

export interface RoutinePreset extends Routine {
  /** "Reset rápido", "Express"... (va junto a los minutos: "5 min — Reset rápido") */
  kicker: string;
  blurb: string;
}

export const PRESETS: RoutinePreset[] = [
  {
    id: "preset-5",
    kicker: "Reset rápido",
    name: "Solo 5",
    blurb: "Unos minutos de movimiento para esos días en los que el tiempo es poco.",
    classes: [find("5-min-pilates-abs")],
    createdAt: 0,
  },
  {
    id: "preset-15",
    kicker: "Express",
    name: "Muévete 15",
    blurb: "Una rutina corta y efectiva para hacer espacio para el movimiento en tu día.",
    warmup: find("warm-up-lower-body"),
    classes: [find("10-min-pilates-legs")],
    createdAt: 0,
  },
  {
    id: "preset-30",
    kicker: "Movement",
    name: "Tu media hora",
    blurb: "Una sesión completa para moverte, conectar con tu cuerpo y seguir con tu día.",
    warmup: find("warm-up-lower-body"),
    classes: [find("20-min-pilates-full-body")],
    stretch: find("stretching-full-body-5-min"),
    createdAt: 0,
  },
  {
    id: "preset-60",
    kicker: "Full session",
    name: "Una hora para ti",
    blurb: "Calentamiento, clase y estiramiento para regalarte una sesión completa.",
    warmup: find("warm-up-full-body"),
    classes: [find("barre-40-min")],
    stretch: find("stretching-full-body-10-min"),
    createdAt: 0,
  },
];

export const ROUTINE_KEYS = {
  saved: "tfc:routines",
  current: "tfc:routine-current",
  last: "tfc:routine-last",
} as const;
