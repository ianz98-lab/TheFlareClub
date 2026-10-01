import type { Metadata } from "next";
import type { CSSProperties } from "react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { EventDatePanel, eventTime } from "@/components/cards/EventCard";
import { TICKET_COPY } from "@/components/events/copy";
import { TicketNote, UntilEventEnds } from "@/components/events/EventTicket";
import { LeadForm } from "@/components/forms/LeadForm";
import { EventGallery, GalleryLead, GalleryProvider } from "@/components/gallery/EventGallery";
import { RevealHeading } from "@/components/motion/Reveal";
import { ButtonAnchor } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { eventBySlug, eventEndMs, events, isEventOver } from "@/content/events";
import { EVENT_GALLERIES } from "@/content/media";
import { EVENTS } from "@/content/site";
import type { FlareEvent } from "@/content/types";
import { formatDate, formatDateLong, formatPrice } from "@/lib/format";
import { pageMetadata } from "@/lib/seo";

export async function generateStaticParams() {
  return events.map((e) => ({ slug: e.slug }));
}

/** Vista previa al compartir un evento sin flyer ni galería (Legado del Bosque): una foto de un evento anterior. */
const SHARE_FALLBACK = EVENT_GALLERIES["pilates-charms-sep-2026"]?.[0];

export async function generateMetadata({ params }: PageProps<"/eventos/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const e = eventBySlug(slug);
  if (!e) return { title: "Evento" };
  return pageMetadata({
    title: e.title,
    description: e.description,
    path: `/eventos/${e.slug}`,
    image: e.cover ?? e.gallery?.[0] ?? SHARE_FALLBACK,
  });
}

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

/** Evento anterior / siguiente en la línea de tiempo (todos los eventos, del más viejo al más nuevo). */
function NeighborLink({ e, dir }: { e: FlareEvent; dir: "prev" | "next" }) {
  return (
    <Link href={`/eventos/${e.slug}`} className="group block py-2">
      <span className="text-sm font-medium text-ink-muted">{dir === "prev" ? "← Anterior" : "Siguiente →"}</span>
      <span className="mt-2 block font-display text-display-sm text-balance transition-colors group-hover:text-accent-ink sm:text-display-md">
        {e.title}
      </span>
      <span className="mt-1 block text-sm text-ink-muted">{formatDate(e.startsAt, { weekday: undefined, year: "numeric" })}</span>
    </Link>
  );
}

export default async function EventPage({ params }: PageProps<"/eventos/[slug]">) {
  const { slug } = await params;
  const e = eventBySlug(slug);
  if (!e) notFound();

  // Pasado según la fecha (a la hora de la build); en el navegador UntilEventEnds lo vuelve a revisar.
  const isPast = isEventOver(e);
  const endMs = eventEndMs(e);
  const gallery = isPast ? (e.gallery ?? []) : [];
  const onSale = !isPast && e.status !== "soldout" && !e.waitlist && Boolean(e.ticketUrl);
  // En celular el flyer solo acompaña a los próximos: en los pasados, la primera foto de la galería va
  // arriba del título (GalleryLead) y sin flyer la fecha en grande repetiría la de la ficha.
  const flyerOnMobile = Boolean(e.cover) && !isPast;
  const endedNote = <p className="mt-8 text-body-sm text-ink-muted">Este evento ya pasó.</p>;
  const buyLabel = e.price != null ? `${EVENTS.buy} · ${formatPrice(e.price, e.currency)}` : EVENTS.buy;

  const timeline = [...events].sort((a, b) => a.startsAt.localeCompare(b.startsAt));
  const at = timeline.findIndex((x) => x.id === e.id);
  const prev = at > 0 ? timeline[at - 1] : undefined;
  const next = at < timeline.length - 1 ? timeline[at + 1] : undefined;

  // Si el día no está confirmado, `dateLabel` reemplaza solo la fecha; el horario sale de startsAt/endsAt.
  const facts: { label: string; value: string }[] = [
    { label: "Fecha", value: e.dateLabel ?? capitalize(formatDateLong(e.startsAt)) },
    { label: "Horario", value: eventTime(e) },
    { label: "Lugar", value: e.location },
    ...(e.guest ? [{ label: "Invitada especial", value: e.guest }] : []),
    ...(!isPast && e.price != null ? [{ label: "Entrada", value: formatPrice(e.price, e.currency) }] : []),
  ];

  // En los próximos, la descripción sigue a la compra; en los pasados va antes de la ficha, que pasa a segundo plano.
  const description = !e.waitlist && (
    <p className="mt-6 max-w-xl text-body-sm leading-relaxed text-ink-muted sm:text-base">{e.description}</p>
  );

  const article = (
    <article>
      <div className="container-x pt-4 sm:pt-8">
        <Link href="/eventos" className="link-action text-ink-muted">
          <Icon name="arrow-left" size={16} />
          Eventos
        </Link>

        <div className="mt-4 grid grid-cols-[minmax(0,1fr)] gap-10 md:mt-6 md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] md:gap-12 lg:gap-16">
          {/* Info primero en el DOM (y en celular); en desktop va a la derecha del flyer */}
          <div className="md:col-start-2 md:row-start-1">
            {gallery.length > 0 && <GalleryLead className="-mx-(--gutter) mb-8 w-[calc(100%+2*var(--gutter))] md:hidden" />}

            {/* Primer pantallazo: entra con CSS, sin esperar al JavaScript (es el LCP) */}
            <div className="hero-in">
              {/* Estado: "Próximo evento" en el acento (pide atención); "Evento anterior", en tinta secundaria */}
              <p className="label text-ink-muted">
                {isPast ? (
                  "Evento anterior"
                ) : (
                  <UntilEventEnds endMs={endMs} after="Evento anterior">
                    <span className="text-accent-ink">Próximo evento</span>
                  </UntilEventEnds>
                )}
              </p>
              <h1 className="mt-3 font-display text-display-xl">{e.title}</h1>
              {e.subtitle && <p className="mt-4 max-w-xl text-lg leading-snug text-ink-muted sm:text-xl">{e.subtitle}</p>}
            </div>

            {isPast && description}

            {/* Si la ficha mide menos de 16 rem (letra agrandada o pantalla de 280 px) la etiqueta va arriba del
                dato: la columna fija de 7.5 rem dejaba al dato sin ancho y la fecha desbordaba la página */}
            <dl className="@container mt-8 border-t border-line">
              {facts.map((f) => (
                <div
                  key={f.label}
                  className="grid grid-cols-[7.5rem_minmax(0,1fr)] gap-4 border-b border-line py-3.5 sm:grid-cols-[9rem_minmax(0,1fr)] @max-[16rem]:grid-cols-[minmax(0,1fr)] @max-[16rem]:gap-1"
                >
                  <dt className="label pt-[3px] text-ink-muted">{f.label}</dt>
                  {/* text-pretty: el año no queda solo en la segunda línea ("…de septiembre de / 2026") */}
                  <dd className="text-body-sm text-pretty sm:text-base">{f.value}</dd>
                </div>
              ))}
            </dl>

            {/* Compra o lista de espera justo después de la ficha: en celular queda a la vista */}
            {onSale && e.ticketUrl && (
              <UntilEventEnds endMs={endMs} after={endedNote}>
                <div className="mt-8">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-6">
                    <ButtonAnchor href={e.ticketUrl} external size="lg" className="w-full sm:w-auto">
                      {EVENTS.buy}
                    </ButtonAnchor>
                    <p className="text-sm leading-snug text-ink-muted">{TICKET_COPY.newTab}</p>
                  </div>
                  {/* La entrada se asocia a la cuenta por correo */}
                  <TicketNote slug={e.slug} className="mt-3 max-w-md" />
                </div>
              </UntilEventEnds>
            )}

            {!isPast && e.status === "soldout" && (
              <UntilEventEnds endMs={endMs} after={endedNote}>
                <p className="label mt-8 text-accent-ink">Agotado</p>
              </UntilEventEnds>
            )}

            {!isPast && e.waitlist && (
              <UntilEventEnds endMs={endMs} after={endedNote}>
                {/* Formulario destacado: el único bloque que se separa del fondo */}
                <section id="lista-espera" aria-labelledby="lista-espera-titulo" className="mt-8 rounded-media bg-surface-alt p-5 sm:p-8">
                  <h2 id="lista-espera-titulo" className="font-display text-display-md">
                    {EVENTS.waitlist}
                  </h2>
                  <p className="mt-2 max-w-lg text-body-sm leading-relaxed text-ink-muted">{e.description}</p>
                  <LeadForm kind="lista-espera-evento" source={e.slug} cta={EVENTS.waitlist} done={EVENTS.waitlistDone} className="mt-6" />
                </section>
              </UntilEventEnds>
            )}

            {!isPast && description}

            {/* Lo que incluye no es una secuencia: lista con filetes, sin numerar */}
            {e.includes.length > 0 && (
              <div className="mt-10">
                <h2 className="text-body-sm font-medium text-ink-muted">Qué incluye</h2>
                <ul className="mt-3 border-t border-line">
                  {e.includes.map((item) => (
                    <li key={item} className="border-b border-line py-3 font-display text-display-md">
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* En un evento pasado, ver las fotos es la acción principal: el único acento de la ficha */}
            {gallery.length > 0 && (
              <a href="#galeria" className="link-action mt-8 text-accent-ink">
                <span>
                  Ver galería <span className="whitespace-nowrap">· {gallery.length} fotos</span>
                </span>
                <span aria-hidden="true">↓</span>
              </a>
            )}
          </div>

          {/* Flyer entero, sin recortar (story 9:16 o post 4:5); sin flyer, la fecha en grande (solo desktop) */}
          <div className={`md:col-start-1 md:row-start-1 ${flyerOnMobile ? "" : "hidden md:block"}`}>
            {/* Fijo bajo el header a 1.5rem; sube con el header cuando se oculta */}
            <div className="md:sticky-aside [--sticky-offset:1.5rem]">
              {e.cover ? (
                <Image
                  src={e.cover.src}
                  alt={e.cover.alt ?? `Flyer de ${e.title}`}
                  width={e.cover.width}
                  height={e.cover.height}
                  sizes="(min-width: 768px) 40vw, (min-width: 460px) 420px, calc(100vw - 2.5rem)"
                  // Se precarga solo si se ve en celular (eventos próximos). En los pasados está oculto ahí
                  // y queda diferido: así el celular no lo descarga y en desktop carga al aparecer.
                  preload={flyerOnMobile}
                  // La caja mide lo mismo antes y después de cargar (sin salto de layout): el ancho sale de la
                  // columna, del ancho real y del alto que deja la pantalla (100svh menos header y 1.5rem arriba
                  // y abajo), y el alto, de la proporción. Antes, en desktop, era w-auto con max-h: sin la foto
                  // cargada la caja medía 0 y al llegar empujaba la página (CLS 0.025 en los eventos pasados).
                  style={
                    {
                      aspectRatio: `${e.cover.width} / ${e.cover.height}`,
                      "--flyer-w": `${e.cover.width}px`,
                      "--flyer-r": e.cover.width / e.cover.height,
                    } as CSSProperties
                  }
                  className="h-auto w-full max-w-[420px] rounded-media md:ml-auto md:w-[min(100%,var(--flyer-w),calc((100svh-var(--header-h)-3rem)*var(--flyer-r)))] md:max-w-none"
                />
              ) : (
                <EventDatePanel e={e} className="w-full max-w-[420px] md:ml-auto" />
              )}

              {/* Celular: el flyer es largo; al terminar de verlo, la compra vuelve a estar a mano */}
              {onSale && e.ticketUrl && flyerOnMobile && (
                <UntilEventEnds endMs={endMs}>
                  <ButtonAnchor href={e.ticketUrl} external size="lg" className="mt-6 w-full max-w-[420px] md:hidden">
                    {buyLabel}
                  </ButtonAnchor>
                </UntilEventEnds>
              )}
            </div>
          </div>
        </div>
      </div>

      {gallery.length > 0 && (
        <section id="galeria" aria-labelledby="galeria-titulo" className="container-x mt-16 sm:mt-24">
          <div className="rule mb-6 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 pt-4">
            <RevealHeading as="h2" id="galeria-titulo" className="font-display text-display-lg">
              Galería
            </RevealHeading>
            <p className="text-sm text-ink-muted">
              {gallery.length} fotos · Toca una para verla en grande
            </p>
          </div>
          <EventGallery />
        </section>
      )}
    </article>
  );

  return (
    <>
      {gallery.length > 0 ? (
        <GalleryProvider photos={gallery} title={e.title}>
          {article}
        </GalleryProvider>
      ) : (
        article
      )}

      {(prev || next) && (
        <nav aria-label="Otros eventos" className="container-x mt-20 sm:mt-28">
          <div className="rule grid grid-cols-2 gap-6 pt-4">
            <div>{prev && <NeighborLink e={prev} dir="prev" />}</div>
            <div className="text-right">{next && <NeighborLink e={next} dir="next" />}</div>
          </div>
        </nav>
      )}
    </>
  );
}
