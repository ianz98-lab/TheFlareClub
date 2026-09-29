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

const seeds: Seed[] = [
  /* ---------- Warm-ups (shorts, compartidos) ---------- */
  {
    slug: "warm-up-upper-body",
    title: "Warm Up Upper Body",
    description: "Activa hombros, brazos y espalda alta antes de cualquier clase de tren superior.",
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
    title: "Warm Up Lower Body",
    description: "Caderas, glúteos y piernas listas para trabajar con control.",
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
    title: "Warm Up Full Body",
    description: "Calentamiento completo de 9 minutos para clases de cuerpo entero y Barre.",
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
      description: `Cinco minutos de trabajo enfocado en ${label.toLowerCase()}. Ideal para sumar a otra clase o para un día corto.`,
      videoId,
      warmupVideoId,
      instructorId: "mariana",
      type: "pilates",
      style: "pilates-strength",
      duration: 5,
      focus: [
        focus,
        ...(["arms", "back", "biceps", "shoulders", "triceps"].includes(focus)
          ? (["upper-body"] as const)
          : (["lower-body"] as const)),
      ].filter((f, idx, arr) => arr.indexOf(f) === idx) as Seed["focus"],
    }),
  ),

  /* ---------- Pilates 10 min ---------- */
  {
    slug: "10-min-pilates-legs",
    title: "10 Min Pilates Legs",
    description: "Piernas fuertes y largas con series de control y resistencia.",
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
    description: "Core profundo: respiración, control y abdominales que se sienten al día siguiente.",
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
    description: "Brazos tonificados sin pesas: solo tu cuerpo y precisión.",
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
    description: "Hombros, brazos, espalda y core en un flow continuo de veinte minutos.",
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
    description: "Glúteos, piernas e inner thighs con énfasis en fuerza.",
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
    description: "Todo el cuerpo en veinte minutos. La clase perfecta para un día ocupado.",
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
    description: "Movimiento fluido, control y conexión. Media hora para volver a tu cuerpo.",
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
    description: "La clase completa: fuerza, resistencia y un cierre de estiramiento.",
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
    description: "Movimientos pequeños e isométricos que esculpen y mejoran la postura.",
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
    description: "La sesión completa de Barre: piernas, glúteos, brazos y core con música que te sostiene.",
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

  /* ---------- Stretching ---------- */
  ...(
    [
      ["upper-body", "Upper Body", 5, "st-upper-5"],
      ["upper-body", "Upper Body", 10, "st-upper-10"],
      ["lower-body", "Lower Body", 5, "st-lower-5"],
      ["lower-body", "Lower Body", 10, "st-lower-10"],
      ["full-body", "Full Body", 5, "st-full-5"],
      ["full-body", "Full Body", 10, "st-full-10"],
    ] as const
  ).map(
    ([focus, label, duration, videoId]): Seed => ({
      slug: `stretching-${focus}-${duration}-min`,
      title: `Stretching ${label} ${duration} Min`,
      description: `Estiramiento guiado de ${label.toLowerCase()} para cerrar tu clase o soltar tensión.`,
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
