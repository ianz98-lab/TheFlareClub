import type { PodcastEpisode } from "./types";

/**
 * Podcast "Decide de Nuevo con Mariana Wer". Datos REALES de Spotify (título, descripción,
 * duración, fecha e imagen de cada episodio), verificados el 30-sep-2026 contra el RSS
 * público (anchor.fm/s/74a07458/podcast/rss), Spotify for Creators y cada página de episodio.
 * Los episodios se escuchan en Spotify (no hay reproductor propio).
 * Para actualizar: agregar el episodio nuevo arriba con el número siguiente.
 */
export const PODCAST = {
  title: "Decide de Nuevo",
  /** Nombre completo como aparece en Spotify */
  fullTitle: "Decide de Nuevo con Mariana Wer",
  host: "Mariana Wer",
  tagline: "Cada día es una nueva oportunidad para reinventarte.",
  description:
    "Cada día es una nueva oportunidad para reinventarte y para decidir, en cada momento, quién quieres ser. Un podcast por Mariana Wer que te dará las herramientas para actualizar tu historia, dejar de vivir en automático, y reconocer las infinitas posibilidades que habitan dentro de ti.",
  /**
   * Portada oficial del show en Spotify (640 × 640). Las imágenes de Spotify existen también en
   * 64 y 300 px: el loader de imágenes pide la que alcanza (src/lib/image-variants.ts).
   */
  cover: "https://i.scdn.co/image/ab6765630000ba8ad7d8811a3b0527200e18b015",
  spotifyShowUrl: "https://open.spotify.com/show/1Z2XxeY3c3GnjkjQ9XljRo",
};

/** Del más nuevo al más viejo. */
export const episodes: PodcastEpisode[] = [
  {
    id: "ep-5tNn7elvTE4lf28VU32fig",
    number: 16,
    title: "abrazando todas tus versiones",
    description: "Si alguna vez viste hacia atrás y pensaste: “¿cómo permití eso?”, “¿cómo no me di cuenta?”, “¿por qué no me fui antes?”… este episodio es para ti.\n\nHoy hablamos de hacer paz con tu historia, agradecer el camino y decidir de nuevo desde más amor.",
    image: "https://i.scdn.co/image/ab6765630000ba8ad7d8811a3b0527200e18b015",
    durationMin: 19,
    spotifyUrl: "https://open.spotify.com/episode/5tNn7elvTE4lf28VU32fig",
    publishedAt: "2026-06-15",
  },
  {
    id: "ep-23M7HBurufVW5eqrVwQymZ",
    number: 15,
    title: "¿Dando o pidiendo amor?",
    description: "Si sientes que a veces tienes que ser perfecta, fuerte, graciosa o “fácil de querer” para que no te dejen de amar… este episodio es para ti.\n\nHablamos también de cómo ver nuestras heridas con más compasión y de cómo poner límites sin perder el corazón.",
    image: "https://i.scdn.co/image/ab6765630000ba8ad7d8811a3b0527200e18b015",
    durationMin: 34,
    spotifyUrl: "https://open.spotify.com/episode/23M7HBurufVW5eqrVwQymZ",
    publishedAt: "2026-06-10",
  },
  {
    id: "ep-2H4Am3uWrwFqs0YbFXSoF2",
    number: 14,
    title: "viajando a la India",
    description: "En este episodio, te comparto mi experiencia en la India, un viaje que fue mucho más que unas vacaciones: fue un peregrinaje espiritual. Te cuento los aprendizajes que me dejó y lo que descubrí sobre mí misma en el camino. Si alguna vez has sentido la llamada de un viaje profundo hacia tu interior, este episodio es para ti.",
    image: "https://i.scdn.co/image/ab6765630000ba8ad7d8811a3b0527200e18b015",
    durationMin: 31,
    spotifyUrl: "https://open.spotify.com/episode/2H4Am3uWrwFqs0YbFXSoF2",
    publishedAt: "2025-05-05",
  },
  {
    id: "ep-5ZvBsIiPLGqIZyvHjSzbO4",
    number: 13,
    title: "liberándome del sufrimiento",
    description: "Si estás cansado de sufrir, este episodio es para ti 🫶🏼\n\n¡Te abrazo! 💖",
    image: "https://i.scdn.co/image/ab6765630000ba8ad7d8811a3b0527200e18b015",
    durationMin: 14,
    spotifyUrl: "https://open.spotify.com/episode/5ZvBsIiPLGqIZyvHjSzbO4",
    publishedAt: "2025-01-21",
  },
  {
    id: "ep-6qhiNTZ3Cqn9cDHJ93EcIS",
    number: 12,
    title: "recuperando la autenticidad",
    description: "Si te sientes desconectado de ti, si sientes que has perdido tu esencia, si cuando te dicen “sé auténtico” o “sé tú mismo” no sabes cómo hacerlo, este episodio es para ti✨",
    image: "https://i.scdn.co/image/ab6765630000ba8ad7d8811a3b0527200e18b015",
    durationMin: 11,
    spotifyUrl: "https://open.spotify.com/episode/6qhiNTZ3Cqn9cDHJ93EcIS",
    publishedAt: "2024-07-23",
  },
  {
    id: "ep-66rCP0Flnut31a47AMLYJz",
    number: 11,
    title: "cambiando mi vida desde adentro",
    description: "En este episodio, te cuento una experiencia que me ayudó a entender MUCHAS cosas sobre la vida. Si quieres cambiar algo de tu vida, pero no sabes cómo, este episodio es para ti 💗",
    image: "https://i.scdn.co/image/ab6765630000ba8ad7d8811a3b0527200e18b015",
    durationMin: 17,
    spotifyUrl: "https://open.spotify.com/episode/66rCP0Flnut31a47AMLYJz",
    publishedAt: "2024-06-20",
  },
  {
    id: "ep-5AfmZ1utdvpoZzCnSqV2KO",
    number: 10,
    title: "escribiendo para decidir de nuevo",
    description: "En este episodio, hablamos de la escritura diaria y sus beneficios. Descubriremos cómo dedicar unos minutos al día a escribir puede mejorar nuestra claridad mental, nuestro autoconocimiento, reprogramar nuestra mente, ayudarnos a sanar, desbloquear nuestro potencial creativo, y brindarnos una forma efectiva de crear la vida de nuestros sueños. Si quieres empezar a hacer journaling o a mejorar tu constancia, este episodio es para ti. Prepárate para descubrir el poder transformador que el journaling puede tener en tu vida.",
    image: "https://i.scdn.co/image/ab6765630000ba8ad7d8811a3b0527200e18b015",
    durationMin: 18,
    spotifyUrl: "https://open.spotify.com/episode/5AfmZ1utdvpoZzCnSqV2KO",
    publishedAt: "2023-06-25",
  },
  {
    id: "ep-5UyBqMM2yxZgqPm3KfwZKH",
    number: 9,
    title: "explorando tus relaciones a través del espejo",
    description: "En este episodio, exploramos cómo nos reflejamos en nuestras relaciones actúan como un espejo que refleja nuestros deseos, miedos y patrones emocionales. A medida que desentrañamos los misterios de esta conexión profunda, revelamos cómo podemos utilizar estas reflexiones para un crecimiento personal y una relación más saludable. Prepárate para un viaje de autoexploración y descubrimiento en este episodio.",
    image: "https://i.scdn.co/image/ab6765630000ba8ad7d8811a3b0527200e18b015",
    durationMin: 13,
    spotifyUrl: "https://open.spotify.com/episode/5UyBqMM2yxZgqPm3KfwZKH",
    publishedAt: "2023-06-19",
  },
  {
    id: "ep-1HM6deiVPE7SxUqBaev1UZ",
    number: 8,
    title: "atravesando cambios",
    description: "En este episodio exploramos cómo los cambios en nuestras vidas pueden convertirse en oportunidades para el desarrollo y la transformación interior. Si estás buscando inspiración para superar los obstáculos y florecer en medio de los cambios, este episodio es para ti.",
    image: "https://i.scdn.co/image/ab6765630000ba8ad7d8811a3b0527200e18b015",
    durationMin: 11,
    spotifyUrl: "https://open.spotify.com/episode/1HM6deiVPE7SxUqBaev1UZ",
    publishedAt: "2023-05-29",
  },
  {
    id: "ep-2YwicaFYZdA0XNXfnFIMjk",
    number: 7,
    title: "viviendo un presente más consciente",
    description: "Descubre cómo cultivar la presencia, la consciencia y la gratitud en tu vida diaria puede cambiar la forma en que experimentas el mundo que te rodea. En este episodio exploramos estas habilidades y cómo pueden ayudarnos a vivir una vida más plena y satisfactoria.\n\n¡Espero que te guste!",
    image: "https://i.scdn.co/image/ab6765630000ba8ad7d8811a3b0527200e18b015",
    durationMin: 13,
    spotifyUrl: "https://open.spotify.com/episode/2YwicaFYZdA0XNXfnFIMjk",
    publishedAt: "2023-05-08",
  },
  {
    id: "ep-4DYn8Aow1HaUqZbdK0gK2g",
    number: 6,
    title: "conectando con personas expansivas",
    description: "Un episodio para aprender a identificar quiénes son las personas en tu vida que te suman, que te inspiran y que te expanden el corazón.",
    image: "https://i.scdn.co/image/ab6765630000ba8ad7d8811a3b0527200e18b015",
    durationMin: 9,
    spotifyUrl: "https://open.spotify.com/episode/4DYn8Aow1HaUqZbdK0gK2g",
    publishedAt: "2023-04-24",
  },
  {
    id: "ep-0Bmzj4XQfviRaiiqNizpje",
    number: 5,
    title: "reconociendo a tu niño interior",
    description: "En este episodio hablamos de cómo nuestras experiencias de la infancia pueden influir en nuestra vida adulta. Descubre herramientas para sanar a tu niño interior, para dejar de repetir patrones y para vivir una vida más plena y auténtica.\n\n¡Espero que te guste!",
    image: "https://i.scdn.co/image/ab6765630000ba8ad7d8811a3b0527200e18b015",
    durationMin: 12,
    spotifyUrl: "https://open.spotify.com/episode/0Bmzj4XQfviRaiiqNizpje",
    publishedAt: "2023-04-17",
  },
  {
    id: "ep-44bW0bXfY4ba2aZczR9nyw",
    number: 4,
    title: "manifestando la vida de tus sueños",
    description: "En este episodio hablamos sobre la manifestación y cómo podemos utilizar nuestra mente y energía para atraer las cosas que deseamos en la vida. Descubre técnicas y consejos para manifestar tus metas y deseos, y aprende cómo la práctica de la gratitud y la visualización pueden ayudarte a crear la vida de tus sueños.",
    image: "https://i.scdn.co/image/ab6765630000ba8ad7d8811a3b0527200e18b015",
    durationMin: 19,
    spotifyUrl: "https://open.spotify.com/episode/44bW0bXfY4ba2aZczR9nyw",
    publishedAt: "2023-04-10",
  },
  {
    id: "ep-0ARjR2sxBuMJOOre2Z1i0X",
    number: 3,
    title: "mejorando la relación más importante de tu vida",
    description: "La relación que tenemos con nosotros mismos es la más importante de todas, ya que influye en todos los demás aspectos de nuestra vida. Si quieres mejorar tu vida en general, necesitas empezar por mejorar tu relación contigo mismo. En este episodio te comparto los tips que más me han funcionado a mi para hacerlo. ¡Espero que te guste!",
    image: "https://i.scdn.co/image/ab6765630000ba8ad7d8811a3b0527200e18b015",
    durationMin: 15,
    spotifyUrl: "https://open.spotify.com/episode/0ARjR2sxBuMJOOre2Z1i0X",
    publishedAt: "2023-03-27",
  },
  {
    id: "ep-5NEt4vcvYubv3DygzUgIsT",
    number: 2,
    title: "soltando cargas",
    description: "En este episodio hablamos del verdadero significado del perdón y cómo utilizarlo como un medio para quitarnos cargas de encima. Un proceso y una decisión que son POR TI y PARA TI.",
    image: "https://i.scdn.co/image/ab6765630000ba8a897d9b4fd5acaf845b4d3319",
    durationMin: 13,
    spotifyUrl: "https://open.spotify.com/episode/5NEt4vcvYubv3DygzUgIsT",
    publishedAt: "2023-03-19",
  },
  {
    id: "ep-4F85FC1qd6XkP8KYeEL6np",
    number: 1,
    title: "saliendo de la zona de confort",
    description: "En este episodio hablamos de la importancia de ser fiel a ti mismo, por qué es tan difícil, cómo hacerlo y qué pasa cuando empezamos este proceso. También te cuento el significado detrás del nombre de este podcast, para que te hagas una idea de lo que hablaremos en los próximos episodios. ¡Espero que te guste!",
    image: "https://i.scdn.co/image/ab6765630000ba8a897d9b4fd5acaf845b4d3319",
    durationMin: 19,
    spotifyUrl: "https://open.spotify.com/episode/4F85FC1qd6XkP8KYeEL6np",
    publishedAt: "2023-03-12",
  },
];

export const latestEpisode = episodes[0];
