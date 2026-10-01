import Image from "next/image";
import Link from "next/link";
import { EventCard, EventDatePanel } from "@/components/cards/EventCard";
import { SponsorList } from "@/components/events/SponsorList";
import { Reveal, RevealHeading, RevealList } from "@/components/motion/Reveal";
import { PageHero } from "@/components/PageHero";
import { ButtonLink } from "@/components/ui/Button";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { pastEvents, SPONSORS, upcomingEvents, VENUES } from "@/content/events";
import { EVENT_GALLERIES } from "@/content/media";
import { CORPORATE, EVENTS } from "@/content/site";
import type { FlareEvent } from "@/content/types";
import { formatDate } from "@/lib/format";
import { pageMetadata } from "@/lib/seo";

/** Foto propia de la página (la grupal de Pilates & Paint): no se repite en otras cabeceras. */
const HERO = EVENT_GALLERIES["pilates-paint-jul-2026"]?.[1];

export const metadata = pageMetadata({
  title: "Eventos",
  description: EVENTS.description,
  path: "/eventos",
  image: HERO,
});

/** Ancho real de cada flyer: 2 columnas hasta lg y 3 desde lg (contenedor de 88rem como máximo). */
const TILE_SIZES = "(min-width: 1408px) 416px, (min-width: 1024px) calc((100vw - 10rem) / 3), calc(50vw - 1.75rem)";

/** Flyer oficial de un evento pasado → su galería. Todo el bloque es un solo link. */
function PastEventTile({ e }: { e: FlareEvent }) {
  const photos = e.gallery?.length ?? 0;
  return (
    <Link href={`/eventos/${e.slug}`} className="group block">
      {e.cover ? (
        <div className="card-media relative aspect-[4/5] overflow-hidden rounded-media bg-surface-alt">
          <Image
            src={e.cover.src}
            alt=""
            fill
            sizes={TILE_SIZES}
            className="object-cover"
            style={e.cover.focal ? { objectPosition: e.cover.focal } : undefined}
          />
        </div>
      ) : (
        <EventDatePanel e={e} />
      )}
      <h3 className="mt-3 font-display text-display-sm transition-colors group-hover:text-accent-ink sm:text-display-md">{e.title}</h3>
      <p className="mt-1 text-sm text-ink-muted">
        {formatDate(e.startsAt, { weekday: undefined, year: "numeric" })}
        {e.area ? ` · ${e.area}` : ""}
      </p>
      {photos > 0 && (
        // El conteo nunca queda solo en otra línea ("Ver galería · / 10 fotos")
        <p className="mt-2 text-body-sm font-medium">
          <span className="link">Ver galería</span> <span className="whitespace-nowrap">· {photos} fotos</span>
        </p>
      )}
    </Link>
  );
}

export default function EventosPage() {
  const upcoming = upcomingEvents();
  const past = pastEvents();
  const brands = CORPORATE.audiences.find((a) => a.title === "Para marcas");

  return (
    <>
      {/* Compacta: en celular lo que está a la venta sube a la primera pantalla */}
      <PageHero compact eyebrow={EVENTS.eyebrow} title={EVENTS.title} description={EVENTS.description} image={HERO}>
        <nav aria-label="En esta página" className="-my-3 flex flex-wrap gap-x-6">
          <a href="#proximos" className="link-action">
            {EVENTS.upcomingTitle}
          </a>
          <a href="#anteriores" className="link-action">
            {EVENTS.pastTitle}
          </a>
        </nav>
      </PageHero>

      {/* 1 · Próximos eventos */}
      <section id="proximos" className="container-x pt-8 sm:pt-16 lg:pt-20">
        <Reveal>
          <SectionHeading title={EVENTS.upcomingTitle} />
        </Reveal>
        {upcoming.length > 0 ? (
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-x-12">
            {upcoming.map((e, i) => (
              <Reveal key={e.id} delay={i * 0.08}>
                <EventCard e={e} />
              </Reveal>
            ))}
          </div>
        ) : (
          <p className="rule-soft pt-5 font-display text-display-md text-ink-muted">Muy pronto anunciaremos la próxima fecha.</p>
        )}
      </section>

      {/* 2 · Eventos anteriores: flyers oficiales, cada uno abre su galería */}
      <section id="anteriores" className="container-x pt-20 sm:pt-28">
        <Reveal>
          <SectionHeading title={EVENTS.pastTitle} description={EVENTS.pastDescription} />
        </Reveal>
        <RevealList className="grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 lg:grid-cols-3 lg:gap-x-8 lg:gap-y-14">
          {past.map((e) => (
            <PastEventTile key={e.id} e={e} />
          ))}
        </RevealList>
      </section>

      {/* 3 · Marcas: lista de texto (los logos que llegaron eran capturas de baja calidad). Sobre la
          superficie neutra, como las demás secciones: la separan el filete y el espacio, no un bloque de color. */}
      <section aria-labelledby="marcas-titulo" className="container-x mt-20 sm:mt-28">
        <div className="rule pt-4">
          <RevealHeading as="h2" id="marcas-titulo" className="max-w-3xl font-display text-display-lg">
            {EVENTS.sponsorsTitle}
          </RevealHeading>
        </div>

        <SponsorList names={SPONSORS} className="mt-8 sm:mt-10" />

        <div className="rule-soft mt-12 grid gap-2 pt-5 sm:mt-16 sm:grid-cols-[14rem_minmax(0,1fr)] sm:gap-10">
          <h3 className="text-body-sm font-medium">Lugares que nos abrieron sus puertas</h3>
          <p className="text-body-sm leading-relaxed text-ink-muted sm:text-base">{VENUES.join(" · ")}</p>
        </div>

        {brands && (
          <div className="rule-soft mt-8 grid gap-4 pt-5 sm:grid-cols-[14rem_minmax(0,1fr)_auto] sm:items-center sm:gap-10">
            <h3 className="text-body-sm font-medium">{brands.title}</h3>
            <p className="max-w-xl text-body-sm leading-relaxed text-ink-muted sm:text-base">{brands.description}</p>
            <ButtonLink href="/corporativo#cotizar" variant="outline" className="w-full sm:w-auto">
              {CORPORATE.cta}
            </ButtonLink>
          </div>
        )}
      </section>
    </>
  );
}
