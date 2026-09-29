import type { PodcastEpisode } from "./types";

export const PODCAST = {
  title: "Decide de Nuevo",
  tagline: "Conversaciones para volver a ti.",
  description:
    "Un podcast de The Flare Club sobre relaciones, ego, percepción y crecimiento personal. Charlas honestas para recordarte que siempre puedes decidir de nuevo.",
  cover: "/images/coaches-mariana-sofi-retrato.jpg",
  spotifyShowUrl: "https://open.spotify.com/",
};

const mk = (
  number: number,
  title: string,
  description: string,
  category: PodcastEpisode["category"],
  durationMin: number,
  publishedAt: string,
): PodcastEpisode => ({
  id: `ep-${number}`,
  number,
  title,
  description,
  image: PODCAST.cover,
  durationMin,
  spotifyUrl: PODCAST.spotifyShowUrl,
  category,
  publishedAt,
});

export const episodes: PodcastEpisode[] = [
  mk(12, "Cuando el ego decide por ti", "Cómo reconocer cuándo estás eligiendo desde el miedo y no desde lo que quieres.", "ego", 46, "2026-09-22"),
  mk(11, "Relaciones que suman", "Qué mirar en una relación (de pareja o amistad) para saber si te acerca a ti.", "relaciones", 52, "2026-09-08"),
  mk(10, "La historia que te cuentas", "Percepción: por qué dos personas viven la misma situación de forma tan distinta.", "percepcion", 41, "2026-08-25"),
  mk(9, "Amor propio no es un baño de espuma", "Lo que realmente significa cuidarte cuando nadie te ve.", "amor-propio", 38, "2026-08-11"),
  mk(8, "Volver a ti después de perderte", "Sobre esas etapas donde dejaste de ser tú y cómo regresar.", "volver-a-ti", 55, "2026-07-28"),
  mk(7, "Crecer duele (y está bien)", "Crecimiento personal sin romantizarlo: el proceso real.", "crecimiento", 44, "2026-07-14"),
];

export const latestEpisode = episodes[0];
