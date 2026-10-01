import Image from "next/image";
import Link from "next/link";
import { TicketHint, UntilEventEnds } from "@/components/events/EventTicket";
import { ButtonAnchor, ButtonLink } from "@/components/ui/Button";
import { eventEndMs, isEventOver } from "@/content/events";
import { EVENTS } from "@/content/site";
import type { FlareEvent } from "@/content/types";
import { dateParts, formatDate, formatPrice, formatTimeRange } from "@/lib/format";

const sameDay = (a: string, b: string) => formatDate(a, { year: "numeric" }) === formatDate(b, { year: "numeric" });
const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

/**
 * Horario en hora de Guatemala: "6 a 9 p. m." (solo el inicio si no hay hora de fin o si termina
 * otro día). En minúscula: mostrarlo fuera de `.label`, que lo volvería "P. M.".
 */
export function eventTime(e: FlareEvent): string {
  const end = e.endsAt && sameDay(e.startsAt, e.endsAt) ? e.endsAt : undefined;
  return formatTimeRange(e.startsAt, end);
}

/** "Jueves 8 de octubre" — `dateLabel` la reemplaza si el día aún no está confirmado. */
function eventDay(e: FlareEvent): string {
  const d = dateParts(e.startsAt);
  return e.dateLabel ?? capitalize(`${d.weekday} ${d.day} de ${d.month}`);
}

/**
 * Tarjeta tipográfica para eventos sin flyer (save the date): la fecha en grande sobre un
 * bloque neutro, como una tarjeta impresa. El día va en el acento (es la fecha destacada y el
 * único calor de un bloque sin foto); mes y año en tinta. El tamaño se ajusta al ancho del
 * bloque (unidades cqw). Es decorativa: la fecha real siempre va en texto junto a ella.
 */
export function EventDatePanel({ e, className = "" }: { e: FlareEvent; className?: string }) {
  const d = dateParts(e.startsAt);
  return (
    <div aria-hidden="true" className={`@container overflow-hidden rounded-media bg-surface-alt ${className}`}>
      <div className="flex aspect-[4/5] flex-col justify-between p-[length:8cqw]">
        <span className="text-[length:max(11px,4.5cqw)] font-medium uppercase tracking-[0.14em] text-ink-muted">{d.year}</span>
        <span>
          <span className="block font-display text-[length:54cqw] leading-[0.8] tracking-[-0.02em] text-accent">{d.day}</span>
          <span className="mt-[length:4cqw] block font-display text-[length:13cqw] leading-none">{d.month}</span>
        </span>
      </div>
    </div>
  );
}

/** Flyer entero (sin recortar: respeta su proporción 4:5 o 9:16) o, si no hay, la tarjeta tipográfica. */
function EventMedia({ e, sizes }: { e: FlareEvent; sizes: string }) {
  if (!e.cover) return <EventDatePanel e={e} />;
  return (
    <div
      className="card-media relative overflow-hidden rounded-media bg-surface-alt"
      style={{ aspectRatio: `${e.cover.width} / ${e.cover.height}` }}
    >
      <Image
        src={e.cover.src}
        alt=""
        fill
        sizes={sizes}
        className="object-cover"
        style={e.cover.focal ? { objectPosition: e.cover.focal } : undefined}
      />
    </div>
  );
}

/**
 * Precio + CTA. El de compra es un <a> externo a Recurrente, separado del link al detalle.
 * Si el evento terminó después de generar el sitio, el navegador cambia precio y CTA por un aviso.
 */
function EventActions({ e, href }: { e: FlareEvent; href: string }) {
  if (isEventOver(e)) {
    const n = e.gallery?.length ?? 0;
    return (
      <Link href={n ? `${href}#galeria` : href} className="link-action">
        {n ? (
          <span>
            Ver galería <span className="whitespace-nowrap">· {n} fotos</span>
          </span>
        ) : (
          "Ver detalles"
        )}
      </Link>
    );
  }

  let cta = null;
  let buying = false;
  if (e.status === "soldout") {
    cta = <p className="label text-accent-ink">Agotado</p>;
  } else if (e.waitlist) {
    cta = (
      <ButtonLink href={`${href}#lista-espera`} variant="outline" size="lg" className="w-full @sm:w-auto">
        {EVENTS.waitlist}
      </ButtonLink>
    );
  } else if (e.ticketUrl) {
    buying = true;
    cta = (
      <ButtonAnchor href={e.ticketUrl} external size="lg" className="w-full @sm:w-auto">
        {EVENTS.buy}
      </ButtonAnchor>
    );
  }

  return (
    <div className="flex flex-col gap-3 @sm:flex-row @sm:flex-wrap @sm:items-center @sm:gap-x-6">
      <UntilEventEnds endMs={eventEndMs(e)} after={<p className="text-body-sm text-ink-muted">Este evento ya pasó.</p>}>
        {/* Dato en Hanken con cifras tabulares (docs/04-marca.md); el acento lo lleva el botón de al lado */}
        {e.price != null && (
          <p className="flex items-baseline gap-3">
            <span className="label text-ink-muted">Entrada</span>
            <span className="text-2xl font-medium leading-none tabular-nums">{formatPrice(e.price, e.currency)}</span>
          </p>
        )}
        {cta}
        {/* Aviso de Recurrente y del correo justo bajo el botón (en fila, en su propia línea) */}
        {buying && <TicketHint className="@sm:basis-full" />}
      </UntilEventEnds>
      <Link href={href} className="link-action self-start @sm:self-auto">
        Ver detalles
      </Link>
    </div>
  );
}

/**
 * Tarjeta de evento. Se adapta al ancho de su contenedor (container queries), no al de la pantalla:
 * angosta (celular, columna de Inicio) = flyer chico al lado de la info y el botón a todo el ancho;
 * ancha = columna imagen | info. Los links no se anidan: imagen y título llevan al detalle, el CTA
 * de compra es un link aparte a Recurrente.
 */
export function EventCard({ e }: { e: FlareEvent }) {
  const href = `/eventos/${e.slug}`;

  return (
    <article className="@container rule-soft pt-5">
      <div className="grid grid-cols-[minmax(0,5fr)_minmax(0,7fr)] gap-x-4 gap-y-5 @lg:grid-cols-[minmax(0,13rem)_minmax(0,1fr)] @lg:grid-rows-[auto_1fr] @lg:gap-x-8 @2xl:grid-cols-[minmax(0,15rem)_minmax(0,1fr)] @3xl:grid-cols-[minmax(0,18rem)_minmax(0,1fr)] @3xl:gap-x-12">
        {/* Duplica el link del título: fuera del orden de tabulación y del lector de pantalla */}
        <Link href={href} tabIndex={-1} aria-hidden="true" className="group block self-start @lg:row-span-2">
          <EventMedia e={e} sizes="(min-width: 1024px) 288px, 40vw" />
        </Link>

        <div className="min-w-0">
          {/* Fecha y hora en minúscula (en versalitas la hora salía "P. M. A"). Angosta: una línea cada una,
              así la hora no se parte ("· 6 / a 9 p. m."); ancha: en la misma línea. Si la tarjeta mide menos
              de 18 rem (letra agrandada) la hora sí puede partirse antes de la "a": sin eso desbordaba la
              página. Es consulta de contenedor y no narrow:, porque responde también a html{font-size}. */}
          <p className="text-sm font-medium">
            <span className="block @lg:inline">{eventDay(e)}</span>{" "}
            <span aria-hidden="true" className="hidden @lg:inline">
              ·{" "}
            </span>
            <span className="block whitespace-nowrap @max-2xs:whitespace-normal @lg:inline">{eventTime(e)}</span>
          </p>
          {/* Un escalón bajo el H2 de la sección (display-lg), también en columnas anchas */}
          <h3 className="mt-2 font-display text-display-md">
            <Link href={href} className="transition-colors hover:text-accent-ink">
              {e.title}
            </Link>
          </h3>
          {e.subtitle && <p className="mt-2 text-sm leading-snug text-ink-muted @lg:text-body-sm">{e.subtitle}</p>}
          <p className="mt-3 hidden max-w-md text-body-sm leading-relaxed text-ink-muted @lg:block">{e.description}</p>
          <p className="mt-3 text-sm text-ink-muted">{e.area ?? e.location}</p>
        </div>

        <div className="col-span-2 @lg:col-span-1 @lg:col-start-2">
          <EventActions e={e} href={href} />
        </div>
      </div>
    </article>
  );
}
