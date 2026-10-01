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
  /** object-position de la miniatura al recortarla (tarjetas 4:5, póster 16:9). Ej. "center 30%" */
  thumbnailFocal?: string;
  /** Warm-ups y shorts se marcan aquí para poder reutilizarlos */
  kind: "class" | "warmup" | "meditation" | "lesson" | "talk";
  /** Id de muestra (aún no hay video real en Vimeo): el player no monta el iframe */
  placeholder?: boolean;
}

export interface Instructor {
  id: string;
  slug: string;
  name: string;
  role: string;
  /** Frase corta de posicionamiento (ej. "Movement, mindset & conscious living.") */
  tagline?: string;
  photo: string;
  /** Bio corta (tarjetas, charlas) */
  bio: string;
  /** Bio completa en párrafos para "Sobre nosotras" */
  longBio?: string[];
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
  /** Solo las grabaciones publicadas aparecen en la web (las demás son muestra del prototipo) */
  published?: boolean;
}

/* ---------------- Workbooks ---------------- */

export interface Workbook {
  id: string;
  slug: string;
  title: string;
  description: string;
  cover: string;
  /** Ruta pública del PDF (public/workbooks/...) */
  fileUrl: string;
  pages: number;
  access: "free" | "member" | "paid";
  price?: number;
  featured?: boolean;
  /** Link de pago de Recurrente si es de pago individual */
  checkoutUrl?: string;
}

/* ---------------- Podcast ---------------- */

/** Episodio real de Spotify (título, descripción, duración, fecha e imagen tal como aparecen allá). */
export interface PodcastEpisode {
  id: string;
  /** Número de episodio (del más viejo = 1 al más nuevo) */
  number: number;
  title: string;
  description: string;
  /** Imagen del episodio (CDN de Spotify, i.scdn.co) */
  image: string;
  durationMin: number;
  spotifyUrl: string;
  /** YYYY-MM-DD */
  publishedAt: string;
}

/* ---------------- Eventos ---------------- */

export type EventCategory = "flare-events" | "night-editions";

/** Foto con dimensiones reales (para grillas sin saltos y recortes correctos). */
export interface Photo {
  src: string;
  width: number;
  height: number;
  alt?: string;
  /** object-position sugerido al recortar, ej. "center 30%" */
  focal?: string;
}

export interface FlareEvent {
  id: string;
  slug: string;
  title: string;
  /** Línea corta bajo el título: lema, invitada especial, edición */
  subtitle?: string;
  /** Portada oficial (post 4:5 o story 9:16). Si no hay, se usa una tarjeta tipográfica. */
  cover?: Photo;
  startsAt: string;
  endsAt?: string;
  /** Reemplaza SOLO la fecha (sin día de la semana) cuando no está confirmada; la hora sale de startsAt/endsAt */
  dateLabel?: string;
  location: string;
  /** Zona / ciudad corta para tarjetas */
  area?: string;
  description: string;
  price?: number;
  currency: "USD" | "GTQ";
  includes: string[];
  category: EventCategory;
  status: "upcoming" | "past" | "soldout";
  /** Galería del evento (solo pasados) */
  gallery?: Photo[];
  /** Link de pago de Recurrente. Todo evento a la venta debe tenerlo. */
  ticketUrl?: string;
  /** Aún sin venta: se muestra "Únete a la lista de espera" */
  waitlist?: boolean;
  /** Invitada especial, si hubo */
  guest?: string;
}

/* ---------------- Planes ---------------- */

export interface Plan {
  id: string;
  /** id del producto/plan en Recurrente (se llena al crear el producto) */
  recurrenteProductId?: string;
  /** Link de checkout de Recurrente para la suscripción (con prueba de 7 días) */
  checkoutUrl?: string;
  name: string;
  kind: "personal" | "corporate";
  price?: number;
  currency?: "USD";
  period?: "mes" | "año";
  /** Frase bajo el nombre (ej. "Ahorra USD 15 al elegir el plan anual.") */
  tagline?: string;
  features: string[];
  /** Texto legal pequeño bajo el botón */
  finePrint?: string;
  cta: string;
}

/* ---------------- Tags / filtros ---------------- */

export interface TagOption<T extends string | number = string> {
  value: T;
  label: string;
}
