import Image from "next/image";
import { ButtonLink } from "@/components/ui/Button";
import { ReadMore } from "@/components/ui/ReadMore";
import { Parallax } from "@/components/motion/Parallax";
import { Reveal, RevealHeading, RevealImage, RevealList } from "@/components/motion/Reveal";
import { instructors } from "@/content/instructors";
import { ABOUT, MEMBERSHIP } from "@/content/site";
import { ABOUT_PHOTOS, EVENT_GALLERIES, STUDIO_PHOTOS } from "@/content/media";
import type { Photo } from "@/content/types";
import { pageMetadata } from "@/lib/seo";

/**
 * Foto del hero: las dos fundadoras juntas, mirando a cámara. Es propia de esta página (Inicio usa
 * la del estudio). Vertical 4:5: a sangre en el celular y la tablet, y desde lg en su columna
 * (así no se recorta a una franja ni se estira más allá de sus 1421 px).
 */
const HERO: Photo | undefined = ABOUT_PHOTOS[0];
const HERO_ALT = "Mariana y Sofi Wer, fundadoras de The Flare Club, abrazadas y sonriendo";

export const metadata = pageMetadata({
  title: ABOUT.eyebrow,
  description: ABOUT.intro[0],
  path: "/sobre-nosotras",
  image: HERO ? { ...HERO, alt: HERO_ALT } : undefined,
});

/** Encuadre de las fotos de fundadoras (verticales 2:3 recortadas a 4:5). */
const FOUNDER_FOCAL: Record<string, string> = { mariana: "center 65%", sofi: "center 30%" };

/** Junto a la frase de marca: las dos de pie (otra toma que la del hero). */
const TOGETHER: Photo = STUDIO_PHOTOS.duo;

type GalleryItem = { photo: Photo; focal?: string };

/**
 * Galería de cierre: fundadoras dando clase y charla, alternadas con momentos de la comunidad.
 * Sin repetir las fotos de arriba ni la del hero de Charlas (ABOUT_PHOTOS[1]); ABOUT_PHOTOS[2] es
 * la misma toma que la foto de Sofi en "Fundadoras".
 */
const GALLERY_ITEMS: Partial<GalleryItem>[] = [
  { photo: EVENT_GALLERIES["pilates-vision-board-mar-2026"]?.[1] },
  // Clase riéndose en pleno ejercicio (Pilates & Charms): las caras quedan arriba del centro.
  { photo: EVENT_GALLERIES["pilates-charms-sep-2026"]?.[7], focal: "center 40%" },
  // Charla con micrófono de mano: el encuadre deja fuera el exhibidor de la izquierda.
  { photo: STUDIO_PHOTOS.charla, focal: "62% 40%" },
  { photo: EVENT_GALLERIES["pilates-journaling-feb-2026"]?.[0] },
];
const GALLERY = GALLERY_ITEMS.filter((g): g is GalleryItem => Boolean(g.photo));

/** Parte la frase en sus dos oraciones para darle a la segunda otro tono. */
function splitQuote(q: string): [string, string] {
  const i = q.indexOf(". ");
  return i === -1 ? [q, ""] : [q.slice(0, i + 1), q.slice(i + 2)];
}

const BODY = "text-base leading-relaxed text-ink-muted sm:text-lead";

/**
 * Rol en segmentos que no se parten ("Co-fundadora ·" / "Coach de Pilates Mat & Barre"): así el
 * corte en móvil cae en el punto medio y no deja una palabra huérfana. Si un segmento no cabe
 * en la línea, inline-block igual lo deja envolverse.
 */
function Role({ text }: { text: string }) {
  const parts = text.split(" · ");
  return parts.map((part, i) => (
    <span key={part}>
      <span className="inline-block">
        {part}
        {i < parts.length - 1 && " ·"}
      </span>
      {i < parts.length - 1 && " "}
    </span>
  ));
}

export default function SobreNosotrasPage() {
  const founders = instructors.filter((i) => i.founder);
  const intro = ABOUT.intro.slice(0, -1);
  const closing = ABOUT.intro[ABOUT.intro.length - 1];
  const [quoteA, quoteB] = splitQuote(ABOUT.quote);

  return (
    <>
      {/*
        Hero. Celular y tablet: foto a sangre y el titular en un bloque crema montado sobre ella (desde
        sm; en el celular no llegaba a los bordes y dejaba dos tiras de foto). Desde lg: titular y
        entrada a la izquierda, la foto en su columna. Primer pantallazo: llega visible desde el HTML,
        sin Reveal; solo la foto tiene parallax.
      */}
      <section className="lg:mx-auto lg:grid lg:max-w-[88rem] lg:grid-cols-12 lg:gap-x-8 lg:px-(--gutter) lg:pt-6">
        {HERO && (
          <Parallax
            className="aspect-[4/5] w-full sm:aspect-[4/3] sm:max-h-[78svh] lg:col-span-6 lg:col-start-7 lg:row-start-1 lg:aspect-[4/5] lg:max-h-[calc(100svh-var(--header-h)-3rem)] lg:rounded-media"
            strength={6}
          >
            <Image
              src={HERO.src}
              alt={HERO_ALT}
              fill
              preload
              sizes="(min-width: 1408px) 660px, (min-width: 1024px) 46vw, 100vw"
              // Arriba: en los cuadros más anchos que la foto (tablet) no se cortan las gorras.
              className="object-cover object-top"
            />
          </Parallax>
        )}
        <div className="container-x relative sm:-mt-28 lg:col-span-6 lg:col-start-1 lg:row-start-1 lg:mt-0 lg:self-end lg:px-0">
          {/*
            Relleno parejo y ancho al texto: el titular se limita a dos líneas para que el bloque de la
            superficie lo abrace y no tape la foto de lado a lado. El margen negativo lo deja alineado con la página.
          */}
          <div className="bg-surface pt-8 sm:-ml-(--gutter) sm:w-fit sm:px-(--gutter) sm:pt-(--gutter) lg:m-0 lg:p-0">
            <h1 className="font-display text-display-xl sm:max-w-[7.5em]">{ABOUT.title}</h1>
          </div>
          <p className="mt-8 max-w-[65ch] text-xl leading-snug text-ink sm:mt-10 sm:text-2xl sm:leading-snug lg:max-w-[38ch]">{intro[0]}</p>
        </div>
      </section>

      {/* Sin Reveal en los párrafos (texto largo); solo la frase de cierre, que es un titular. */}
      <div className="container-x">
        <div className="max-w-[65ch]">
          <div className={`mt-6 space-y-5 ${BODY}`}>
            {intro.slice(1).map((p) => (
              <p key={p}>{p}</p>
            ))}
          </div>
          <RevealHeading as="p" className="mt-10 font-display text-display-lg">
            {closing}
          </RevealHeading>
        </div>
      </div>

      {/*
        Frase de marca en grande, junto a la foto de las dos (en móvil, la foto va debajo). Sin banda de
        color (D2-C): la separan el filete y el aire. La segunda oración, en el acento, es el énfasis
        (Gloock no tiene itálica).
      */}
      <section className="container-x mt-20 sm:mt-28" aria-label="Nuestra frase">
        <div className="rule grid gap-10 pt-12 sm:pt-16 md:grid-cols-12 md:items-center lg:gap-16 lg:pt-20">
          <blockquote className="md:col-span-7">
            {/* Una línea por oración: entran una tras otra */}
            {/* Bajo 360 px (o con la letra agrandada) un paso menos: con Gloock la frase pasaba a 5 líneas */}
            <RevealHeading as="p" className="max-w-[16ch] font-display text-display-xl narrow:text-display-lg">
              <span className="block">{quoteA}</span>
              {quoteB && <span className="mt-2 block text-accent">{quoteB}</span>}
            </RevealHeading>
          </blockquote>
          <figure className="sm:max-w-sm md:col-span-5 md:max-w-none">
            <RevealImage className="relative aspect-[4/5] overflow-hidden rounded-media bg-surface-alt">
              <Image
                src={TOGETHER.src}
                alt={TOGETHER.alt ?? ""}
                fill
                sizes="(min-width: 1024px) 36vw, (min-width: 768px) 40vw, (min-width: 640px) 384px, 100vw"
                className="object-cover"
                style={{ objectPosition: TOGETHER.focal }}
              />
            </RevealImage>
            <figcaption className="mt-3 text-sm text-ink-muted">Mariana y Sofi Wer</figcaption>
          </figure>
        </div>
      </section>

      {/* 01 Nuestra historia · 02 ¿Qué significa Flare? · 03 Nuestra filosofía */}
      <div className="container-x mt-20 sm:mt-28">
        {ABOUT.blocks.map((b) => {
          const [lead, ...rest] = b.paragraphs;
          return (
            <section key={b.n} aria-labelledby={`bloque-${b.n}`} className="rule grid gap-6 py-10 sm:py-14 lg:grid-cols-12 lg:gap-10 lg:py-20">
              <div className="lg:col-span-4">
                {/* Fijo bajo el header mientras se lee el bloque; sube con el header cuando se oculta */}
                <div className="lg:sticky-aside">
                  <p className="label text-ink-muted">{b.n}</p>
                  <RevealHeading id={`bloque-${b.n}`} className="mt-2 font-display text-display-lg">
                    {b.title}
                  </RevealHeading>
                </div>
              </div>
              <div className="max-w-[65ch] lg:col-span-7 lg:col-start-6">
                <p className="text-lg leading-relaxed text-ink sm:text-xl sm:leading-relaxed">{lead}</p>
                <div className={`mt-5 space-y-5 ${BODY}`}>
                  {rest.map((p) => (
                    <p key={p}>{p}</p>
                  ))}
                </div>
              </div>
            </section>
          );
        })}
      </div>

      {/* Fundadoras */}
      <section aria-labelledby="fundadoras" className="container-x mt-10 sm:mt-16">
        <div className="rule pt-4">
          <RevealHeading id="fundadoras" className="font-display text-display-lg">
            {ABOUT.foundersTitle}
          </RevealHeading>
        </div>
        <div className="mt-10 space-y-20 sm:mt-14 sm:space-y-28">
          {founders.map((f, i) => {
            const flip = i % 2 === 1;
            return (
              <article key={f.id} className="grid gap-8 md:grid-cols-12 md:gap-10">
                <div className={`md:col-span-5 md:row-start-1 ${flip ? "md:col-start-8" : "md:col-start-1"}`}>
                  <div className="md:sticky-aside">
                    <RevealImage className="relative aspect-[4/5] overflow-hidden rounded-media bg-surface-alt">
                      <Image
                        src={f.photo}
                        alt={`${f.name}, co-fundadora de The Flare Club`}
                        fill
                        sizes="(min-width: 768px) 42vw, 100vw"
                        className="object-cover"
                        style={{ objectPosition: FOUNDER_FOCAL[f.id] ?? "center 30%" }}
                      />
                    </RevealImage>
                  </div>
                </div>
                <div className={`md:col-span-7 md:row-start-1 md:self-center ${flip ? "md:col-start-1" : "md:col-start-6"}`}>
                  <Reveal>
                    <h3 className="font-display text-display-lg">{f.name}</h3>
                    {/* La frase de cada una en itálica real de Hanken (Gloock no tiene itálica) */}
                    {f.tagline && <p className="mt-3 text-lg leading-snug text-ink-muted italic-accent sm:text-xl">{f.tagline}</p>}
                    <p className="label mt-4 text-ink-muted">
                      <Role text={f.role} />
                    </p>
                  </Reveal>
                  {/* Mismo largo visible para las dos (2 párrafos y "Leer más", también en desktop) hasta tener la bio nueva de Sofi */}
                  <ReadMore paragraphs={f.longBio ?? [f.bio]} visible={2} collapse="always" className="mt-6 max-w-[65ch]" paragraphClassName={BODY} />
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* Galería y cierre */}
      <section aria-labelledby="entrenamos" className="container-x mt-20 sm:mt-28">
        <RevealList className="grid grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-4">
          {GALLERY.map(({ photo, focal = photo.focal }) => (
            <div key={photo.src} className="relative aspect-[3/4] overflow-hidden rounded-media bg-surface-alt">
              <Image
                src={photo.src}
                alt={photo.alt ?? ""}
                fill
                sizes="(min-width: 1024px) 25vw, 50vw"
                className="object-cover"
                style={focal ? { objectPosition: focal } : undefined}
              />
            </div>
          ))}
        </RevealList>
        <div className="rule mt-12 flex flex-col gap-6 pt-8 sm:flex-row sm:items-center sm:justify-between">
          <RevealHeading id="entrenamos" className="font-display text-display-lg">
            ¿Entrenamos juntas?
          </RevealHeading>
          <ButtonLink href="/membresia" size="lg" className="w-full sm:w-auto">
            {MEMBERSHIP.cta}
          </ButtonLink>
        </div>
      </section>
    </>
  );
}
