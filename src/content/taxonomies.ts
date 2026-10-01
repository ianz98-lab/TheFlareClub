import type {
  ClassType,
  DurationBucket,
  Feeling,
  Focus,
  Moment,
  TagOption,
  TalkCategory,
} from "./types";

export const DURATIONS: TagOption<DurationBucket>[] = [
  { value: 5, label: "5 min" },
  { value: 10, label: "10 min" },
  { value: 20, label: "20 min" },
  { value: 30, label: "30 min" },
  { value: 40, label: "40 min" },
];

export const MEDITATION_DURATIONS: TagOption<5 | 10 | 15 | 20>[] = [
  { value: 5, label: "5 min" },
  { value: 10, label: "10 min" },
  { value: 15, label: "15 min" },
  { value: 20, label: "20 min" },
];

export const CLASS_TYPES: TagOption<ClassType>[] = [
  { value: "pilates", label: "Pilates" },
  { value: "barre", label: "Barre" },
  { value: "warmup", label: "Calentamientos" },
  { value: "stretching", label: "Estiramientos" },
];

export const FOCUS: TagOption<Focus>[] = [
  { value: "full-body", label: "Full Body" },
  { value: "upper-body", label: "Upper Body" },
  { value: "lower-body", label: "Lower Body" },
  { value: "arms", label: "Arms" },
  { value: "abs", label: "Abs" },
  { value: "glutes", label: "Glutes" },
  { value: "back", label: "Back" },
  { value: "legs", label: "Legs" },
  { value: "inner-thighs", label: "Inner Thighs" },
  { value: "biceps", label: "Biceps" },
  { value: "shoulders", label: "Shoulders" },
  { value: "triceps", label: "Triceps" },
  { value: "hamstrings", label: "Hamstrings" },
  { value: "quads", label: "Quads" },
];

/** Enfoques principales que se muestran como filtro (el resto aparecen en la card). */
export const FOCUS_PRIMARY: Focus[] = [
  "full-body",
  "upper-body",
  "lower-body",
  "arms",
  "abs",
  "glutes",
  "back",
  "legs",
];

export const MOMENTS: TagOption<Moment>[] = [
  { value: "morning", label: "Mañana" },
  { value: "night", label: "Noche" },
  { value: "stress", label: "Estrés" },
  { value: "abundance", label: "Abundancia" },
  { value: "other", label: "Otras" },
];

export const FEELINGS: TagOption<Feeling>[] = [
  { value: "estres", label: "Estrés" },
  { value: "ansiedad", label: "Ansiedad" },
  { value: "volver-a-ti", label: "Volver a ti" },
  { value: "soltar", label: "Soltar" },
  { value: "claridad", label: "Claridad" },
  { value: "gratitud", label: "Gratitud" },
  { value: "abundancia", label: "Abundancia" },
  { value: "confianza", label: "Confianza" },
  { value: "amor-propio", label: "Amor propio" },
];

export const TALK_CATEGORIES: TagOption<TalkCategory>[] = [
  { value: "nutricion", label: "Nutrición" },
  { value: "autoestima", label: "Autoestima" },
  { value: "imagen-personal", label: "Imagen personal" },
  { value: "relaciones", label: "Relaciones" },
  { value: "habitos", label: "Hábitos" },
  { value: "estres", label: "Manejo del estrés" },
  { value: "bienestar", label: "Bienestar" },
  { value: "productividad", label: "Productividad" },
  { value: "sueno", label: "Sueño" },
  { value: "finanzas", label: "Finanzas personales" },
];

export function labelOf<T extends string | number>(
  options: TagOption<T>[],
  value: T,
): string {
  return options.find((o) => o.value === value)?.label ?? String(value);
}
