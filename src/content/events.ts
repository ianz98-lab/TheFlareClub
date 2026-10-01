import type { FlareEvent } from "./types";
import { EVENT_COVERS, EVENT_GALLERIES } from "./media";

/**
 * Eventos reales. Fuente: flyers oficiales y "CAMBIOS PAGINA WEB.docx" (30-sep-2026).
 * Regla: todo evento a la venta lleva `ticketUrl` (link de pago de Recurrente).
 * Los pasados no inventan detalles: solo lo que dice su flyer.
 */
export const events: FlareEvent[] = [
  /* ---------------- Próximos ---------------- */
  {
    id: "ev-night-edition-vol-1",
    slug: "night-edition-vol-1-oct-2026",
    title: "Pilates, Paint & Wine",
    subtitle: "Night Editions · Vol. 1 · Pinta tu propia copa de vino",
    cover: EVENT_COVERS["night-edition-vol-1-oct-2026"],
    startsAt: "2026-10-08T18:00:00-06:00",
    endsAt: "2026-10-08T21:00:00-06:00",
    location: "Zona 15, Ciudad de Guatemala",
    area: "Zona 15",
    description:
      "Nuestra primera Night Edition: una noche de Pilates y pintura en la que cada una pinta su propia copa de vino.",
    price: 450,
    currency: "GTQ",
    includes: ["Clase de Pilates", "Pinta tu propia copa de vino"],
    category: "night-editions",
    status: "upcoming",
    ticketUrl: "https://app.recurrente.com/s/theflareclub/night-edition-vol-1-8-de-oct-zona-15",
  },
  {
    id: "ev-legado-del-bosque",
    slug: "legado-del-bosque-nov-2026",
    title: "Save the date: Legado del Bosque",
    subtitle: "Muy pronto te contamos todos los detalles",
    startsAt: "2026-11-22T09:00:00-06:00",
    endsAt: "2026-11-22T12:00:00-06:00",
    // El documento dice "sábado 22 de noviembre", pero el 22-nov-2026 cae domingo: se muestra sin día de la semana hasta confirmar.
    dateLabel: "22 de noviembre",
    location: "Legado del Bosque",
    area: "Legado del Bosque",
    description: "Todavía estamos preparando la experiencia. Únete a la lista de espera y te avisamos en cuanto abramos la venta.",
    price: 375,
    currency: "GTQ",
    includes: [],
    category: "flare-events",
    status: "upcoming",
    waitlist: true,
  },

  /* ---------------- Anteriores (del más reciente al más antiguo) ---------------- */
  {
    id: "ev-charms",
    slug: "pilates-charms-sep-2026",
    title: "Pilates & Charms",
    subtitle: "Carry your light · con Santos",
    cover: EVENT_COVERS["pilates-charms-sep-2026"],
    startsAt: "2026-09-05T09:00:00-06:00",
    endsAt: "2026-09-05T12:00:00-06:00",
    location: "Zona 15, Ciudad de Guatemala",
    area: "Zona 15",
    description: "Pilates Mat en un rooftop y un taller para armar tu propio charm.",
    currency: "GTQ",
    includes: [],
    category: "flare-events",
    status: "past",
    gallery: EVENT_GALLERIES["pilates-charms-sep-2026"],
  },
  {
    id: "ev-paint",
    slug: "pilates-paint-jul-2026",
    title: "Pilates & Paint",
    subtitle: "Sound Healing Edition · guiada por Chu'lel",
    cover: EVENT_COVERS["pilates-paint-jul-2026"],
    startsAt: "2026-07-25T09:00:00-06:00",
    endsAt: "2026-07-25T12:00:00-06:00",
    location: "Parque Las Américas, Zona 14",
    area: "Zona 14",
    description: "Pilates Mat, sound healing y un taller para pintar tu propia tote bag.",
    currency: "GTQ",
    includes: [],
    category: "flare-events",
    status: "past",
    gallery: EVENT_GALLERIES["pilates-paint-jul-2026"],
  },
  {
    id: "ev-mindfulness",
    slug: "pilates-mindfulness-may-2026",
    title: "Pilates & Mindfulness",
    subtitle: "Invitada especial: Victoria Sterkel",
    cover: EVENT_COVERS["pilates-mindfulness-may-2026"],
    startsAt: "2026-05-30T09:00:00-06:00",
    endsAt: "2026-05-30T12:00:00-06:00",
    location: "Spazio, Zona 15",
    area: "Zona 15",
    description: "Pilates Mat y mindfulness con Victoria Sterkel como invitada especial.",
    currency: "GTQ",
    includes: [],
    category: "flare-events",
    status: "past",
    guest: "Victoria Sterkel",
    gallery: EVENT_GALLERIES["pilates-mindfulness-may-2026"],
  },
  {
    id: "ev-breathwork",
    slug: "pilates-breathwork-abr-2026",
    title: "Pilates & Breathwork",
    subtitle: "Invitada especial: Nicolle Posso",
    cover: EVENT_COVERS["pilates-breathwork-abr-2026"],
    startsAt: "2026-04-25T09:00:00-06:00",
    endsAt: "2026-04-25T12:00:00-06:00",
    location: "Barceló Guatemala City",
    area: "Barceló Guatemala City",
    description: "Pilates Mat y breathwork con Nicolle Posso como invitada especial.",
    price: 350,
    currency: "GTQ",
    includes: [],
    category: "flare-events",
    status: "past",
    guest: "Nicolle Posso",
    gallery: EVENT_GALLERIES["pilates-breathwork-abr-2026"],
  },
  {
    id: "ev-vision-board",
    slug: "pilates-vision-board-mar-2026",
    title: "Pilates & Vision Board",
    subtitle: "Vista Quince Hotel",
    cover: EVENT_COVERS["pilates-vision-board-mar-2026"],
    startsAt: "2026-03-21T09:00:00-06:00",
    endsAt: "2026-03-21T12:00:00-06:00",
    location: "Vista Quince Hotel, Zona 15",
    area: "Zona 15",
    description: "Pilates Mat y un taller para crear tu vision board.",
    currency: "GTQ",
    includes: [],
    category: "flare-events",
    status: "past",
    gallery: EVENT_GALLERIES["pilates-vision-board-mar-2026"],
  },
  {
    id: "ev-journaling",
    slug: "pilates-journaling-feb-2026",
    title: "Pilates & Journaling",
    subtitle: "Zona 15",
    cover: EVENT_COVERS["pilates-journaling-feb-2026"],
    startsAt: "2026-02-21T09:00:00-06:00",
    endsAt: "2026-02-21T11:30:00-06:00",
    location: "Zona 15, Ciudad de Guatemala",
    area: "Zona 15",
    description: "Pilates Mat y una mañana de journaling para escribir, reflexionar y conocerte más.",
    currency: "GTQ",
    includes: [],
    category: "flare-events",
    status: "past",
    gallery: EVENT_GALLERIES["pilates-journaling-feb-2026"],
  },
];

/** Cuándo termina el evento (ms). Sin hora de fin cuenta el inicio; una fecha sola, el final de ese día en Guatemala. */
export const eventEndMs = (e: FlareEvent): number => {
  const iso = e.endsAt ?? e.startsAt;
  return Date.parse(/^\d{4}-\d{2}-\d{2}$/.test(iso) ? `${iso}T23:59:59-06:00` : iso);
};

/**
 * El estado sale de la fecha: un evento es anterior si así se marcó o si ya terminó, aunque
 * el seed siga diciendo "upcoming". `now` es la hora de la build; en el navegador, la página
 * lo vuelve a revisar (ver src/components/events/EventTicket.tsx) porque el export estático envejece.
 */
export const isEventOver = (e: FlareEvent, now = Date.now()): boolean => e.status === "past" || eventEndMs(e) <= now;

export const upcomingEvents = (now = Date.now()) =>
  events.filter((e) => !isEventOver(e, now)).sort((a, b) => a.startsAt.localeCompare(b.startsAt));
export const pastEvents = (now = Date.now()) =>
  events.filter((e) => isEventOver(e, now)).sort((a, b) => b.startsAt.localeCompare(a.startsAt));
export const eventBySlug = (slug: string) => events.find((e) => e.slug === slug);

/**
 * Marcas que nos han acompañado (transcritas de los flyers de los 6 eventos).
 * Se muestran como lista tipográfica: los logos que llegaron eran capturas de pantalla.
 */
export const SPONSORS: string[] = [
  "Glad", "Melita", "Naú", "Centro", "Stretchy", "Dhara", "Chu'lel", "Serenna", "Nescafé Ice", "BeViness",
  "Faxel 2.0", "Arrullitos", "Paccari", "Bite", "Flamzy", "Lulë", "The Vitamin Shoppe", "Hidroxón+", "Saba",
  "Volcanic Craft Water", "Naturalísimo", "Sofit", "Tasu", "Corium", "SelfCare", "Nigiro Market", "Kale Kitchen",
  "Cureativa", "Morena Luna", "Dolo-Trau Fem", "Bang Bang Pop", "Fantasías Lourdes", "Miramira", "Eclipse Sunglasses",
  "Los Cebollines", "Drenx", "Prüne", "Footlogix", "Savoro", "Pollo Brujo", "Neutrogena", "Hidratomic", "Chilié",
  "Popsis", "Alma Active", "Juice & Brew", "Cintia's Bakery", "Meraki", "Alura", "The Fitness Shop", "Griin Skin",
  "Bass", "Ene Bakery", "Qore The Nail Haus", "De la Granja", "Sporti", "Amarela", "Splash", "Panito Bakery", "Rowe",
  "Elevé", "The Cruncheese",
];

/** Lugares y aliados que nos abrieron sus puertas */
export const VENUES: string[] = ["Santos", "Parque Las Américas", "Íntegro", "Spazio", "Barceló Guatemala City", "Vista Quince Hotel"];
