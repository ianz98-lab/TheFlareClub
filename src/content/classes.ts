import type { MovementClass } from "./types";

type Seed = Omit<MovementClass, "id" | "publishedAt" | "access" | "equipment" | "level"> &
  Partial<Pick<MovementClass, "access" | "equipment" | "level" | "publishedAt">>;

const mk = (s: Seed, i: number): MovementClass => ({
  id: `cls-${s.slug}`,
  access: "member",
  equipment: ["Mat"],
  level: "todos",
  publishedAt: `2026-0${(i % 6) + 3}-${String((i % 27) + 1).padStart(2, "0")}`,
  ...s,
});

/** Zonas en español para las descripciones (los títulos conservan el nombre en inglés de la marca). */
const ZONA_ES: Record<string, string> = { "Arms": "los brazos", "Abs": "el abdomen", "Glutes": "los glúteos", "Inner Thighs": "los aductores", "Back": "la espalda", "Biceps": "los bíceps", "Shoulders": "los hombros", "Triceps": "los tríceps", "Hamstrings": "los isquiotibiales", "Quads": "los cuádriceps" };

/** Zonas con tren secundario: brazos y espalda suman "Upper Body"; piernas y glúteos, "Lower Body". El abdomen va solo. */
const UPPER: string[] = ["arms", "back", "biceps", "shoulders", "triceps"];

/** Duración en palabras para las descripciones ("Cinco minutos…"). */
const MINUTOS: Record<number, string> = { 5: "Cinco", 10: "Diez", 20: "Veinte", 30: "Treinta", 40: "Cuarenta" };

/*
 * Descripciones semilla: cortas y factuales (zona, duración y equipo), sin "X: Y" ni tríadas.
 * Las reales las escriben las fundadoras al subir cada clase.
 */

const seeds: Seed[] = [
  /* ---------- Calentamientos (cortos, compartidos) ---------- */
  {
    slug: "warm-up-upper-body",
    title: "Calentamiento Upper Body",
    description: "Cinco minutos para preparar el tren superior antes de tu clase. Solo necesitas tu mat.",
    videoId: "wu-upper",
    instructorId: "mariana",
    type: "warmup",
    style: "warmup",
    duration: 5,
    focus: ["upper-body"],
    access: "public",
  },
  {
    slug: "warm-up-lower-body",
    title: "Calentamiento Lower Body",
    description: "Cinco minutos para preparar caderas y piernas antes de tu clase. Solo necesitas tu mat.",
    videoId: "wu-lower",
    instructorId: "mariana",
    type: "warmup",
    style: "warmup",
    duration: 5,
    focus: ["lower-body"],
    access: "public",
  },
  {
    slug: "warm-up-full-body",
    title: "Calentamiento Full Body",
    description: "Diez minutos de calentamiento de cuerpo completo, antes de una clase larga o de Barre. Solo necesitas tu mat.",
    videoId: "wu-full",
    instructorId: "sofi",
    type: "warmup",
    style: "warmup",
    duration: 10,
    focus: ["full-body"],
    access: "public",
  },

  /* ---------- Pilates 5 min por zona ---------- */
  ...(
    [
      ["arms", "Arms", "p5-arms", "wu-upper"],
      ["abs", "Abs", "p5-abs", "wu-full"],
      ["glutes", "Glutes", "p5-glutes", "wu-lower"],
      ["inner-thighs", "Inner Thighs", "p5-inner", "wu-lower"],
      ["back", "Back", "p5-back", "wu-upper"],
      ["biceps", "Biceps", "p5-biceps", "wu-upper"],
      ["shoulders", "Shoulders", "p5-shoulders", "wu-upper"],
      ["triceps", "Triceps", "p5-triceps", "wu-upper"],
      ["hamstrings", "Hamstrings", "p5-hams", "wu-lower"],
      ["quads", "Quads", "p5-quads", "wu-lower"],
    ] as const
  ).map(
    ([focus, label, videoId, warmupVideoId]): Seed => ({
      slug: `5-min-pilates-${focus}`,
      title: `5 Min Pilates ${label}`,
      description: `Cinco minutos enfocados en ${ZONA_ES[label]}. Hazla sola o súmala a otra clase. Solo necesitas tu mat.`,
      videoId,
      warmupVideoId,
      instructorId: "mariana",
      type: "pilates",
      style: "pilates-strength",
      duration: 5,
      // "5 Min Pilates Abs" no es Lower Body: el abdomen no suma tren secundario.
      focus: [focus, ...(UPPER.includes(focus) ? (["upper-body"] as const) : focus === "abs" ? [] : (["lower-body"] as const))].filter(
        (f, idx, arr) => arr.indexOf(f) === idx,
      ) as Seed["focus"],
    }),
  ),

  /* ---------- Pilates 10 min ---------- */
  {
    slug: "10-min-pilates-legs",
    title: "10 Min Pilates Legs",
    description: "Diez minutos de piernas, con énfasis en fuerza. Solo necesitas tu mat.",
    videoId: "p10-legs",
    warmupVideoId: "wu-lower",
    instructorId: "mariana",
    type: "pilates",
    style: "pilates-strength",
    duration: 10,
    focus: ["legs", "lower-body", "quads", "hamstrings"],
    isNew: true,
  },
  {
    slug: "10-min-pilates-abs",
    title: "10 Min Pilates Abs",
    description: "Diez minutos de abdomen guiados por la respiración. Solo necesitas tu mat.",
    videoId: "p10-abs",
    warmupVideoId: "wu-full",
    instructorId: "mariana",
    type: "pilates",
    style: "pilates-strength",
    duration: 10,
    focus: ["abs"],
    featured: true,
    isNew: true,
  },
  {
    slug: "10-min-pilates-arms",
    title: "10 Min Pilates Arms",
    description: "Diez minutos de brazos con el peso de tu cuerpo, sin pesas. Solo necesitas tu mat.",
    videoId: "p10-arms",
    warmupVideoId: "wu-upper",
    instructorId: "mariana",
    type: "pilates",
    style: "pilates-flow",
    duration: 10,
    focus: ["arms", "upper-body"],
  },

  /* ---------- Pilates 20 min ---------- */
  {
    slug: "20-min-pilates-upper-body",
    title: "20 Min Pilates Upper Body",
    description: "Veinte minutos de tren superior en un flow continuo. Solo necesitas tu mat.",
    videoId: "p20-upper",
    warmupVideoId: "wu-upper",
    instructorId: "mariana",
    type: "pilates",
    style: "pilates-flow",
    duration: 20,
    focus: ["upper-body", "arms", "back", "shoulders"],
  },
  {
    slug: "20-min-pilates-lower-body",
    title: "20 Min Pilates Lower Body",
    description: "Veinte minutos de glúteos y piernas, con énfasis en fuerza. Solo necesitas tu mat.",
    videoId: "p20-lower",
    warmupVideoId: "wu-lower",
    instructorId: "mariana",
    type: "pilates",
    style: "pilates-strength",
    duration: 20,
    focus: ["lower-body", "glutes", "legs", "inner-thighs"],
    featured: true,
  },
  {
    slug: "20-min-pilates-full-body",
    title: "20 Min Pilates Full Body",
    description: "Veinte minutos de cuerpo completo. Solo necesitas tu mat.",
    videoId: "p20-full",
    warmupVideoId: "wu-full",
    instructorId: "mariana",
    type: "pilates",
    style: "pilates-flow",
    duration: 20,
    focus: ["full-body"],
    featured: true,
  },

  /* ---------- Clases completas ---------- */
  {
    slug: "30-min-pilates-flow",
    title: "30 Min Pilates Flow",
    description: "Media hora de cuerpo completo en un flow continuo. Nivel intermedio. Solo necesitas tu mat.",
    videoId: "p30-full",
    warmupVideoId: "wu-full",
    instructorId: "mariana",
    type: "pilates",
    style: "pilates-flow",
    duration: 30,
    focus: ["full-body"],
    level: "intermedio",
  },
  {
    slug: "40-min-pilates-strength",
    title: "40 Min Pilates Strength",
    description: "Cuarenta minutos de fuerza para todo el cuerpo, con estiramiento al final. Nivel intermedio. Solo necesitas tu mat.",
    videoId: "p40-full",
    warmupVideoId: "wu-full",
    instructorId: "mariana",
    type: "pilates",
    style: "pilates-strength",
    duration: 40,
    focus: ["full-body", "abs", "glutes"],
    level: "intermedio",
    featured: true,
    isNew: true,
  },

  /* ---------- Barre ---------- */
  {
    slug: "barre-20-min",
    title: "Barre 20 Min",
    description: "Veinte minutos de Barre con movimientos pequeños e isométricos. Necesitas tu mat y una silla o una barra.",
    videoId: "b20",
    warmupVideoId: "wu-full",
    instructorId: "mariana",
    type: "barre",
    style: "barre",
    duration: 20,
    focus: ["full-body", "glutes", "legs"],
    equipment: ["Mat", "Silla o barra"],
    featured: true,
  },
  {
    slug: "barre-40-min",
    title: "Barre 40 Min",
    description: "Cuarenta minutos de Barre para todo el cuerpo. Nivel intermedio. Necesitas tu mat y una silla o una barra; las pesas ligeras son opcionales.",
    videoId: "b40",
    warmupVideoId: "wu-full",
    instructorId: "mariana",
    type: "barre",
    style: "barre",
    duration: 40,
    focus: ["full-body", "glutes", "legs", "arms", "abs"],
    equipment: ["Mat", "Silla o barra", "Pesas ligeras (opcional)"],
    level: "intermedio",
    isNew: true,
  },

  /* ---------- Estiramientos ---------- */
  ...(
    [
      ["upper-body", "Upper Body", "del tren superior", 5, "st-upper-5"],
      ["upper-body", "Upper Body", "del tren superior", 10, "st-upper-10"],
      ["lower-body", "Lower Body", "del tren inferior", 5, "st-lower-5"],
      ["lower-body", "Lower Body", "del tren inferior", 10, "st-lower-10"],
      ["full-body", "Full Body", "de cuerpo completo", 5, "st-full-5"],
      ["full-body", "Full Body", "de cuerpo completo", 10, "st-full-10"],
    ] as const
  ).map(
    ([focus, label, zona, duration, videoId]): Seed => ({
      slug: `stretching-${focus}-${duration}-min`,
      title: `Estiramiento ${label} ${duration} Min`,
      description: `${MINUTOS[duration]} minutos de estiramiento ${zona}, para cerrar tu clase o soltar tensión. Solo necesitas tu mat.`,
      videoId,
      instructorId: "sofi",
      type: "stretching",
      style: "stretching",
      duration,
      focus: [focus],
      access: duration === 5 ? "free" : "member",
    }),
  ),
];

export const classes: MovementClass[] = seeds.map(mk);

export const classBySlug = (slug: string) => classes.find((c) => c.slug === slug);
