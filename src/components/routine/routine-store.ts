import { readLocal, writeLocal } from "@/lib/local-store";
import { ROUTINE_KEYS, totalMinutes, type Routine } from "@/lib/routine";

/*
 * Rutinas en este navegador, compartido por el constructor y el player (sin cargar uno en el otro).
 * - "Tus rutinas": ROUTINE_KEYS.saved, como máximo MAX_SAVED, la última guardada primero.
 * - La rutina en curso (ROUTINE_KEYS.current) lleva además `step`, el paso donde va, y `seen`, los
 *   pasos que ya terminó: así salir o recargar no la devuelve al paso 1 ni le borra lo que vio. Quien
 *   escribe una rutina nueva en `current` (Empezar) la escribe sin los dos y arranca desde el principio.
 */

/** Rutina en reproducción: la de ROUTINE_KEYS.current más el paso donde va (0 = el primero) y los pasos ya vistos. */
export type PlayingRoutine = Routine & { step?: number; seen?: number[] };

export const MAX_SAVED = 12;
const NONE: Routine[] = [];

/**
 * Guarda una rutina en "Tus rutinas" (si ya estaba, la actualiza y la sube al principio). Sin nombre,
 * conserva el suyo o usa "Rutina N min". Devuelve la rutina tal como quedó guardada.
 */
export function saveRoutine(r: Routine, name = ""): Routine {
  const saved: Routine = {
    id: r.id,
    name: name.trim() || r.name || `Rutina ${totalMinutes(r)} min`,
    warmup: r.warmup,
    classes: [...r.classes],
    stretch: r.stretch,
    close: r.close,
    createdAt: Date.now(),
  };
  const list = readLocal<Routine[]>(ROUTINE_KEYS.saved, NONE).filter((x) => x.id !== saved.id);
  writeLocal(ROUTINE_KEYS.saved, [saved, ...list].slice(0, MAX_SAVED));
  return saved;
}

/** Paso guardado de la rutina en curso, si sigue existiendo en su cola (`length` videos); si no, 0. */
export function resumeStep(r: PlayingRoutine | null, length: number): number {
  const step = r?.step ?? 0;
  return Number.isInteger(step) && step > 0 && step < length ? step : 0;
}

/** Posiciones de la cola (`length` videos) que ya terminó en esta vuelta: "Visto" en la cola y el conteo del cierre. */
export function seenSteps(r: PlayingRoutine | null, length: number): number[] {
  const seen = Array.isArray(r?.seen) ? r.seen : [];
  return seen.filter((i) => Number.isInteger(i) && i >= 0 && i < length);
}

/**
 * Anota en qué paso va la rutina en curso y qué pasos ya terminó, en una sola escritura. Paso 0 y sin
 * vistos la deja limpia: la próxima vez empieza desde el principio.
 */
export function savePosition(r: PlayingRoutine, step: number, seen: readonly number[] = []) {
  writeLocal<PlayingRoutine>(ROUTINE_KEYS.current, { ...r, step: step > 0 ? step : undefined, seen: seen.length ? [...seen] : undefined });
}
