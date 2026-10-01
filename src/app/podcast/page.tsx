import Image from "next/image";
import { PodcastLibrary } from "@/components/libraries/PodcastLibrary";
import { RevealImage } from "@/components/motion/Reveal";
import { ButtonAnchor } from "@/components/ui/Button";
import { episodes, latestEpisode, PODCAST } from "@/content/podcast";
import { dateParts, formatDate } from "@/lib/format";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: `Podcast · ${PODCAST.title}`,
  description: PODCAST.description,
  path: "/podcast",
  image: PODCAST.cover,
});

/** Año del primer episodio (la lista va del más nuevo al más viejo). */
const firstYear = dateParts(episodes[episodes.length - 1].publishedAt).year;

export default function PodcastPage() {
  const ep = latestEpisode;
  const paragraphs = ep.description.split(/\n{2,}/);

  return (
    <>
      {/*
        Portada oficial del show: cuadrada, entera (sin recorte); es la imagen protagonista de la página.
        Sin banda de color (D2-C): la cabecera va sobre la superficie neutra y la cierra el filete del
        último episodio. En móvil la portada va chica arriba del título. Primer pantallazo: llega visible
        desde el servidor (sin Reveal).
      */}
      <section>
        <div className="container-x grid grid-cols-[minmax(0,1fr)] gap-8 pb-12 pt-8 sm:pt-12 md:grid-cols-[minmax(0,1fr)_minmax(0,22rem)] md:items-end md:gap-12 md:pb-16 lg:grid-cols-[minmax(0,1fr)_minmax(0,28rem)] lg:gap-20 lg:pb-20 lg:pt-16">
          <div className="w-36 max-w-full overflow-hidden rounded-media bg-surface-alt sm:w-48 md:order-last md:w-full">
            <Image
              src={PODCAST.cover}
              alt={`Portada del podcast ${PODCAST.fullTitle}`}
              width={640}
              height={640}
              preload
              loading="eager"
              sizes="(min-width: 1024px) 28rem, (min-width: 768px) 22rem, (min-width: 640px) 12rem, 9rem"
              className="block h-auto w-full"
            />
          </div>

          <div className="min-w-0">
            <h1 className="font-display text-display-xl">
              {PODCAST.title}
              {/* La conductora, un paso abajo en la misma voz (Gloock no tiene itálica: el énfasis es el tamaño) */}
              <span className="mt-2 block text-display-md text-ink-muted">con {PODCAST.host}</span>
            </h1>
            <p className="mt-6 max-w-lg text-base leading-relaxed text-pretty text-ink-muted sm:text-lead">{PODCAST.description}</p>
            {/* En tablet vertical la columna es angosta (la portada ocupa 24rem): botón y meta se apilan hasta lg.
                El conteo va en una línea desde sm; en el celular puede partirse (con la letra al 200 % no cabe). */}
            <div className="mt-8 flex flex-col items-start gap-4 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-6 md:flex-col md:items-start lg:flex-row lg:items-center">
              <ButtonAnchor href={PODCAST.spotifyShowUrl} external size="lg" className="w-full sm:w-auto">
                Escuchar en Spotify
              </ButtonAnchor>
              <p className="label text-ink-muted sm:whitespace-nowrap">
                {episodes.length} episodios · desde {firstYear}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Último episodio: título tal cual está en Spotify (en minúsculas) y la descripción completa. */}
      <section aria-labelledby="ultimo-episodio" className="container-x">
        <article className="rule grid grid-cols-[minmax(0,1fr)] gap-6 pt-8 sm:grid-cols-[11rem_minmax(0,1fr)] sm:gap-10 sm:pt-10 lg:grid-cols-[15rem_minmax(0,1fr)] lg:gap-16 lg:pt-14">
          {/* La portada repite el enlace del botón: fuera del tabulador y del lector */}
          <a href={ep.spotifyUrl} target="_blank" rel="noopener noreferrer" tabIndex={-1} aria-hidden="true" className="group block w-28 sm:w-full">
            <RevealImage as="span" className="card-media relative block aspect-square overflow-hidden rounded-media bg-surface-alt">
              <Image src={ep.image} alt="" fill sizes="(min-width: 1024px) 15rem, (min-width: 640px) 11rem, 7rem" className="object-cover" />
            </RevealImage>
          </a>
          <div className="min-w-0">
            <p className="label text-ink-muted">
              Último episodio · Ep. {ep.number} · <time dateTime={ep.publishedAt}>{formatDate(ep.publishedAt, { weekday: undefined, year: "numeric" })}</time> ·{" "}
              {ep.durationMin} min
            </p>
            <h2 id="ultimo-episodio" className="mt-3 font-display text-display-lg">
              {ep.title}
            </h2>
            <div className="mt-6 max-w-[62ch] space-y-4 text-base leading-relaxed text-ink-muted">
              {paragraphs.map((p, i) => (
                <p key={i} className="whitespace-pre-line">
                  {p}
                </p>
              ))}
            </div>
            {/* Contorno: la acción terracota de la página es la de la cabecera (mismo destino: Spotify) */}
            <ButtonAnchor href={ep.spotifyUrl} external variant="outline" size="lg" className="mt-8 w-full sm:w-auto">
              Escuchar en Spotify
              <span className="sr-only"> el episodio {ep.number}</span>
            </ButtonAnchor>
          </div>
        </article>
      </section>

      <section aria-labelledby="todos-los-episodios" className="container-x mt-16 sm:mt-24">
        {/* Mismo estilo que SectionHeading (aquí con id para aria-labelledby) */}
        <div className="rule pt-4">
          <h2 id="todos-los-episodios" className="font-display text-display-lg">
            Todos los episodios
          </h2>
        </div>
        <PodcastLibrary />
        <p className="mt-8 text-sm text-ink-muted">Los episodios se reproducen en Spotify.</p>
      </section>
    </>
  );
}
