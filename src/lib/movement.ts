import type { ClassStyle, ClassType, Level } from "@/content/types";
import { totalMinutes, type Routine, type RoutinePreset } from "@/lib/routine";

/* ---------- textos visibles (los slugs internos warmup/stretching nunca se muestran) ---------- */

/** Tipo en singular para tarjetas y detalle: "Calentamiento", no "Calentamientos" (esas son las pestañas). */
export const CLASS_TYPE_SINGULAR: Record<ClassType, string> = {
  pilates: "Pilates",
  barre: "Barre",
  warmup: "Calentamiento",
  stretching: "Estiramiento",
};

/** Estilo de la clase. Pilates Flow / Strength y Barre en inglés, como los usa la marca. */
export const CLASS_STYLE_LABEL: Record<ClassStyle, string> = {
  "pilates-flow": "Pilates Flow",
  "pilates-strength": "Pilates Strength",
  barre: "Barre",
  warmup: "Calentamiento",
  stretching: "Estiramiento",
};

export const LEVEL_LABEL: Record<Level, string> = {
  todos: "Todos los niveles",
  principiante: "Principiante",
  intermedio: "Intermedio",
  avanzado: "Avanzado",
};

/* ---------- rutinas (herramienta de Movement) ---------- */

/**
 * "Calentamiento · 1 clase · estiramiento · meditación": en el orden en que se reproduce y con
 * mayúscula inicial. Única fuente para describir una rutina (constructor y Mi cuenta).
 */
export function describeRoutine(r: Routine): string {
  const n = r.classes.length;
  const text = [r.warmup && "calentamiento", n > 0 && `${n} ${n === 1 ? "clase" : "clases"}`, r.stretch && "estiramiento", r.close && "meditación"]
    .filter(Boolean)
    .join(" · ");
  return text.charAt(0).toUpperCase() + text.slice(1);
}

/** "5 min — Reset rápido" (la clase .label lo pone en mayúsculas) */
export const presetLabel = (p: RoutinePreset) => `${totalMinutes(p)} min — ${p.kicker}`;

/** Abre el constructor con la rutina predeterminada cargada y lista para "Empezar". */
export const presetHref = (p: RoutinePreset) => `/rutina?preset=${p.id}`;
