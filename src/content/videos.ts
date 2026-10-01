import { EVENT_GALLERIES, MEDITATION_PHOTOS, STUDIO_PHOTOS } from "./media";
import type { Photo, Video } from "./types";

/**
 * Assets de video. Los providerId son placeholders (Vimeo) hasta subir los reales: van con
 * `placeholder: true` y el player muestra un aviso en vez de la pantalla de error de Vimeo.
 * Un mismo video puede usarse en varias clases, lecciones o como warm-up compartido.
 *
 * Miniaturas (mientras no haya portadas de Vimeo): fotos reales de clases y eventos, cada una
 * con su punto focal de media.ts. Reglas: una foto por clase en lo posible (las pocas que se
 * repiten nunca quedan contiguas en Movement, con ningún orden ni pestaña); sin la foto de
 * portada de Inicio; sin cuadros donde se vea un letrero de salida.
 */
const ev = (slug: string, n: number): Photo => {
  const photo = EVENT_GALLERIES[slug]?.[n - 1];
  if (!photo) throw new Error(`Foto no encontrada: ${slug} ${n}`);
  return photo;
};

const T = {
  ...STUDIO_PHOTOS,
  // Eventos: clase en movimiento
  charmsNino: ev("pilates-charms-sep-2026", 1),
  charmsBrazos: ev("pilates-charms-sep-2026", 7),
  charmsRodillas: ev("pilates-charms-sep-2026", 8),
  paintPiernas: ev("pilates-paint-jul-2026", 9),
  paintPerro: ev("pilates-paint-jul-2026", 10),
  mindEstocada: ev("pilates-mindfulness-may-2026", 1),
  mindRodillas: ev("pilates-mindfulness-may-2026", 2),
  mindArriba: ev("pilates-mindfulness-may-2026", 3),
  mindCruz: ev("pilates-mindfulness-may-2026", 4),
  mindNino: ev("pilates-mindfulness-may-2026", 5),
  bwPuente: ev("pilates-breathwork-abr-2026", 1),
  visArriba: ev("pilates-vision-board-mar-2026", 1),
  visLateral: ev("pilates-vision-board-mar-2026", 2),
  visAbdomen: ev("pilates-vision-board-mar-2026", 7),
  jouPatada: ev("pilates-journaling-feb-2026", 2),
  // Eventos: meditación, talleres y pausas
  charmsMedita: ev("pilates-charms-sep-2026", 5),
  paintCuencos: ev("pilates-paint-jul-2026", 1),
  bwAudifonos: ev("pilates-breathwork-abr-2026", 7),
  visTaller: ev("pilates-vision-board-mar-2026", 4),
  visMedita: ev("pilates-vision-board-mar-2026", 5),
  visMatcha: ev("pilates-vision-board-mar-2026", 6),
  visSnack: ev("pilates-vision-board-mar-2026", 8),
  jouEscribe: ev("pilates-journaling-feb-2026", 1),
  jouSonrie: ev("pilates-journaling-feb-2026", 3),
  jouVentanal: ev("pilates-journaling-feb-2026", 5),
  // Sección de meditaciones (MEDITATION_PHOTOS[0] es la portada de /meditaciones: no se repite abajo)
  med2: MEDITATION_PHOTOS[1],
  med3: MEDITATION_PHOTOS[2],
  med4: MEDITATION_PHOTOS[3],
  med5: MEDITATION_PHOTOS[4],
  med6: MEDITATION_PHOTOS[5],
} satisfies Record<string, Photo>;

const v = (id: string, kind: Video["kind"], durationSec: number, thumb: Photo): Video => ({
  id,
  provider: "vimeo",
  providerId: `9${id.replace(/\D/g, "").padStart(8, "0")}`,
  durationSec,
  thumbnail: thumb.src,
  thumbnailFocal: thumb.focal,
  kind,
  placeholder: true,
});

export const videos: Video[] = [
  // ---- Warm-ups compartidos (shorts de calentamiento) ----
  v("wu-upper", "warmup", 5 * 60, T.visArriba),
  v("wu-lower", "warmup", 5 * 60, T.charmsRodillas),
  v("wu-full", "warmup", 10 * 60, T.instructora),

  // ---- Pilates 5 min por zona ----
  v("p5-arms", "class", 5 * 60, T.mindCruz),
  v("p5-abs", "class", 5 * 60, T.visAbdomen),
  v("p5-glutes", "class", 5 * 60, T.bwPuente),
  v("p5-inner", "class", 5 * 60, T.visLateral),
  v("p5-back", "class", 5 * 60, T.mindNino),
  v("p5-biceps", "class", 5 * 60, T.mindRodillas),
  v("p5-shoulders", "class", 5 * 60, T.charmsBrazos),
  v("p5-triceps", "class", 5 * 60, T.mindArriba),
  v("p5-hams", "class", 5 * 60, T.paintPerro),
  v("p5-quads", "class", 5 * 60, T.mindEstocada),

  // ---- Pilates 10 / 20 / completas ----
  v("p10-legs", "class", 10 * 60, T.sentadilla),
  v("p10-abs", "class", 10 * 60, T.paintPiernas),
  v("p10-arms", "class", 10 * 60, T.gorra),
  v("p20-upper", "class", 20 * 60, T.duo),
  v("p20-lower", "class", 20 * 60, T.estocada),
  v("p20-full", "class", 20 * 60, T.jouPatada),
  v("p30-full", "class", 30 * 60, T.visArriba),
  v("p40-full", "class", 40 * 60, T.charmsBrazos),

  // ---- Barre ----
  v("b20", "class", 20 * 60, T.mindArriba),
  v("b40", "class", 40 * 60, T.visLateral),

  // ---- Stretching ----
  v("st-upper-5", "class", 5 * 60, T.estiramiento),
  v("st-upper-10", "class", 10 * 60, T.meditacion),
  v("st-lower-5", "class", 5 * 60, T.charmsNino),
  v("st-lower-10", "class", 10 * 60, T.paintPerro),
  v("st-full-5", "class", 5 * 60, T.mindNino),
  v("st-full-10", "class", 10 * 60, T.charmsNino),

  // ---- Meditaciones ----
  v("m-morning-1", "meditation", 10 * 60, T.med2),
  v("m-morning-2", "meditation", 5 * 60, T.med3),
  v("m-night-1", "meditation", 15 * 60, T.med4),
  v("m-night-2", "meditation", 20 * 60, T.med6),
  v("m-stress-1", "meditation", 10 * 60, T.visMedita),
  v("m-stress-2", "meditation", 5 * 60, T.med5),
  v("m-abund-1", "meditation", 15 * 60, T.charmsMedita),
  v("m-conf-1", "meditation", 10 * 60, T.paintCuencos),
  v("m-amor-1", "meditation", 20 * 60, T.jouSonrie),

  // ---- Lecciones de cursos (la portada de cada curso, ver courses.ts) ----
  v("l-21-01", "lesson", 12 * 60, T.gorra),
  v("l-21-02", "lesson", 9 * 60, T.gorra),
  v("l-21-03", "lesson", 14 * 60, T.gorra),
  v("l-pil-01", "lesson", 8 * 60, T.estocada),
  v("l-pil-02", "lesson", 11 * 60, T.estocada),
  v("l-hab-01", "lesson", 10 * 60, T.jouVentanal),
  v("l-hab-02", "lesson", 13 * 60, T.jouVentanal),
  v("l-jour-01", "lesson", 7 * 60, T.jouEscribe),

  // ---- Charlas ----
  v("t-nutri", "talk", 42 * 60, T.visMatcha),
  v("t-auto", "talk", 38 * 60, T.charla),
  v("t-fin", "talk", 45 * 60, T.visTaller),
  v("t-sueno", "talk", 35 * 60, T.bwAudifonos),
  v("t-hab", "talk", 40 * 60, T.visSnack),
];

export const videoById = (id: string): Video => {
  const found = videos.find((x) => x.id === id);
  if (!found) throw new Error(`Video no encontrado: ${id}`);
  return found;
};
