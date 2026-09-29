import type { Video } from "./types";

/**
 * Assets de video. Los providerId son placeholders (Vimeo) hasta subir los reales.
 * Un mismo video puede usarse en varias clases, lecciones o como warm-up compartido.
 */
const T = {
  squat: "/images/clase-pilates-squat-ventanal.jpg",
  barre: "/images/coach-clase-barre-vertical.jpg",
  med: "/images/meditacion-clase-ventanal.jpg",
  c3: "/images/clase-03.jpg",
  c4: "/images/clase-04.jpg",
  gorra: "/images/coach-evento-gorra-vertical.jpg",
  v2: "/images/coach-vertical-02.jpg",
  duo: "/images/coaches-mariana-sofi-retrato.jpg",
  fund: "/images/fundadoras-mariana-sofi-estudio.jpg",
};

const v = (
  id: string,
  kind: Video["kind"],
  durationSec: number,
  thumbnail: string,
): Video => ({ id, provider: "vimeo", providerId: `9${id.replace(/\D/g, "").padStart(8, "0")}`, durationSec, thumbnail, kind });

export const videos: Video[] = [
  // ---- Warm-ups compartidos (shorts de calentamiento) ----
  v("wu-upper", "warmup", 6 * 60, T.c3),
  v("wu-lower", "warmup", 7 * 60, T.squat),
  v("wu-full", "warmup", 9 * 60, T.c4),

  // ---- Pilates 5 min por zona ----
  v("p5-arms", "class", 5 * 60, T.c3),
  v("p5-abs", "class", 5 * 60, T.squat),
  v("p5-glutes", "class", 5 * 60, T.c4),
  v("p5-inner", "class", 5 * 60, T.squat),
  v("p5-back", "class", 5 * 60, T.c3),
  v("p5-biceps", "class", 5 * 60, T.c4),
  v("p5-shoulders", "class", 5 * 60, T.c3),
  v("p5-triceps", "class", 5 * 60, T.c4),
  v("p5-hams", "class", 5 * 60, T.squat),
  v("p5-quads", "class", 5 * 60, T.squat),

  // ---- Pilates 10 / 20 / completas ----
  v("p10-legs", "class", 10 * 60, T.squat),
  v("p10-abs", "class", 10 * 60, T.c3),
  v("p10-arms", "class", 10 * 60, T.c4),
  v("p20-upper", "class", 20 * 60, T.c3),
  v("p20-lower", "class", 20 * 60, T.squat),
  v("p20-full", "class", 20 * 60, T.c4),
  v("p30-full", "class", 30 * 60, T.fund),
  v("p40-full", "class", 40 * 60, T.duo),

  // ---- Barre ----
  v("b20", "class", 20 * 60, T.barre),
  v("b40", "class", 40 * 60, T.barre),

  // ---- Stretching ----
  v("st-upper-5", "class", 5 * 60, T.med),
  v("st-upper-10", "class", 10 * 60, T.med),
  v("st-lower-5", "class", 5 * 60, T.c4),
  v("st-lower-10", "class", 10 * 60, T.c4),
  v("st-full-5", "class", 5 * 60, T.c3),
  v("st-full-10", "class", 10 * 60, T.c3),

  // ---- Meditaciones ----
  v("m-morning-1", "meditation", 10 * 60, T.med),
  v("m-morning-2", "meditation", 5 * 60, T.med),
  v("m-night-1", "meditation", 15 * 60, T.med),
  v("m-night-2", "meditation", 20 * 60, T.med),
  v("m-stress-1", "meditation", 10 * 60, T.med),
  v("m-stress-2", "meditation", 5 * 60, T.med),
  v("m-abund-1", "meditation", 15 * 60, T.med),
  v("m-conf-1", "meditation", 10 * 60, T.med),
  v("m-amor-1", "meditation", 20 * 60, T.med),

  // ---- Lecciones de cursos ----
  v("l-21-01", "lesson", 12 * 60, T.gorra),
  v("l-21-02", "lesson", 9 * 60, T.gorra),
  v("l-21-03", "lesson", 14 * 60, T.gorra),
  v("l-pil-01", "lesson", 8 * 60, T.v2),
  v("l-pil-02", "lesson", 11 * 60, T.v2),
  v("l-hab-01", "lesson", 10 * 60, T.fund),
  v("l-hab-02", "lesson", 13 * 60, T.fund),
  v("l-jour-01", "lesson", 7 * 60, T.med),

  // ---- Charlas ----
  v("t-nutri", "talk", 42 * 60, T.duo),
  v("t-auto", "talk", 38 * 60, T.med),
  v("t-fin", "talk", 45 * 60, T.c4),
  v("t-sueno", "talk", 35 * 60, T.med),
  v("t-hab", "talk", 40 * 60, T.gorra),
];

export const videoById = (id: string): Video => {
  const found = videos.find((x) => x.id === id);
  if (!found) throw new Error(`Video no encontrado: ${id}`);
  return found;
};
