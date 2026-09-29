import type { Course } from "./types";

export const courses: Course[] = [
  {
    id: "course-21-dias",
    slug: "21-dias-para-volver-a-ti",
    title: "21 días para volver a ti",
    tagline: "Un reset de tres semanas: movimiento, meditación y journaling.",
    description:
      "Tres semanas guiadas por Mariana y Sofi para reconstruir tu rutina desde el cuidado y no desde la exigencia. Cada día tiene una clase corta, una meditación y una pregunta para tu journal.",
    cover: "/images/fundadoras-mariana-sofi-estudio.jpg",
    instructorId: "sofi",
    access: "member",
    featured: true,
    publishedAt: "2026-09-01",
    workbookIds: ["wb-journaling-prompts", "wb-habit-tracker"],
    modules: [
      {
        id: "m1",
        title: "Semana 1 · Volver al cuerpo",
        description: "Reconectar con el movimiento sin presión.",
        lessons: [
          { id: "l1", title: "Bienvenida y cómo usar el programa", videoId: "l-21-01", durationMin: 12 },
          { id: "l2", title: "Día 1 · Movimiento suave + intención", videoId: "p20-full", durationMin: 20 },
          { id: "l3", title: "Día 2 · Core y respiración", videoId: "p10-abs", durationMin: 10 },
          { id: "l4", title: "Día 3 · Meditación: volver al presente", videoId: "m-stress-1", durationMin: 10 },
        ],
      },
      {
        id: "m2",
        title: "Semana 2 · Volver a la mente",
        description: "Hábitos, claridad y soltar lo que pesa.",
        lessons: [
          { id: "l5", title: "Por qué fallan los hábitos (y qué hacer)", videoId: "l-21-02", durationMin: 9 },
          { id: "l6", title: "Día 8 · Lower Body Strength", videoId: "p20-lower", durationMin: 20 },
          { id: "l7", title: "Día 10 · Soltar el día", videoId: "m-night-1", durationMin: 15 },
        ],
      },
      {
        id: "m3",
        title: "Semana 3 · Volver a ti",
        description: "Integrar y decidir cómo sigues.",
        lessons: [
          { id: "l8", title: "Diseña tu rutina de las próximas 4 semanas", videoId: "l-21-03", durationMin: 14,
            resources: [{ title: "Plantilla de rutina semanal (PDF)", url: "#", kind: "pdf" }] },
          { id: "l9", title: "Día 18 · Barre 20", videoId: "b20", durationMin: 20 },
          { id: "l10", title: "Día 21 · Amor propio", videoId: "m-amor-1", durationMin: 20 },
        ],
      },
    ],
  },
  {
    id: "course-intro-pilates",
    slug: "introduccion-a-pilates",
    title: "Introducción a Pilates",
    tagline: "Los principios, la respiración y las bases para moverte con control.",
    description:
      "Si nunca has hecho Pilates o quieres pulir tu técnica, este curso corto te enseña los seis principios, cómo respirar y las posiciones base que aparecen en todas las clases de The Flare Club.",
    cover: "/images/coach-vertical-02.jpg",
    instructorId: "mariana",
    access: "free",
    publishedAt: "2026-07-15",
    workbookIds: [],
    modules: [
      {
        id: "m1",
        title: "Fundamentos",
        lessons: [
          { id: "l1", title: "Los 6 principios de Pilates", videoId: "l-pil-01", durationMin: 8 },
          { id: "l2", title: "Respiración lateral y core", videoId: "l-pil-02", durationMin: 11 },
          { id: "l3", title: "Práctica: 5 Min Abs", videoId: "p5-abs", durationMin: 5 },
        ],
      },
    ],
  },
  {
    id: "course-habitos",
    slug: "habitos-que-sostienen",
    title: "Hábitos que sostienen",
    tagline: "Un sistema simple para que lo que empiezas se quede.",
    description:
      "Diseña hábitos que caben en tu vida real. Incluye el Habit Tracker y sesiones cortas de journaling para revisar tu semana.",
    cover: "/images/coach-evento-gorra-vertical.jpg",
    instructorId: "sofi",
    access: "paid",
    price: 39,
    publishedAt: "2026-08-20",
    workbookIds: ["wb-habit-tracker", "wb-weekly-reset"],
    modules: [
      {
        id: "m1",
        title: "Entender el hábito",
        lessons: [
          { id: "l1", title: "Identidad antes que resultado", videoId: "l-hab-01", durationMin: 10 },
          { id: "l2", title: "Diseñar el ambiente", videoId: "l-hab-02", durationMin: 13 },
        ],
      },
      {
        id: "m2",
        title: "Sostener",
        lessons: [
          { id: "l3", title: "Journaling semanal guiado", videoId: "l-jour-01", durationMin: 7,
            resources: [{ title: "Weekly Reset", url: "#", kind: "workbook" }] },
        ],
      },
    ],
  },
];

export const courseBySlug = (slug: string) => courses.find((c) => c.slug === slug);

export const courseStats = (c: Course) => {
  const lessons = c.modules.flatMap((m) => m.lessons);
  return {
    modules: c.modules.length,
    lessons: lessons.length,
    minutes: lessons.reduce((a, l) => a + l.durationMin, 0),
  };
};
