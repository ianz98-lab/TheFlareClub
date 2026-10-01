"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { ROUTINE } from "@/content/site";
import { useLocal, writeLocal } from "@/lib/local-store";
import { describeRoutine, presetHref, presetLabel } from "@/lib/movement";
import { PRESETS, ROUTINE_KEYS, toQueue, totalMinutes, type Routine } from "@/lib/routine";
import { EmptyState, PortalSection, SubHeading } from "./portal-ui";

const NONE: Routine[] = [];

export type RoutineRowData = { r: Routine; tag?: string };

/** Rutinas guardadas en el constructor (/rutina) y la última que hizo, solo las que se pueden reproducir. */
export function useRoutineRows(): RoutineRowData[] {
  const saved = useLocal<Routine[]>(ROUTINE_KEYS.saved, NONE);
  const last = useLocal<Routine | null>(ROUTINE_KEYS.last, null);
  // Solo rutinas que todavía se pueden reproducir (contenido existente).
  const playable = saved.filter((r) => toQueue(r).length > 0);
  const showLast = last && toQueue(last).length > 0 && !playable.some((r) => r.id === last.id) ? last : null;
  return [...(showLast ? [{ r: showLast, tag: "La última que hiciste" }] : []), ...playable.map((r) => ({ r }))];
}

/** Empezar una rutina: la deja como actual y última, y abre el reproductor. */
export function useStartRoutine() {
  const router = useRouter();
  return (r: Routine) => {
    writeLocal(ROUTINE_KEYS.current, r);
    writeLocal(ROUTINE_KEYS.last, r);
    router.push("/rutina/reproducir");
  };
}

/**
 * Fila de una rutina con "Empezar" (Tus rutinas y "Empieza aquí"). El botón va en contorno: en una
 * lista de rutinas, un "Empezar" terracota por fila llenaría la pantalla de acento (D2-C).
 */
export function RoutineRow({ r, tag, onStart }: { r: Routine; tag?: string; onStart: (r: Routine) => void }) {
  const min = totalMinutes(r);
  const name = r.name || `Rutina de ${min} min`;
  return (
    <li className="flex flex-col gap-3 border-b border-line py-5 sm:flex-row sm:items-center sm:justify-between sm:gap-8">
      <div className="min-w-0">
        {tag && <p className="label mb-1.5 text-ink-muted">{tag}</p>}
        <p className="font-display text-display-sm">{name}</p>
        <p className="mt-1.5 text-sm text-ink-muted">
          {min} min · {describeRoutine(r)}
        </p>
      </div>
      <Button variant="outline" onClick={() => onStart(r)} className="shrink-0 self-start sm:self-auto" aria-label={`Empezar ${name}`}>
        Empezar
      </Button>
    </li>
  );
}

/** Tus rutinas: las guardadas en el constructor y la última que hizo, más los accesos a las predeterminadas. */
export function RoutinesPanel({ rows }: { rows: RoutineRowData[] }) {
  const start = useStartRoutine();

  // "Arma tu rutina" una sola vez: el link del encabezado (visible también en móvil).
  return (
    <PortalSection id="rutinas" title="Tus rutinas" href="/rutina" linkLabel={ROUTINE.cta}>
      {rows.length ? (
        <ul className="border-t border-line">
          {rows.map(({ r, tag }) => (
            <RoutineRow key={`${tag ?? "g"}-${r.id}`} r={r} tag={tag} onStart={start} />
          ))}
        </ul>
      ) : (
        <EmptyState text="Aún no guardas rutinas. Arma una en segundos y guárdala para repetirla cuando quieras." />
      )}

      {/* Accesos a las predeterminadas: abren el constructor con la rutina cargada */}
      <SubHeading>{ROUTINE.presetsTitle}</SubHeading>
      <ul className="grid grid-cols-2 border-l border-t border-line lg:grid-cols-4">
        {PRESETS.map((p) => (
          <li key={p.id} className="border-b border-r border-line">
            <Link
              href={presetHref(p)}
              className="group flex h-full min-h-28 flex-col justify-between gap-4 p-4 transition-colors duration-(--duration-fast) hover:bg-surface-alt active:bg-surface-alt sm:p-5"
            >
              <span className="label text-ink-muted">{presetLabel(p)}</span>
              <span className="font-display text-display-sm transition-colors group-hover:text-accent-ink">{p.name}</span>
            </Link>
          </li>
        ))}
      </ul>
    </PortalSection>
  );
}
