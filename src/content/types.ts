/**
 * Modelo de contenido de The Flare Club.
 * Ver docs/02-modelo-de-contenido.md. Estas formas son las mismas que tendrán
 * las tablas de Supabase (supabase/migrations/0001_schema.sql).
 */

export type Access = "public" | "free" | "member" | "paid";

export type VideoProvider = "vimeo" | "mux" | "youtube";

/** Asset de video compartido. Nunca se aloja el archivo, solo el id del proveedor. */
export interface Video {
  id: string;
  provider: VideoProvider;
  providerId: string;
  durationSec: number;
  thumbnail: string;
  /** Warm-ups y shorts se marcan aquí para poder reutilizarlos */
  kind: "class" | "warmup" | "meditation" | "lesson" | "talk";
}

export interface Instructor {
  id: string;
  slug: string;
  name: string;
  role: string;
  /** Frase corta de posicionamiento (ej. "Movement, mindset & conscious living.") */
  tagline?: string;
  photo: string;
  bio: string;
  founder?: boolean;
}

/* ---------------- Movement ---------------- */

export type ClassType = "pilates" | "barre" | "warmup" | "stretching";
export type ClassStyle = "pilates-flow" | "pilates-strength" | "barre" | "warmup" | "stretching";
export type DurationBucket = 5 | 10 | 15 | 20 | 30 | 40;
export type Focus =
  | "full-body"
  | "upper-body"
  | "lower-body"
  | "arms"
  | "abs"
  | "glutes"
  | "back"
  | "legs"
  | "inner-thighs"
  | "biceps"
  | "shoulders"
  | "triceps"
  | "hamstrings"
  | "quads";
export type Level = "todos" | "principiante" | "intermedio" | "avanzado";

export interface MovementClass {
  id: string;
  slug: string;
  title: string;
  description: string;
  videoId: string;
  /** Warm-up compartido (video kind=warmup). Se muestra antes de la clase. */
  warmupVideoId?: string;
  instructorId: string;
  type: ClassType;
  style: ClassStyle;
  duration: DurationBucket;
  focus: Focus[];
  level: Level;
  equipment: string[];
  access: Access;
  featured?: boolean;
  isNew?: boolean;
  publishedAt: string;
}

/* ---------------- Meditaciones ---------------- */

export type Moment = "morning" | "night" | "stress" | "abundance" | "other";
export type Feeling =
  | "estres"
  | "ansiedad"
  | "volver-a-ti"
  | "soltar"
  | "claridad"
  | "gratitud"
  | "abundancia"
  | "confianza"
  | "amor-propio";

export interface Meditation {
  id: string;
  slug: string;
  title: string;
  description: string;
  videoId: string;
  instructorId: string;
  moment: Moment;
  feelings: Feeling[];
  duration: 5 | 10 | 15 | 20;
  access: Access;
  featured?: boolean;
  publishedAt: string;
}

/* ---------------- Cursos ---------------- */

export interface LessonResource {
  title: string;
  url: string;
  kind: "pdf" | "link" | "workbook";
}

export interface CourseLesson {
  id: string;
  title: string;
  videoId: string;
  durationMin: number;
  resources?: LessonResource[];
}

export interface CourseModule {
  id: string;
  title: string;
  description?: string;
  lessons: CourseLesson[];
}

export interface Course {
  id: string;
  slug: string;
  title: string;
  tagline: string;
  description: string;
  cover: string;
  instructorId: string;
  modules: CourseModule[];
  workbookIds: string[];
  access: Access;
  price?: number;
  featured?: boolean;
  publishedAt: string;
}

/* ---------------- Charlas ---------------- */

export type TalkCategory =
  | "nutricion"
  | "autoestima"
  | "imagen-personal"
  | "relaciones"
  | "habitos"
  | "estres"
  | "bienestar"
  | "productividad"
  | "sueno"
  | "finanzas";

export interface Talk {
  id: string;
  slug: string;
  title: string;
  description: string;
  expertId: string;
  specialty: string;
  category: TalkCategory;
  videoId: string;
  durationMin: number;
  access: Access;
  featured?: boolean;
  isNew?: boolean;
  publishedAt: string;
}

/* ---------------- Workbooks ---------------- */

export interface Workbook {
  id: string;
  slug: string;
  title: string;
  description: string;
  cover: string;
  fileUrl: string;
  pages: number;
  access: "free" | "member" | "paid";
  price?: number;
  featured?: boolean;
}

/* ---------------- Podcast ---------------- */

export type PodcastCategory =
  | "relaciones"
  | "amor-propio"
  | "ego"
  | "percepcion"
  | "crecimiento"
  | "volver-a-ti";

export interface PodcastEpisode {
  id: string;
  number: number;
  title: string;
  description: string;
  image: string;
  durationMin: number;
  spotifyUrl: string;
  category: PodcastCategory;
  publishedAt: string;
}

/* ---------------- Eventos ---------------- */

export type EventCategory = "flare-events" | "night-editions";

export interface FlareEvent {
  id: string;
  slug: string;
  title: string;
  image: string;
  startsAt: string;
  endsAt?: string;
  location: string;
  description: string;
  price: number;
  currency: "USD" | "GTQ" | "MXN";
  includes: string[];
  category: EventCategory;
  status: "upcoming" | "past" | "soldout";
  gallery?: string[];
  ticketUrl?: string;
}

/* ---------------- Planes ---------------- */

export interface Plan {
  id: string;
  /** id del producto/plan en Recurrente (se llena en Fase 2) */
  recurrenteProductId?: string;
  name: string;
  kind: "personal" | "corporate";
  price?: number;
  currency?: "USD";
  period?: "mes" | "año";
  tagline: string;
  features: string[];
  highlight?: boolean;
  cta: string;
}

/* ---------------- Tags / filtros ---------------- */

export interface TagOption<T extends string | number = string> {
  value: T;
  label: string;
}
