import { classes } from "@/content/classes";
import type { ClassType, DurationBucket, Focus, MovementClass } from "@/content/types";

export interface MovementFilters {
  duration?: DurationBucket[];
  type?: ClassType[];
  focus?: Focus[];
  q?: string;
}

type SP = Record<string, string | string[] | undefined>;

const list = (v: string | string[] | undefined): string[] =>
  !v ? [] : Array.isArray(v) ? v : v.split(",").filter(Boolean);

export function parseMovementFilters(sp: SP): MovementFilters {
  return {
    duration: list(sp.duration).map(Number).filter(Boolean) as DurationBucket[],
    type: list(sp.type) as ClassType[],
    focus: list(sp.focus) as Focus[],
    q: typeof sp.q === "string" ? sp.q : undefined,
  };
}

export function filterClasses(f: MovementFilters, source: MovementClass[] = classes) {
  return source.filter((c) => {
    if (f.duration?.length && !f.duration.includes(c.duration)) return false;
    if (f.type?.length && !f.type.includes(c.type)) return false;
    if (f.focus?.length && !f.focus.some((x) => c.focus.includes(x))) return false;
    if (f.q && !c.title.toLowerCase().includes(f.q.toLowerCase())) return false;
    return true;
  });
}

export const activeFilterCount = (f: MovementFilters) =>
  (f.duration?.length ?? 0) + (f.type?.length ?? 0) + (f.focus?.length ?? 0);

/** Agrupa la biblioteca como la define el spec: Pilates Mat / Barre / Warm Ups / Stretching */
export const MOVEMENT_SECTIONS: { type: ClassType; title: string; blurb: string }[] = [
  { type: "pilates", title: "Pilates Mat", blurb: "Flow y Strength. De 5 minutos por zona a clases completas de 40." },
  { type: "barre", title: "Barre", blurb: "Movimientos pequeños, isométricos, que esculpen y mejoran tu postura." },
  { type: "warmup", title: "Warm Ups", blurb: "Shorts de calentamiento que se comparten entre clases. Cinco a diez minutos." },
  { type: "stretching", title: "Stretching", blurb: "Para cerrar tu clase o soltar tensión en cualquier momento del día." },
];
