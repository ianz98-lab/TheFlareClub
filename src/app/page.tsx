import Image from "next/image";
import Link from "next/link";
import { ButtonLink } from "@/components/ui/Button";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { NewTabHint } from "@/components/ui/NewTabHint";
import { Row } from "@/components/Row";
import { Reveal, RevealHeading, RevealImage, RevealList } from "@/components/motion/Reveal";
import { HeroFade, Parallax } from "@/components/motion/Parallax";
import { HeroPicture } from "@/components/home/HeroPicture";
import { ClassCard } from "@/components/cards/ClassCard";
import { CourseCard } from "@/components/cards/CourseCard";
import { TalkCard } from "@/components/cards/TalkCard";
import { EventCard } from "@/components/cards/EventCard";
import { WorkbookFeature } from "@/components/cards/WorkbookFeature";
import { classes } from "@/content/classes";
import { meditations } from "@/content/meditations";
import { courses } from "@/content/courses";
import { publishedTalks } from "@/content/talks";
import { workbooks } from "@/content/workbooks";
import { eventBySlug, upcomingEvents } from "@/content/events";
import { latestEpisode, PODCAST } from "@/content/podcast";
import { ABOUT_PHOTOS, STUDIO_PHOTOS } from "@/content/media";
import { FEELINGS, MOMENTS, labelOf } from "@/content/taxonomies";
import { ABOUT, COMING_SOON, COURSES, coursesLive, EVENTS, HOME, MEMBERSHIP, ROUTINE, SECTIONS, TALKS, WORKBOOKS } from "@/content/site";
import { PRESETS, totalMinutes } from "@/lib/routine";
import { formatDate } from "@/lib/format";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "The Flare Club — Movimiento, crecimiento y bienestar",
  absoluteTitle: true,
  description: `${HOME.hero.title} ${HOME.hero.paragraphs[0]}`,
  path: "/",
});

/** Hero: la foto horizontal desde 640 px y un recorte 4:5 con las caras al centro (1133 × 1416) en el celular. */
const HERO = {
  wide: "/images/fundadoras-mariana-sofi-estudio.jpg",
  tall: "/images/fundadoras-mariana-sofi-estudio-movil.jpg",
  alt: "Mariana y Sofi Wer, fundadoras de The Flare Club, en el estudio",
};

/** Banda de foto entre el índice y "Arma tu rutina": la foto grupal de Pilates & Charms (fuera de su galería, no es portada ni miniatura en otro lado). */
const BAND_EVENT = eventBySlug("pilates-charms-sep-2026");
const BAND_PHOTO = BAND_EVENT?.gallery?.[3];

/** Foto del aviso de Charlas (solo desde lg). La portada de /charlas es otra. */
const TALKS_PHOTO = STUDIO_PHOTOS.charla;

/**
 * Inicio. Cada bloque lee de la misma fuente que su página (site.ts, events.ts, podcast.ts,
 * workbooks.ts…), así Inicio se actualiza sola cuando cambia una sección.
 *
 * Color (D2-C): todo sobre `surface`, separado por filetes y aire; el calor lo ponen las fotos. Un solo
 * bloque oscuro (Meditaciones, en espresso) cambia el ritmo a mitad de página. Terracota solo en la
 * acción principal de cada pantallazo (hero, "Arma tu rutina"), en los estados ("Nuevo",
 * "Próximamente") y al pasar el mouse por un enlace en Gloock: `text-accent` desde 24 px,
 * `text-accent-ink` en lo más chico.
 * Tipografía (D1-A): Gloock solo con tokens display. Dos niveles de H2: los bloques protagonistas
 * (Arma tu rutina, ¿Qué necesitas hoy?, Mariana y Sofi) en `display-xl`, el resto con SectionHeading.
 * En el celular, esos H2 y el índice bajan a `display-lg`: en `display-xl` medían casi lo mismo que el H1
 * (1.12×) y la página perdía jerarquía; así el H1 queda 1.37× por encima.
 *
 * Motion: una sola entrada orquestada en el hero (CSS, corre antes de hidratar) y, más abajo, una
 * primitiva por tipo de contenido: fotos con cortina, titulares que suben, filas que aparecen.
 * Párrafos, formularios y textos largos no se animan.
 */
export default function HomePage() {
  const newClasses = classes.filter((c) => c.isNew || c.featured).slice(0, 4);
  const featMed = meditations.filter((m) => m.featured).slice(0, 4);
  const workbook = workbooks.find((w) => w.featured) ?? workbooks[0];
  const talksLive = publishedTalks.length > 0;
  const coursesOpen = coursesLive();
  const teasers = !talksLive && !coursesOpen ? "both" : !talksLive || !coursesOpen ? "one" : null;
  const nextEvents = upcomingEvents().slice(0, 2);
  const founders = ABOUT_PHOTOS[0];

  return (
    <>
      {/* 1 · Hero: foto a sangre con parallax y bloque de la superficie montado. Vende el porqué, no el qué.
          La foto se queda con lo que sobra del primer pantallazo (alto de pantalla menos header,
          texto y, en móvil, la barra inferior): así el botón se ve sin hacer scroll. w-full evita
          que el max-h angoste la foto a través del aspect-ratio. Medido con Gloock + Hanken: el botón
          queda sobre la barra inferior en 320×640 (ahí el titular va en 4 líneas y la foto baja a su
          mínimo de 10rem), 360×740, 375×667/812 y 390×844, y dentro del primer
          pantallazo en 1024×768, 1280×800, 1366×768, 1440×900 y 1920×1080.
          Celular acostado (landscape-short): ahí el cálculo dejaba la foto en su mínimo y el bloque de
          texto la tapaba casi entera (quedaba una franja de 80 px con las caras cortadas). Pasa a una
          franja de hasta el 55 % del alto, sin que el texto la monte, y deja lugar arriba de la barra
          inferior para el relleno y la primera línea y media del H1 (6.5rem): se ven las caras y el
          titular en el primer pantallazo (medido en 568×320, 667×375, 812×375 y 932×430).
          Entrada: la foto se descubre de abajo hacia arriba (.hero-clip), luego el titular y al final
          el texto con el botón (.hero-in, 150 y 300 ms). */}
      <section className="relative">
        <Parallax
          className="hero-clip aspect-[4/5] w-full max-h-[calc(100svh-29rem-env(safe-area-inset-bottom))] min-h-52 narrow:min-h-40 sm:aspect-[16/10] sm:max-h-[calc(100svh-23rem)] lg:aspect-[21/9] lg:max-h-[calc(100svh-26rem)] lg:min-h-[23rem] landscape-short:h-[min(55svh,calc(100svh-var(--header-h)-var(--tabbar-space)-6.5rem))] landscape-short:max-h-none landscape-short:min-h-0"
          strength={10}
        >
          {/* Con parallax el marco mide 130 % del alto y la foto lo cubre: en el celular y la tablet se
              dibuja más ancha que la pantalla (hasta 1.3x y 1.38x); desde lg, el ancho de la pantalla. */}
          <HeroPicture
            wide={HERO.wide}
            tall={HERO.tall}
            alt={HERO.alt}
            sizes={{ wide: "(min-width: 1024px) 100vw, 138vw", tall: "130vw" }}
            eager
            className="object-cover object-[center_30%] lg:object-[center_10%]"
          />
        </Parallax>
        <div className="container-x relative -mt-24 sm:-mt-32 lg:-mt-40 landscape-short:mt-0">
          {/* El bloque se extiende hasta el borde de la columna (-ml del gutter) y lo devuelve como
              relleno: el texto queda alineado con el resto de la página y nunca toca el corte de la foto.
              En el celular cubre también el gutter derecho (-mr): si no, quedaba una tira de foto de 20 px
              junto al titular. El desfase (foto asomando a la derecha) queda desde sm, donde el bloque es
              angosto contra la foto.
              Desde lg se ensancha lo justo para que el titular quede en dos líneas ("Todo cambia cuando /
              empiezas a elegirte."): Gloock es ancha y en tres líneas empujaba el botón fuera de la pantalla. */}
          <HeroFade className="-ml-(--gutter) max-w-[48rem] bg-surface px-(--gutter) pt-5 max-sm:-mr-(--gutter) sm:pt-8 lg:max-w-[min(57rem,72vw)] lg:pt-10">
            <h1 className="hero-in font-display text-display-2xl" style={{ animationDelay: "150ms" }}>
              {HOME.hero.title}
            </h1>
            {/* El retraso va en línea: .hero-in (fuera de las capas de Tailwind) pisaría una utilidad animation-delay */}
            <div className="hero-in" style={{ animationDelay: "300ms" }}>
              <div className="mt-6 max-w-xl space-y-3 text-body-sm leading-relaxed text-ink-muted sm:mt-8 sm:text-lead">
                {HOME.hero.paragraphs.map((p) => (
                  <p key={p}>{p}</p>
                ))}
              </div>
              <ButtonLink href="#explora" size="lg" className="mt-8 w-full sm:w-auto">
                {HOME.hero.cta}
              </ButtonLink>
            </div>
          </HeroFade>
        </div>
      </section>

      {/* 2 · Índice de las secciones de contenido (SECTIONS en site.ts; "Próximamente" sale de ahí).
          La lista en tipografía grande es la firma de Inicio. Al pasar el mouse la fila se subraya (su
          filete inferior se oscurece) y el nombre toma el terracota del logo. */}
      <section id="explora" aria-labelledby="explora-title" className="container-x mt-16 sm:mt-24">
        <h2 id="explora-title" className="sr-only">
          {HOME.hero.cta}
        </h2>
        <RevealList as="ol" className="rule">
          {SECTIONS.map((s, i) => (
            <li key={s.href}>
              <Link
                href={s.href}
                className="group grid grid-cols-[2.25rem_minmax(0,1fr)] items-baseline gap-x-3 border-b border-line py-5 transition-colors duration-(--duration-base) hover:border-ink sm:grid-cols-[3.5rem_minmax(0,1fr)] sm:gap-x-6 sm:py-6 lg:grid-cols-[4rem_minmax(0,1fr)_minmax(0,21rem)] lg:gap-x-8"
              >
                <span className="label col-start-1 row-start-1 text-ink-muted">{String(i + 1).padStart(2, "0")}</span>
                {/* min-w-0 y wrap-anywhere: con la letra al 200 % en 320 px, nombre y "Próximamente" se
                    parten antes que empujar la fila fuera de la pantalla */}
                <span className="col-start-2 row-start-1 flex min-w-0 flex-wrap items-baseline gap-x-3 gap-y-1">
                  <span className="min-w-0 font-display text-display-lg transition-colors duration-(--duration-base) group-hover:text-accent sm:text-display-xl">
                    {s.label}
                  </span>
                  {s.status && <span className="label min-w-0 text-accent-ink wrap-anywhere">{s.status}</span>}
                </span>
                {/* Móvil y tablet: la nota va debajo del nombre; desktop: en su columna, centrada contra el
                    nombre (alineada a la línea base, las notas de dos líneas estiraban su fila y el índice
                    quedaba con alturas dispares) */}
                <span className="col-start-2 row-start-2 mt-2 max-w-md text-sm leading-snug text-ink-muted lg:col-start-3 lg:row-start-1 lg:mt-0 lg:self-center">{s.note}</span>
              </Link>
            </li>
          ))}
        </RevealList>
      </section>

      {/* Banda de foto a sangre: una pausa entre el índice y la herramienta, con la comunidad real */}
      {BAND_EVENT && BAND_PHOTO && (
        <figure className="mt-20 sm:mt-28">
          <RevealImage className="relative aspect-[4/3] w-full overflow-hidden bg-surface-alt sm:aspect-[2/1] lg:aspect-[5/2] lg:max-h-[75svh]">
            <Image
              src={BAND_PHOTO.src}
              alt={BAND_PHOTO.alt ?? ""}
              fill
              sizes="100vw"
              className="object-cover"
              style={{ objectPosition: BAND_PHOTO.focal }}
            />
          </RevealImage>
          <figcaption className="container-x mt-3 text-sm text-ink-muted">
            <Link href={`/eventos/${BAND_EVENT.slug}`} className="link">
              {BAND_EVENT.title}
            </Link>
            , {formatDate(BAND_EVENT.startsAt, { weekday: undefined, day: undefined, month: "long", year: "numeric" })}.
          </figcaption>
        </figure>
      )}

      {/* 3 · Arma tu rutina (herramienta de Movement). Sin banda de color: la foto de arriba ya lo separa
          y la acción principal de este pantallazo es el botón terracota. */}
      <section aria-labelledby="rutina-title" className="container-x mt-20 sm:mt-28">
        <div className="grid gap-8 md:grid-cols-[minmax(0,1fr)_auto] md:items-end md:gap-12">
          <div>
            <p className="label text-accent-ink">{ROUTINE.eyebrow}</p>
            <RevealHeading id="rutina-title" className="mt-3 font-display text-display-lg sm:text-display-xl">
              {ROUTINE.title}
            </RevealHeading>
            <p className="mt-5 max-w-xl text-body-sm leading-relaxed text-ink-muted sm:text-base">{ROUTINE.teaser}</p>
          </div>
          <ButtonLink href="/rutina" size="lg" className="w-full md:w-auto">
            {ROUTINE.cta}
          </ButtonLink>
        </div>

        <h3 className="label mt-14 text-ink-muted sm:mt-16">{ROUTINE.presetsTitle}</h3>
        {/* Toda la fila es el enlace. El nombre en serif solo no decía que se podía tocar (en el celular
            no hay hover): cada rutina cierra con su acción, que dice lo que pasa (abre el constructor con
            la rutina cargada). mt-auto: en dos y cuatro columnas las acciones quedan en la misma línea. */}
        <RevealList as="ul" className="mt-4 grid sm:grid-cols-2 sm:gap-x-8 lg:grid-cols-4">
          {PRESETS.map((p) => (
            <li key={p.id} className="flex">
              <Link
                href={`/rutina?preset=${p.id}`}
                className="group flex w-full flex-col border-t border-line-strong pt-4 pb-5 transition-colors duration-(--duration-base) hover:border-ink"
              >
                <span className="label tabular-nums text-ink-muted">
                  {totalMinutes(p)} min — {p.kicker}
                </span>
                <span className="mt-3 font-display text-display-md transition-colors duration-(--duration-base) group-hover:text-accent-ink">
                  {p.name}
                </span>
                <span className="mt-3 max-w-xs text-sm leading-relaxed text-ink-muted">{p.blurb}</span>
                {/* La flecha en inline-block: queda fuera del subrayado y se corre al pasar el mouse */}
                <span className="link-action mt-auto self-start pt-2 group-hover:decoration-current">
                  <span>
                    Usar esta rutina
                    <span
                      aria-hidden="true"
                      className="ml-1.5 inline-block transition-transform duration-(--duration-base) group-hover:translate-x-1 motion-reduce:group-hover:translate-x-0"
                    >
                      →
                    </span>
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </RevealList>
      </section>

      {/* 4 · ¿Qué necesitas hoy? (flecha solo en los atajos que te llevan a otra sección: estas opciones y
          "Usar esta rutina" de arriba) */}
      {/* Titular arriba y opciones en dos columnas hasta xl; desde xl, lado a lado con la columna del
          titular como la ancha. Gloock es ancha: en dos columnas desde lg, "¿Qué necesitas hoy?" quedaba
          partido ("¿Qué / necesitas hoy?") en 1024 y hasta en 1440 con 1fr_1.4fr. Medido: una línea
          en todos los anchos desde 375 px. */}
      <section aria-labelledby="need-title" className="container-x mt-20 grid gap-8 sm:mt-28 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] xl:gap-12">
        <div>
          <p className="label text-ink-muted">{HOME.need.eyebrow}</p>
          <RevealHeading id="need-title" className="mt-3 font-display text-display-lg sm:text-display-xl">
            {HOME.need.title}
          </RevealHeading>
          <p className="mt-4 max-w-sm text-body-sm leading-relaxed text-ink-muted sm:text-base">{HOME.need.description}</p>
        </div>
        <RevealList as="ul" className="grid gap-x-8 sm:grid-cols-2 xl:grid-cols-1">
          {/* li flex + w-full: en dos columnas, si una opción se parte en dos líneas, la vecina estira su
              filete hasta la misma altura */}
          {HOME.need.options.map((n) => (
            <li key={n.label} className="flex">
              <Link
                href={n.href}
                className="group flex min-h-16 w-full items-center justify-between gap-4 border-b border-line py-4 font-display text-display-md transition-colors duration-(--duration-base) hover:border-ink hover:text-accent-ink"
              >
                {n.label}
                <span
                  aria-hidden
                  className="font-sans text-body-sm text-ink-muted transition duration-(--duration-base) group-hover:translate-x-1 group-hover:text-accent-ink motion-reduce:group-hover:translate-x-0"
                >
                  →
                </span>
              </Link>
            </li>
          ))}
        </RevealList>
      </section>

      {/* 5 · Movement: tarjetas con foto (un solo "Ver todo" por sección, también en móvil) */}
      <section className="container-x mt-20 sm:mt-28">
        <SectionHeading title="Clases nuevas" href="/movement" />
        <Reveal kind="fade">
          <Row>
            {newClasses.map((c) => (
              <ClassCard key={c.id} c={c} size="row" />
            ))}
          </Row>
        </Reveal>
      </section>

      {/* 6 · Meditaciones: otro ritmo que las clases. El único bloque oscuro de la página (espresso, como
          el player donde se escuchan): filas de lista con la duración y el momento, y el título en Gloock
          claro. `.on-dark` redefine tinta, filetes y foco para este fondo. */}
      <section className="on-dark mt-20 bg-espresso py-16 sm:mt-28 sm:py-24">
        <div className="container-x">
          <SectionHeading title="Meditaciones destacadas" href="/meditaciones" />
          <RevealList as="ul">
            {featMed.map((m) => (
              <li key={m.id}>
                <Link
                  href={`/meditaciones/${m.slug}`}
                  className="group grid gap-y-2 border-b border-line py-5 transition-colors duration-(--duration-base) hover:border-ink sm:py-6 md:grid-cols-[12rem_minmax(0,1fr)] md:items-baseline md:gap-x-8 lg:grid-cols-[12rem_minmax(0,1fr)_minmax(0,16rem)]"
                >
                  <span className="label tabular-nums text-ink-muted">
                    {m.duration} min · {labelOf(MOMENTS, m.moment)}
                  </span>
                  <span className="font-display text-display-md transition-colors duration-(--duration-base) group-hover:text-accent-soft">{m.title}</span>
                  <span className="hidden text-sm leading-snug text-ink-muted lg:block">{m.feelings.map((f) => labelOf(FEELINGS, f)).join(" · ")}</span>
                </Link>
              </li>
            ))}
          </RevealList>
        </div>
      </section>

      {/* 7 · Workbooks (el mismo bloque que en /workbooks y Mi cuenta) */}
      {workbook && (
        <section className="container-x mt-20 sm:mt-28">
          <SectionHeading eyebrow={WORKBOOKS.eyebrow} title={WORKBOOKS.title} href="/workbooks" />
          <Reveal>
            <WorkbookFeature w={workbook} compact />
          </Reveal>
        </section>
      )}

      {/* 8 · Charlas y Cursos: con contenido publicado, fila de tarjetas; si no, su aviso "próximamente" */}
      {talksLive && (
        <section className="container-x mt-20 sm:mt-28">
          <SectionHeading eyebrow={TALKS.eyebrow} title={TALKS.title} href="/charlas" />
          <Reveal kind="fade">
            <Row cols="lg:grid-cols-3">
              {publishedTalks.slice(0, 3).map((t) => (
                <TalkCard key={t.id} t={t} size="row" />
              ))}
            </Row>
          </Reveal>
        </section>
      )}

      {coursesOpen && (
        <section className="container-x mt-20 sm:mt-28">
          <SectionHeading eyebrow={COURSES.eyebrow} title={COURSES.title} href="/cursos" />
          <Reveal kind="fade">
            <Row cols="lg:grid-cols-3">
              {courses.slice(0, 3).map((c) => (
                <CourseCard key={c.id} c={c} size="row" />
              ))}
            </Row>
          </Reveal>
        </section>
      )}

      {/* Avisos "próximamente": en el celular, dos filas compactas que llevan directo al formulario de su
          página (#avisos, #lista-espera: el botón dice "Activar notificaciones", no "ir a Charlas"); desde
          lg, lado a lado con pesos distintos: Charlas ancha con foto y Cursos como columna angosta de solo
          texto, ambas bajo el mismo filete. */}
      {teasers && (
        <div className="container-x mt-20 sm:mt-28">
          <div className={`grid grid-cols-[minmax(0,1fr)] gap-y-10 ${teasers === "both" ? "lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] lg:gap-x-6" : "lg:max-w-3xl"}`}>
            {!talksLive && (
              <section aria-labelledby="charlas-title" className="rule grid grid-cols-[minmax(0,1fr)] gap-x-8 pt-5 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] lg:items-end">
                <RevealImage className="relative hidden aspect-[4/5] overflow-hidden rounded-media bg-surface-alt lg:block">
                  {/* Oculta en el celular: con carga diferida no se descarga */}
                  <Image
                    src={TALKS_PHOTO.src}
                    alt={TALKS_PHOTO.alt}
                    fill
                    sizes="(min-width: 1408px) 376px, (min-width: 1024px) 27vw, 1px"
                    className="object-cover"
                    style={{ objectPosition: TALKS_PHOTO.focal }}
                  />
                </RevealImage>
                <div>
                  <p className="label text-ink-muted">{TALKS.eyebrow}</p>
                  <h2 id="charlas-title" className="mt-3 max-w-lg font-display text-display-md">
                    {TALKS.empty.title}
                  </h2>
                  <p className="mt-3 max-w-md text-body-sm leading-relaxed text-ink-muted sm:text-base">{TALKS.empty.description}</p>
                  <Link href="/charlas#avisos" className="link-action mt-2">
                    {TALKS.notify.cta}
                  </Link>
                </div>
              </section>
            )}
            {!coursesOpen && (
              <section aria-labelledby="cursos-title" className="rule flex flex-col pt-5">
                <p className="label text-ink-muted">
                  {COURSES.eyebrow} · <span className="text-accent-ink">{COMING_SOON}</span>
                </p>
                <h2 id="cursos-title" className="mt-3 font-display text-display-md">
                  {COURSES.title}
                </h2>
                <p className="mt-3 max-w-md text-body-sm leading-relaxed text-ink-muted sm:text-base">{COURSES.paragraphs[0]}</p>
                <div className="mt-2 lg:mt-auto lg:pt-6">
                  <Link href="/cursos#lista-espera" className="link-action">
                    {COURSES.cta}
                  </Link>
                </div>
              </section>
            )}
          </div>
        </div>
      )}

      {/* 9 · Eventos + Podcast */}
      <section className="container-x mt-20 grid grid-cols-[minmax(0,1fr)] gap-16 sm:mt-28 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
        <div>
          <SectionHeading title={EVENTS.upcomingTitle} href="/eventos" />
          {nextEvents.length > 0 ? (
            <RevealList className="space-y-10">
              {nextEvents.map((e) => (
                <EventCard key={e.id} e={e} />
              ))}
            </RevealList>
          ) : (
            <p className="max-w-md text-body-sm leading-relaxed text-ink-muted sm:text-base">{EVENTS.description}</p>
          )}
        </div>

        <div>
          <SectionHeading title={PODCAST.title} description={`con ${PODCAST.host}`} href="/podcast" linkLabel="Episodios" />
          {/* Portada chica al lado del texto; bajo 360 px (o con la letra agrandada) va arriba, como en
              /podcast: al lado, la columna de texto quedaba en 88 px y el título se partía a media palabra. */}
          <Reveal>
            <a
              href={latestEpisode.spotifyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group grid grid-cols-[112px_minmax(0,1fr)] items-start gap-5 narrow:grid-cols-[minmax(0,1fr)] sm:grid-cols-[200px_minmax(0,1fr)] lg:grid-cols-[minmax(0,1fr)]"
            >
              {/* Portada de Spotify: el loader pide la de 300 o 640 px según el ancho real */}
              <div className="card-media relative aspect-square overflow-hidden rounded-media bg-surface-alt narrow:w-28">
                <Image src={PODCAST.cover} alt="" fill sizes="(min-width: 1024px) 540px, (min-width: 640px) 200px, 112px" className="object-cover" />
              </div>
              <div>
                <p className="label tabular-nums text-ink-muted">Último episodio · Ep. {latestEpisode.number}</p>
                <p className="mt-2 font-display text-display-md transition-colors duration-(--duration-base) group-hover:text-accent-ink">
                  {latestEpisode.title}
                </p>
                <p className="mt-2 text-sm tabular-nums text-ink-muted">
                  {formatDate(latestEpisode.publishedAt, { weekday: undefined, year: "numeric" })} · {latestEpisode.durationMin} min
                </p>
                <span className="link-action mt-1">
                  Escuchar en Spotify
                  <NewTabHint />
                </span>
              </div>
            </a>
          </Reveal>
        </div>
      </section>

      {/* 10 · Sobre nosotras: sin banda de color; la foto de las fundadoras pone el calor */}
      <section aria-labelledby="nosotras-title" className="container-x mt-24 sm:mt-32">
        <div className="rule grid gap-10 pt-10 md:grid-cols-2 md:items-center md:gap-16 lg:pt-16">
          {founders && (
            <RevealImage className="relative aspect-[4/5] overflow-hidden rounded-media bg-surface-alt md:order-2">
              <Image
                src={founders.src}
                alt="Mariana y Sofi Wer, fundadoras de The Flare Club"
                fill
                sizes="(min-width: 1408px) 624px, (min-width: 768px) 45vw, 92vw"
                className="object-cover"
                style={{ objectPosition: founders.focal }}
              />
            </RevealImage>
          )}
          <div>
            <RevealHeading id="nosotras-title" className="font-display text-display-lg sm:text-display-xl">
              Mariana y Sofi Wer
            </RevealHeading>
            <p className="mt-5 max-w-md text-body-sm leading-relaxed text-ink-muted sm:text-base">{ABOUT.homeTeaser}</p>
            <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center sm:gap-8">
              <ButtonLink href="/sobre-nosotras" variant="outline" size="lg" className="w-full sm:w-auto">
                Conócenos
              </ButtonLink>
              <Link href="/corporativo" className="link-action self-start sm:self-auto">
                {MEMBERSHIP.business.cta}
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
