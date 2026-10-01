"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { AnimatePresence } from "motion/react";
import * as m from "motion/react-m";
import { Button } from "@/components/ui/Button";
import { Chip, chipClass } from "@/components/ui/Chip";
import { Icon } from "@/components/ui/Icon";
import { LayoutMotion } from "@/components/motion/MotionProvider";
import { useBarHeight } from "@/components/finder/use-bar-height";
import { videoById } from "@/content/videos";
import { ROUTINE } from "@/content/site";
import { DURATIONS, FEELINGS, FOCUS, FOCUS_PRIMARY, labelOf, MEDITATION_DURATIONS } from "@/content/taxonomies";
import type { TagOption } from "@/content/types";
import { useAuth } from "@/lib/auth";
import { readLocal, useLocal, writeLocal } from "@/lib/local-store";
import { DUR, EASE_OUT, SPRING, prefersReducedMotion } from "@/lib/motion";
import { emptyRoutine, idsOf, isClass, poolFor, PRESETS, ROUTINE_KEYS, STEPS, toQueue, totalMinutes, withIds, type Routine, type RoutinePreset, type StepKey } from "@/lib/routine";
import { describeRoutine, presetLabel } from "@/lib/movement";
import { MAX_SAVED, resumeStep, saveRoutine, type PlayingRoutine } from "./routine-store";

const NONE: Routine[] = [];
const FIRST_STEP = STEPS[0].key;

/** 2 columnas en móvil (una bajo 22.5rem, como la variante narrow), 3 en md y 4 desde lg. */
const CARD_SIZES = "(min-width: 1408px) 320px, (min-width: 1024px) 23vw, (min-width: 768px) 31vw, (min-width: 22.5rem) 47vw, 100vw";

/** Copia editable de una rutina predeterminada: id nuevo, así guardarla nunca pisa la original. */
const fromPreset = (p: RoutinePreset): Routine => ({
  id: emptyRoutine().id,
  name: p.name,
  warmup: p.warmup,
  classes: [...p.classes],
  stretch: p.stretch,
  close: p.close,
  createdAt: Date.now(),
});

type Notice = {
  /** Texto completo: desde sm en la barra y siempre en la región aria-live */
  text: string;
  /** En el celular la barra muestra una línea: la versión corta (si no hay, se trunca `text`) */
  short?: string;
  undo?: Routine;
  /** Acción de texto a la derecha del aviso ("Ver" → Mi cuenta) */
  link?: { href: string; label: string; ariaLabel: string };
};

/**
 * Lee `?preset=<id>` (links desde Inicio y Movement) o `?last=1` ("Repetir o editar" al terminar una
 * rutina) y carga esa rutina en el constructor. Va aparte y en su propio Suspense para que el resto
 * del constructor se genere estático.
 */
function LoadFromUrl({ onPreset, onLast }: { onPreset: (p: RoutinePreset) => void; onLast: (r: Routine) => void }) {
  const params = useSearchParams();
  const presetId = params.get("preset");
  const last = params.get("last") === "1";
  const applied = useRef<string | null>(null);
  useEffect(() => {
    const key = presetId ? `preset:${presetId}` : last ? "last" : null;
    if (!key || applied.current === key) return;
    if (presetId) {
      const p = PRESETS.find((x) => x.id === presetId);
      if (!p) return;
      applied.current = key;
      onPreset(p);
      return;
    }
    applied.current = key;
    const r = readLocal<Routine | null>(ROUTINE_KEYS.last, null);
    if (r) onLast(r);
  }, [presetId, last, onPreset, onLast]);
  return null;
}

/**
 * Constructor de rutinas (herramienta de Movement). Rutinas predeterminadas listas para empezar,
 * las guardadas por la usuaria aparte ("Tus rutinas") y el armado paso a paso, del 01 al 04, con
 * filtros propios de cada paso. Nada de podcasts ni cursos aquí: las recomendaciones llegan al terminar.
 */
export function RoutineBuilder() {
  const router = useRouter();
  const { status } = useAuth();
  const saved = useLocal<Routine[]>(ROUTINE_KEYS.saved, NONE);
  const last = useLocal<Routine | null>(ROUTINE_KEYS.last, null);
  const inProgress = useLocal<PlayingRoutine | null>(ROUTINE_KEYS.current, null);
  const [routine, setRoutine] = useState<Routine>(emptyRoutine);
  /** id de la predeterminada o guardada que está cargada (para marcarla) */
  const [loadedFrom, setLoadedFrom] = useState<string | null>(null);
  const [step, setStep] = useState<StepKey>(FIRST_STEP);
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [name, setName] = useState("");
  const [notice, setNotice] = useState<Notice | null>(null);
  const builderRef = useRef<HTMLElement>(null);
  const stepHeading = useRef<HTMLHeadingElement>(null);
  const forwardRef = useRef<HTMLButtonElement>(null);
  /** Foco pendiente cuando el botón tocado desaparece (Anterior en el paso 02, Empezar de cero). */
  const focusAfter = useRef<"forward" | "step" | null>(null);

  const def = STEPS.find((s) => s.key === step)!;
  const stepPool = useMemo(() => poolFor(step), [step]);
  const pool = useMemo(() => {
    const dur = filters[`${step}:duration`];
    const focus = filters[`${step}:focus`];
    return stepPool.filter((x) => {
      if (dur && String(x.duration) !== dur) return false;
      if (focus && isClass(x) && !x.focus.includes(focus as never)) return false;
      return true;
    });
  }, [step, stepPool, filters]);

  const chosen = idsOf(routine, step);
  const total = totalMinutes(routine);
  const canStart = routine.classes.length > 0;
  const stepIndex = STEPS.findIndex((s) => s.key === step);
  const isLastStep = stepIndex === STEPS.length - 1;
  const atMax = def.max > 1 && chosen.length >= def.max;
  const sequence = STEPS.filter((s) => idsOf(routine, s.key).length)
    .map((s) => `${s.title}${s.key === "classes" && routine.classes.length > 1 ? ` ×${routine.classes.length}` : ""}`)
    .join("  →  ");

  // Rutina a medias en el player (salió antes de terminar): se puede retomar en su paso
  const inProgressLength = useMemo(() => (inProgress ? toQueue(inProgress).length : 0), [inProgress]);
  const resumeAt = resumeStep(inProgress, inProgressLength);

  // Solo se ofrecen filtros que devuelven algo en este paso
  const durSource: TagOption<number>[] = step === "close" ? MEDITATION_DURATIONS : DURATIONS;
  const durOptions = durSource.filter((d) => stepPool.some((x) => x.duration === d.value));
  const focusOptions = step === "close" ? [] : FOCUS.filter((f) => FOCUS_PRIMARY.includes(f.value) && stepPool.some((x) => isClass(x) && x.focus.includes(f.value)));

  // En móvil los cuatro pasos no caben: el activo se desplaza a la vista (solo la fila, no la página)
  const stepRow = useRef<HTMLOListElement>(null);
  useEffect(() => {
    const row = stepRow.current;
    const el = row?.querySelector<HTMLElement>('[aria-current="step"]');
    if (!row || !el) return;
    const r = row.getBoundingClientRect();
    const b = el.getBoundingClientRect();
    if (b.left >= r.left && b.right <= r.right) return;
    row.scrollBy({ left: b.left + b.width / 2 - (r.left + r.width / 2), behavior: prefersReducedMotion() ? "auto" : "smooth" });
  }, [step]);

  // Los avisos se van solos
  useEffect(() => {
    if (!notice) return;
    const t = setTimeout(() => setNotice(null), notice.undo || notice.link ? 8000 : 5000);
    return () => clearTimeout(t);
  }, [notice]);

  // Foco pendiente (después de que el paso nuevo ya está en pantalla)
  useEffect(() => {
    const target = focusAfter.current;
    if (!target) return;
    focusAfter.current = null;
    (target === "forward" ? forwardRef.current : stepHeading.current)?.focus({ preventScroll: true });
  });

  const toggle = (id: string) => {
    const cur = idsOf(routine, step);
    let next: string[];
    if (cur.includes(id)) next = cur.filter((x) => x !== id);
    else if (def.max === 1) next = [id];
    else next = cur.length >= def.max ? cur : [...cur, id];
    setRoutine(withIds(routine, step, next));
  };

  const scrollToBuilder = () => builderRef.current?.scrollIntoView({ behavior: prefersReducedMotion() ? "auto" : "smooth", block: "start" });

  const load = (r: Routine, from: string, notice: Notice, scroll: boolean) => {
    setRoutine(r);
    setLoadedFrom(from);
    setName("");
    setStep(FIRST_STEP);
    setNotice(notice);
    if (scroll) scrollToBuilder();
  };

  const loadPreset = (p: RoutinePreset, scroll = false) =>
    load(fromPreset(p), p.id, { text: `«${p.name}» lista (${totalMinutes(p)} min). Ajústala o dale Empezar.`, short: `Lista: ${p.name} · ${totalMinutes(p)} min` }, scroll);

  const loadLast = (r: Routine) =>
    load({ ...r, classes: [...r.classes] }, r.id, { text: `Tu última rutina está lista (${totalMinutes(r)} min). Ajústala o dale Empezar.`, short: `Lista: tu última rutina · ${totalMinutes(r)} min` }, false);

  const editSaved = (r: Routine) => load({ ...r, classes: [...r.classes] }, r.id, { text: `Editando «${r.name}». Al guardar se actualiza.`, short: `Editando «${r.name}»` }, true);

  const reset = () => {
    setRoutine(emptyRoutine());
    setLoadedFrom(null);
    setName("");
    setStep(FIRST_STEP);
    // "Empezar de cero" desaparece: el foco pasa al paso 01
    focusAfter.current = "step";
  };

  const goToStep = (key: StepKey) => {
    setStep(key);
    focusAfter.current = "step";
  };

  const goBack = () => {
    // En el paso 02, "Anterior" desaparece al volver al 01: el foco queda en el botón de avanzar
    if (stepIndex === 1) focusAfter.current = "forward";
    setStep(STEPS[stepIndex - 1].key);
  };

  /** Un solo botón para avanzar (no pierde el foco): Saltar / Siguiente y, en el paso 04, Listo, empezar. */
  const forward = () => {
    if (!isLastStep) setStep(STEPS[stepIndex + 1].key);
    else if (canStart) start(routine);
    else goToStep("classes");
  };
  const forwardLabel = !isLastStep ? (!chosen.length && def.optional ? "Saltar" : "Siguiente") : canStart ? "Listo, empezar" : "Elige una clase";

  const start = (r: Routine) => {
    // Sin `step`: una rutina que se empieza arranca en su primer video
    writeLocal(ROUTINE_KEYS.current, r);
    writeLocal(ROUTINE_KEYS.last, r);
    router.push("/rutina/reproducir");
  };

  const save = () => {
    if (!canStart) return;
    const r = saveRoutine(routine, name);
    setRoutine(r);
    setLoadedFrom(r.id);
    setName("");
    setNotice(
      status === "signed-in"
        ? { text: "Guardada. La encuentras en Mi cuenta.", short: "Guardada en Mi cuenta.", link: { href: "/cuenta#rutinas", label: "Ver", ariaLabel: "Ver Tus rutinas en Mi cuenta" } }
        : { text: "Guardada en Tus rutinas, en este dispositivo.", short: "Guardada en este dispositivo." },
    );
  };

  const remove = (r: Routine) => {
    writeLocal(ROUTINE_KEYS.saved, readLocal<Routine[]>(ROUTINE_KEYS.saved, NONE).filter((x) => x.id !== r.id));
    if (loadedFrom === r.id) setLoadedFrom(null);
    setNotice({ text: `Borraste «${r.name}».`, undo: r });
  };

  const undo = (r: Routine) => {
    const list = readLocal<Routine[]>(ROUTINE_KEYS.saved, NONE).filter((x) => x.id !== r.id);
    writeLocal(ROUTINE_KEYS.saved, [r, ...list].slice(0, MAX_SAVED));
    setNotice(null);
  };

  return (
    <div className="container-x pb-16 sm:pb-20">
      <Suspense fallback={null}>
        <LoadFromUrl onPreset={loadPreset} onLast={loadLast} />
      </Suspense>
      {/* Anuncia los avisos a lectores de pantalla (la región existe siempre) */}
      <p className="sr-only" aria-live="polite">
        {notice?.text ?? ""}
      </p>

      {/* ---------- Rutinas predeterminadas ---------- */}
      <section aria-labelledby="rutinas-predeterminadas" className="pt-10 sm:pt-14">
        <div className="flex flex-wrap items-baseline justify-between gap-x-6">
          <h2 id="rutinas-predeterminadas" className="min-w-0 font-display text-display-lg">
            {ROUTINE.presetsTitle}
          </h2>
          {(resumeAt > 0 || last) && (
            <div className="flex flex-wrap gap-x-6">
              {resumeAt > 0 && (
                <Link href="/rutina/reproducir" className="link-action text-accent-ink">
                  Seguir donde ibas · paso {resumeAt + 1} de {inProgressLength}
                </Link>
              )}
              {last && (
                <button type="button" onClick={() => start(last)} className="link-action text-ink">
                  Repetir la última · {totalMinutes(last)} min
                </button>
              )}
            </div>
          )}
        </div>
        <ul className="mt-4 grid grid-cols-[minmax(0,1fr)] gap-x-6 sm:grid-cols-2 lg:grid-cols-4">
          {PRESETS.map((p) => {
            const on = loadedFrom === p.id;
            return (
              // Cargada en el constructor: el filete pasa al acento y a 2 px (la sombra interior suma el
              // segundo px sin mover el contenido)
              <li key={p.id} className={`flex flex-col border-t py-5 ${on ? "border-accent shadow-[inset_0_1px_0_var(--color-accent)]" : "border-line-strong"}`}>
                <p className="label text-ink-muted">{presetLabel(p)}</p>
                <h3 className="mt-2 font-display text-display-md">{p.name}</h3>
                <p className="mt-2 text-body-sm leading-snug text-ink-muted">{p.blurb}</p>
                <p className="mt-2 text-sm text-ink-muted">{describeRoutine(p)}</p>
                <div className="mt-auto flex flex-wrap items-center gap-x-5 gap-y-1 pt-4">
                  <Button variant="outline" onClick={() => start(fromPreset(p))} aria-label={`Empezar ${p.name}`}>
                    Empezar
                  </Button>
                  {/* Ya cargada: el mismo lugar dice "Cargada abajo" (así la fila de botones no se parte y queda
                      a la altura de las otras) y solo baja al constructor: volver a cargarla perdería los cambios */}
                  <button
                    type="button"
                    onClick={() => (on ? scrollToBuilder() : loadPreset(p, true))}
                    aria-label={on ? `${p.name}: cargada abajo, ir al constructor` : `Personalizar ${p.name}`}
                    className={`link-action ${on ? "text-accent-ink" : "text-ink-muted"}`}
                  >
                    {on && <Icon name="check" size={14} />}
                    {on ? "Cargada abajo" : "Personalizar"}
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      </section>

      {/* ---------- Tus rutinas (guardadas en este navegador) ---------- */}
      {saved.length > 0 && (
        <section aria-labelledby="tus-rutinas" className="mt-12 sm:mt-16">
          <h2 id="tus-rutinas" className="font-display text-display-lg">
            Tus rutinas
          </h2>
          <ul className="mt-4 border-t border-line-strong">
            {saved.map((r) => {
              const on = loadedFrom === r.id;
              return (
                <li key={r.id} className="flex flex-col gap-2 border-b border-line py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
                  <div className="min-w-0">
                    <p className="font-display text-display-md">
                      {r.name}
                      {on && <span className="label ml-3 align-middle font-sans text-accent-ink">En edición</span>}
                    </p>
                    <p className="mt-1 text-sm text-ink-muted">
                      {describeRoutine(r)} · {totalMinutes(r)} min
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-wrap items-center gap-x-5">
                    <Button variant="outline" onClick={() => start(r)} aria-label={`Empezar ${r.name}`}>
                      Empezar
                    </Button>
                    <button type="button" onClick={() => editSaved(r)} aria-label={`Editar ${r.name}`} className="link-action text-ink-muted">
                      Editar
                    </button>
                    <button type="button" onClick={() => remove(r)} aria-label={`Borrar ${r.name}`} className="link-action text-ink-muted">
                      Borrar
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {/* ---------- Arma la tuya: paso a paso ---------- */}
      <section ref={builderRef} aria-labelledby="arma-la-tuya" className="mt-12 sm:mt-16">
        <div className="rule flex flex-wrap items-baseline justify-between gap-x-6 pt-4">
          <h2 id="arma-la-tuya" className="font-display text-display-lg">
            Arma la tuya
          </h2>
          {total > 0 && (
            <button type="button" onClick={reset} className="link-action text-ink-muted">
              Empezar de cero
            </button>
          )}
        </div>

        {/* Fila de pasos: a sangre en móvil; snap-none para que centrar el paso activo no salte */}
        <ol ref={stepRow} aria-label="Pasos de la rutina" className="scroll-row -mx-(--gutter) mt-4 snap-none gap-2 px-(--gutter) sm:-mx-1.5 sm:px-1.5">
          {STEPS.map((s, i) => {
            const n = idsOf(routine, s.key).length;
            const active = s.key === step;
            return (
              <li key={s.key}>
                <button
                  type="button"
                  onClick={() => setStep(s.key)}
                  aria-current={active ? "step" : undefined}
                  // relative: el sr-only de abajo queda contenido (y recortado) por el scroll de la fila;
                  // sin esto se posiciona contra la ventana y desborda la página en móvil
                  className={chipClass(active, "relative gap-2")}
                >
                  <span className={`tabular-nums ${active ? "text-on-dark-muted" : "text-ink-muted"}`}>0{i + 1}</span>
                  {s.title}
                  {n > 0 && <span className={active ? "text-accent-soft" : "text-accent-ink"}>{s.max > 1 ? `· ${n}` : <Icon name="check" size={14} />}</span>}
                  {n > 0 && <span className="sr-only">, {n === 1 ? "1 elegido" : `${n} elegidos`}</span>}
                </button>
              </li>
            );
          })}
        </ol>

        <div className="mt-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h3 ref={stepHeading} tabIndex={-1} className="font-display text-display-md focus:outline-none">
              {def.title} {def.optional && <span className="font-sans text-base tracking-normal text-ink-muted">(opcional)</span>}
            </h3>
            <p className="mt-1 text-sm text-ink-muted">{def.hint}</p>
          </div>
          <div className="flex gap-2">
            {stepIndex > 0 && (
              <Button variant="outline-soft" onClick={goBack}>
                Anterior
              </Button>
            )}
            <Button ref={forwardRef} variant={isLastStep ? "primary" : "outline"} onClick={forward}>
              {forwardLabel}
            </Button>
          </div>
        </div>

        {/* filtros del paso */}
        {(durOptions.length > 1 || focusOptions.length > 1) && (
          <div className="mt-5 flex flex-col gap-3 lg:flex-row lg:flex-wrap lg:gap-x-8">
            {durOptions.length > 1 && (
              <div role="group" aria-labelledby="filtro-duracion" className="flex min-w-0 items-center gap-3">
                <span id="filtro-duracion" className="w-20 shrink-0 text-sm font-medium text-ink-muted lg:w-auto">
                  Duración
                </span>
                <div className="scroll-row min-w-0 gap-2">
                  {durOptions.map((d) => {
                    const k = `${step}:duration`;
                    const on = filters[k] === String(d.value);
                    return (
                      <Chip key={d.value} active={on} onClick={() => setFilters({ ...filters, [k]: on ? "" : String(d.value) })}>
                        {d.label}
                      </Chip>
                    );
                  })}
                </div>
              </div>
            )}
            {focusOptions.length > 1 && (
              <div role="group" aria-labelledby="filtro-enfoque" className="flex min-w-0 items-center gap-3">
                <span id="filtro-enfoque" className="w-20 shrink-0 text-sm font-medium text-ink-muted lg:w-auto">
                  Enfoque
                </span>
                <div className="scroll-row min-w-0 gap-2">
                  {focusOptions.map((f) => {
                    const k = `${step}:focus`;
                    const on = filters[k] === f.value;
                    return (
                      <Chip key={f.value} active={on} onClick={() => setFilters({ ...filters, [k]: on ? "" : f.value })}>
                        {f.label}
                      </Chip>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* La región existe siempre (así el lector anuncia el cambio); vacía no ocupa lugar.
            Solo el paso Clase admite más de una. */}
        <p role="status" className="mt-5 text-sm text-ink-muted empty:hidden">
          {atMax ? `Ya elegiste ${def.max} clases, el máximo. Quita una para cambiarla.` : ""}
        </p>

        {/* contenido del paso. Bajo 360 px (o con la letra agrandada) una columna: a dos, Gloock partía los
            títulos a media palabra ("Calentamien-to") */}
        <LayoutMotion>
          <m.div layout className="mt-6 grid grid-cols-2 gap-x-4 gap-y-7 narrow:grid-cols-1 md:grid-cols-3 lg:grid-cols-4">
            {/* initial={false}: lo que ya está al cargar llega visible desde el HTML; solo se anima lo que entra después */}
            <AnimatePresence initial={false} mode="popLayout">
              {pool.map((x) => {
                const on = chosen.includes(x.id);
                const full = !on && atMax;
                const v = videoById(x.videoId);
                const sub = isClass(x) ? x.focus.slice(0, 2).map((f) => labelOf(FOCUS, f)).join(" · ") : x.feelings.slice(0, 2).map((f) => labelOf(FEELINGS, f)).join(" · ");
                return (
                  <m.button
                    key={x.id}
                    layout
                    type="button"
                    onClick={() => !full && toggle(x.id)}
                    aria-pressed={on}
                    // aria-disabled y no disabled: sigue enfocable y el lector dice por qué no se puede
                    aria-disabled={full || undefined}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: DUR.base, ease: EASE_OUT }}
                    className="group text-left aria-disabled:cursor-not-allowed aria-disabled:opacity-(--opacity-disabled)"
                  >
                    <span className={`card-media relative block aspect-[3/2] overflow-hidden rounded-media bg-surface-alt ring-2 ring-offset-2 ring-offset-surface transition-shadow ${on ? "ring-accent" : "ring-transparent"}`}>
                      <Image src={v.thumbnail} alt="" fill sizes={CARD_SIZES} className="object-cover" style={v.thumbnailFocal ? { objectPosition: v.thumbnailFocal } : undefined} />
                      {/* casilla de selección (funcional, no decorativa) */}
                      <span aria-hidden="true" className={`absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-control border transition-colors ${on ? "border-accent bg-accent text-on-accent" : "border-line-input bg-surface/90 text-transparent"}`}>
                        <Icon name="check" size={15} />
                      </span>
                    </span>
                    <span className="label mt-2.5 block text-ink-muted">{x.duration} min</span>
                    <span className="mt-1 block font-display text-display-sm">{x.title}</span>
                    {sub && <span className="mt-0.5 block text-sm text-ink-muted">{sub}</span>}
                  </m.button>
                );
              })}
            </AnimatePresence>
          </m.div>
        </LayoutMotion>
        {!pool.length && <p className="mt-6 text-sm text-ink-muted">Nada con ese filtro todavía.</p>}
      </section>

      <p className="mt-12 text-sm text-ink-muted">
        ¿Prefieres buscar una clase suelta?{" "}
        <Link href="/movement" className="link py-3 text-ink">
          Ir a Movement
        </Link>
      </p>

      {/* ---------- Barra fija: resumen, guardar y empezar ---------- */}
      <AnimatePresence>
        {(total > 0 || notice) && (
          <BuilderBar
            key="barra"
            total={total}
            canStart={canStart}
            sequence={sequence}
            placeholder={routine.name}
            name={name}
            onName={setName}
            notice={notice}
            onUndo={() => notice?.undo && undo(notice.undo)}
            onSave={save}
            onStart={() => start(routine)}
            onPickClass={() => {
              goToStep("classes");
              scrollToBuilder();
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

/**
 * Barra fija del constructor (espresso). En móvil: el resumen y "Empezar · N min" a todo el ancho;
 * "Guardar" es un link que abre el nombre en línea. Desde sm: nombre, Guardar y Empezar en una fila.
 * Publica su alto (--bottom-bar-h) para que el foco y las anclas no queden debajo de ella.
 */
function BuilderBar({
  total,
  canStart,
  sequence,
  placeholder,
  name,
  onName,
  notice,
  onUndo,
  onSave,
  onStart,
  onPickClass,
}: {
  total: number;
  canStart: boolean;
  sequence: string;
  placeholder: string;
  name: string;
  onName: (v: string) => void;
  notice: Notice | null;
  onUndo: () => void;
  onSave: () => void;
  onStart: () => void;
  onPickClass: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const [naming, setNaming] = useState(false);
  const showForm = naming && canStart;

  useBarHeight(ref, "--bottom-bar-h");

  // Al abrir "Guardar" en móvil, directo al campo del nombre
  useEffect(() => {
    if (naming) input.current?.focus();
  }, [naming]);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!canStart) return;
    onSave();
    if (naming) {
      setNaming(false);
      toggleRef.current?.focus();
    }
  };

  const primary = canStart ? onStart : onPickClass;

  return (
    <m.div
      ref={ref}
      initial={{ y: 80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 80, opacity: 0 }}
      transition={SPRING.sheet}
      // En móvil queda encima de la barra de pestañas (y de la zona segura del iPhone)
      className="fixed inset-x-0 bottom-(--tabbar-space) z-(--z-sticky)"
    >
      <div className="container-x">
        <div className="on-dark rounded-t-control bg-espresso px-4 pb-4 pt-3 sm:px-6">
          {notice && (
            <div className={`flex items-center justify-between gap-3 text-sm leading-snug ${total > 0 ? "mb-3 border-b border-line pb-2" : ""}`}>
              {/* En el celular, una línea con la versión corta (que no pierda la instrucción al truncarse); el texto
                  completo desde sm y siempre en la región aria-live */}
              <span className="min-w-0 truncate sm:hidden">{notice.short ?? notice.text}</span>
              <span className="hidden min-w-0 sm:inline">{notice.text}</span>
              {notice.undo && (
                <button type="button" onClick={onUndo} className="link-action -my-3 shrink-0 text-accent-soft">
                  Deshacer
                </button>
              )}
              {notice.link && (
                <Link href={notice.link.href} aria-label={notice.link.ariaLabel} className="link-action -my-3 shrink-0">
                  {notice.link.label}
                </Link>
              )}
            </div>
          )}
          {total > 0 && (
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex min-w-0 items-center justify-between gap-4">
                <div className="min-w-0">
                  <p className="label text-ink-muted">Tu rutina · {total} min</p>
                  <p className="truncate text-sm">{sequence}</p>
                </div>
                {canStart && (
                  <button ref={toggleRef} type="button" onClick={() => setNaming((v) => !v)} aria-expanded={naming} className="link-action -my-3 shrink-0 sm:hidden">
                    {naming ? "Cancelar" : "Guardar"}
                  </button>
                )}
              </div>
              <form onSubmit={submit} className={`${showForm ? "flex" : "hidden"} items-center gap-2 sm:flex`}>
                <label htmlFor="nombre-rutina" className="sr-only">
                  Nombre de la rutina (opcional)
                </label>
                <input
                  ref={input}
                  id="nombre-rutina"
                  value={name}
                  onChange={(e) => onName(e.target.value)}
                  placeholder={placeholder || "Nombre"}
                  maxLength={40}
                  enterKeyHint="done"
                  className="h-11 min-w-0 flex-1 rounded-control border border-line-input bg-transparent px-3 text-base text-ink placeholder:text-ink-muted focus:border-ink sm:w-40 sm:flex-none"
                />
                <Button type="submit" variant="outline-on-dark" size="sm" aria-disabled={!canStart} className="shrink-0">
                  Guardar
                </Button>
                {/* Envuelto: "hidden" sobre el inline-flex del botón no tiene un orden fijo en el CSS */}
                <span className="hidden sm:contents">
                  <Button variant="light" size="sm" onClick={primary} className="shrink-0">
                    {canStart ? "Empezar" : "Elige una clase"}
                  </Button>
                </span>
              </form>
              <Button variant="light" size="lg" onClick={primary} className="w-full sm:hidden">
                {canStart ? `Empezar · ${total} min` : "Elige una clase"}
              </Button>
            </div>
          )}
        </div>
      </div>
    </m.div>
  );
}
