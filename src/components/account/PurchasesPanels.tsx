"use client";

import Link from "next/link";
import { Row } from "@/components/Row";
import { CourseCard } from "@/components/cards/CourseCard";
import { courseBySlug } from "@/content/courses";
import { eventBySlug } from "@/content/events";
import type { Course, FlareEvent } from "@/content/types";
import { formatDate, formatDateLong, formatTimeRange, toDate } from "@/lib/format";
import type { Purchase } from "@/lib/user-data";
import { EmptyState, PortalSection } from "./portal-ui";

/*
 * Compras en Mi cuenta. Las listas se calculan en el portal (AccountView), que decide qué secciones
 * mostrar: Tus eventos solo con alguna entrada, Tus cursos solo si los cursos abrieron o compró uno.
 */

/** Compras de un tipo (`course:<slug>`, `event:<slug>`) sin repetir y solo si el contenido existe. */
function owned<T>(purchases: Purchase[], prefix: string, find: (slug: string) => T | undefined): T[] {
  const seen = new Set<string>();
  const out: T[] = [];
  for (const p of purchases) {
    if (!p.itemKey.startsWith(prefix)) continue;
    const slug = p.itemKey.slice(prefix.length);
    if (seen.has(slug)) continue;
    seen.add(slug);
    const item = find(slug);
    if (item) out.push(item);
  }
  return out;
}

/** Ya pasó (por fecha, no solo por el estado escrito en la semilla). */
const isPastEvent = (e: FlareEvent) => e.status === "past" || toDate(e.endsAt ?? e.startsAt).getTime() < Date.now();

export const ownedCourses = (purchases: Purchase[]): Course[] => owned(purchases, "course:", courseBySlug);

/** Primero los que vienen (del más cercano), luego los pasados (del más reciente). */
export function ownedEvents(purchases: Purchase[]): FlareEvent[] {
  const mine = owned(purchases, "event:", eventBySlug);
  const upcoming = mine.filter((e) => !isPastEvent(e)).sort((a, b) => a.startsAt.localeCompare(b.startsAt));
  const past = mine.filter(isPastEvent).sort((a, b) => b.startsAt.localeCompare(a.startsAt));
  return [...upcoming, ...past];
}

/** "sábado 22 de noviembre de 2026 · 6 a 9 p. m." (`dateLabel` reemplaza solo la fecha). */
function eventWhen(e: FlareEvent): string {
  return `${e.dateLabel ?? formatDateLong(e.startsAt)} · ${formatTimeRange(e.startsAt, e.endsAt)}`;
}

/* ---------------- Tus cursos ---------------- */

export function MyCourses({ courses }: { courses: Course[] }) {
  return (
    <PortalSection id="cursos" title="Tus cursos" description="Los cursos se compran aparte de la membresía.">
      {courses.length ? (
        <Row cols="lg:grid-cols-3">
          {courses.map((c) => (
            <CourseCard key={c.id} c={c} size="row" />
          ))}
        </Row>
      ) : (
        <EmptyState text="Aún no tienes cursos." links={[{ href: "/cursos", label: "Ver cursos" }]} />
      )}
    </PortalSection>
  );
}

/* ---------------- Tus eventos ---------------- */

export function MyEvents({ events }: { events: FlareEvent[] }) {
  return (
    <PortalSection id="eventos" title="Tus eventos" description="Las entradas se compran aparte, en Recurrente, con el correo de tu cuenta.">
      <ul className="border-t border-line">
        {events.map((e) => {
          // Mes corto ("nov", "sept"): el nombre completo en versalitas no cabe en la columna de 4 rem del
          // celular. La fecha completa va en la línea de abajo.
          const day = formatDate(e.startsAt, { weekday: undefined, month: undefined });
          const month = formatDate(e.startsAt, { weekday: undefined, day: undefined }).replace(".", "");
          const isPast = isPastEvent(e);
          return (
            <li key={e.id} className="border-b border-line">
              <Link
                href={`/eventos/${e.slug}`}
                className="group grid grid-cols-[4rem_minmax(0,1fr)] items-start gap-4 py-5 sm:grid-cols-[6rem_minmax(0,1fr)_auto] sm:items-center sm:gap-8"
              >
                <p className={`text-center leading-none ${isPast ? "text-ink-muted" : ""}`}>
                  <span className="block font-display text-display-lg leading-none">{day}</span>
                  <span className="label mt-1.5 block">{month}</span>
                </p>
                <div className="min-w-0">
                  {/* "Próximo" es la fecha destacada de la lista: el único texto en el acento */}
                  <p className={`label ${isPast ? "text-ink-muted" : "text-accent-ink"}`}>{isPast ? "Ya pasó" : "Próximo"}</p>
                  <p className="mt-1.5 font-display text-display-md transition-colors group-hover:text-accent-ink">{e.title}</p>
                  <p className="mt-1 text-sm leading-relaxed text-ink-muted">
                    {eventWhen(e)}
                    <span className="block">{e.location}</span>
                  </p>
                </div>
                {/* Toda la fila es el enlace: esto solo lo señala en desktop */}
                <span aria-hidden="true" className="hidden text-body-sm font-medium underline decoration-1 underline-offset-4 sm:inline">
                  Ver evento
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </PortalSection>
  );
}
