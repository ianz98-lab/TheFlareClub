import { classes } from "@/content/classes";
import { courses } from "@/content/courses";
import { STUDIO_PHOTOS } from "@/content/media";
import { meditations } from "@/content/meditations";
import { COURSES } from "@/content/site";
import { talks } from "@/content/talks";
import { videos } from "@/content/videos";
import { CLASS_TYPE_SINGULAR } from "@/lib/movement";
import type { Course, CourseLesson, Meditation, MovementClass, Talk } from "@/content/types";

/**
 * Traduce las claves de actividad (`class:<id>`, `meditation:<id>`, `talk:<id>`,
 * `lesson:<cursoId>:<lecciónId>`) al contenido que muestran las secciones de Mi cuenta.
 * Claves de contenido que ya no existe o que no se publica en la web se ignoran.
 */

interface Base {
  key: string;
  title: string;
  href: string;
  minutes: number;
  thumb: string;
  /** Encuadre de la miniatura (object-position), si la foto lo trae */
  focal?: string;
  /** "Pilates", "Meditación", "Charla", "Lección"… */
  typeLabel: string;
}

export type ResolvedItem =
  | (Base & { kind: "class"; item: MovementClass })
  | (Base & { kind: "meditation"; item: Meditation })
  | (Base & { kind: "talk"; item: Talk })
  | (Base & { kind: "lesson"; item: CourseLesson; course: Course });

/** Respaldo si un video dejara de existir (no la foto de las fundadoras: es el hero de Inicio). */
const FALLBACK_THUMB = STUDIO_PHOTOS.estiramiento;

/** Miniatura del video con su encuadre, sin romper la página si el video dejara de existir. */
function thumbOf(videoId: string): { thumb: string; focal?: string } {
  const v = videos.find((x) => x.id === videoId);
  return v ? { thumb: v.thumbnail, focal: v.thumbnailFocal } : { thumb: FALLBACK_THUMB.src, focal: FALLBACK_THUMB.focal };
}

export function resolveKey(key: string): ResolvedItem | null {
  const [kind, id, sub] = key.split(":");
  if (kind === "class") {
    const c = classes.find((x) => x.id === id);
    if (!c) return null;
    return { kind, key, item: c, title: c.title, href: `/movement/${c.slug}`, minutes: c.duration, ...thumbOf(c.videoId), typeLabel: CLASS_TYPE_SINGULAR[c.type] };
  }
  if (kind === "meditation") {
    const m = meditations.find((x) => x.id === id);
    if (!m) return null;
    return { kind, key, item: m, title: m.title, href: `/meditaciones/${m.slug}`, minutes: m.duration, ...thumbOf(m.videoId), typeLabel: "Meditación" };
  }
  if (kind === "talk") {
    const t = talks.find((x) => x.id === id);
    // Las charlas de muestra no se listan en la web: tampoco aquí.
    if (!t || !t.published) return null;
    return { kind, key, item: t, title: t.title, href: `/charlas/${t.slug}`, minutes: t.durationMin, ...thumbOf(t.videoId), typeLabel: "Charla" };
  }
  if (kind === "lesson") {
    // Mientras los cursos estén "Próximamente", los de la semilla son de muestra.
    if (COURSES.status !== "live") return null;
    const course = courses.find((x) => x.id === id);
    const lesson = course?.modules.flatMap((m) => m.lessons).find((l) => l.id === sub);
    if (!course || !lesson) return null;
    return {
      kind,
      key,
      item: lesson,
      course,
      title: lesson.title,
      href: `/cursos/${course.slug}`,
      minutes: lesson.durationMin,
      thumb: course.cover,
      typeLabel: `Lección · ${course.title}`,
    };
  }
  return null;
}

export const isResolved = (x: ResolvedItem | null): x is ResolvedItem => x !== null;
