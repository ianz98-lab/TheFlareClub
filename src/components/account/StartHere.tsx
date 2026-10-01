"use client";

import Link from "next/link";
import { HOME, ROUTINE } from "@/content/site";
import { PRESETS } from "@/lib/routine";
import { PortalSection, SubHeading } from "./portal-ui";
import { RoutineRow, useStartRoutine } from "./RoutinesPanel";

/** Tres atajos de "¿Qué necesitas hoy?" (el de la rutina de una hora ya está entre las predeterminadas). */
const NEEDS = HOME.need.options.filter((o) => !o.href.startsWith("/rutina")).slice(0, 3);

/**
 * "Empieza aquí" para una cuenta nueva (sin actividad, rutinas ni compras), en lugar de una fila de
 * estados vacíos (A016): las rutinas predeterminadas se empiezan desde aquí y los atajos llevan a
 * Movement y Meditaciones ya filtrados. Textos del documento (HOME.need, ROUTINE).
 */
export function StartHere() {
  const start = useStartRoutine();
  return (
    <PortalSection id="empieza" eyebrow={HOME.need.eyebrow} title={HOME.need.title} description={HOME.need.description}>
      <div className="grid gap-x-16 gap-y-12 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
        <ul className="border-t border-line">
          {NEEDS.map((n) => (
            <li key={n.href}>
              <Link
                href={n.href}
                className="group flex min-h-16 items-center justify-between gap-4 border-b border-line py-4 font-display text-display-md transition-colors hover:text-accent-ink active:text-accent-ink"
              >
                {n.label}
                <span aria-hidden="true" className="shrink-0 font-sans text-body-sm text-ink-muted motion-safe:transition-transform motion-safe:group-hover:translate-x-1">
                  →
                </span>
              </Link>
            </li>
          ))}
        </ul>

        <div>
          <SubHeading first>{ROUTINE.presetsTitle}</SubHeading>
          <ul className="border-t border-line">
            {PRESETS.map((p) => (
              <RoutineRow key={p.id} r={p} tag={p.kicker} onStart={start} />
            ))}
          </ul>
          <Link href="/rutina" className="link-action mt-3">
            {ROUTINE.cta}
          </Link>
        </div>
      </div>
    </PortalSection>
  );
}
