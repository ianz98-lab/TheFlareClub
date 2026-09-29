import type { Workbook } from "./types";

const covers = [
  "/images/meditacion-clase-ventanal.jpg",
  "/images/coach-vertical-02.jpg",
  "/images/fundadoras-mariana-sofi-estudio.jpg",
  "/images/clase-04.jpg",
];

const mk = (
  slug: string,
  title: string,
  description: string,
  access: Workbook["access"],
  pages: number,
  i: number,
  extra: Partial<Workbook> = {},
): Workbook => ({
  id: `wb-${slug}`,
  slug,
  title,
  description,
  cover: covers[i % covers.length],
  fileUrl: "#",
  pages,
  access,
  ...extra,
});

export const workbooks: Workbook[] = [
  mk("vision-board", "Vision Board Workbook", "Guía paso a paso para crear un vision board que sí uses: preguntas, categorías y plantilla.", "member", 18, 0, { featured: true }),
  mk("monthly-reset", "Monthly Reset", "Cierra el mes con claridad: qué funcionó, qué sueltas, qué eliges para el siguiente.", "member", 10, 1, { featured: true }),
  mk("weekly-reset", "Weekly Reset", "Diez minutos cada domingo para planear una semana que se sienta tuya.", "free", 6, 2),
  mk("journaling-prompts", "Journaling Prompts", "60 preguntas para escribir cuando no sabes por dónde empezar.", "member", 14, 3),
  mk("gratitude-journal", "Gratitude Journal", "Treinta días de gratitud con espacio para tres cosas al día.", "free", 32, 0),
  mk("goal-setting", "Goal Setting", "Metas con método: de la intención al plan de 90 días.", "member", 16, 1),
  mk("end-of-year-reflection", "End of Year Reflection", "Reflexión profunda de cierre de año en cinco capítulos.", "paid", 24, 2, { price: 9 }),
  mk("new-year-workbook", "New Year Workbook", "Diseña tu año: palabra del año, áreas de vida y rituales.", "paid", 28, 3, { price: 12, featured: true }),
  mk("future-self", "Future Self", "Cartas y visualizaciones para conocer a la mujer que estás siendo.", "member", 12, 0),
  mk("habit-tracker", "Habit Tracker", "Tracker mensual imprimible con guía para elegir tres hábitos ancla.", "free", 4, 1),
];

export const workbookById = (id: string) => workbooks.find((w) => w.id === id);
