"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Icon } from "@/components/ui/Icon";
import { videoById } from "@/content/videos";
import { DURATIONS, FOCUS, FOCUS_PRIMARY, labelOf, MEDITATION_DURATIONS } from "@/content/taxonomies";
import { KEYS as STORE, readLocal, useLocal, writeLocal } from "@/lib/local-store";
import { emptyRoutine, idsOf, isClass, poolFor, PRESETS, ROUTINE_KEYS, STEPS, totalMinutes, withIds, type Routine, type StepKey } from "@/lib/routine";

const NONE: Routine[] = [];
void STORE;

/**
 * Constructor de rutinas. Un paso a la vez, con filtros propios de ese paso.
 * Nada de podcasts ni cursos aquí: eso llega como recomendación al terminar.
 */
export function RoutineBuilder() {
  const router = useRouter();
  const saved = useLocal<Routine[]>(ROUTINE_KEYS.saved, NONE);
  const last = useLocal<Routine | null>(ROUTINE_KEYS.last, null);
  const [routine, setRoutine] = useState<Routine>(emptyRoutine);
  const [step, setStep] = useState<StepKey>("classes");
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [name, setName] = useState("");

  const def = STEPS.find((s) => s.key === step)!;
  const pool = useMemo(() => {
    const dur = filters[`${step}:duration`];
    const focus = filters[`${step}:focus`];
    return poolFor(step).filter((x) => {
      if (dur && String(x.duration) !== dur) return false;
      if (focus && isClass(x) && !x.focus.includes(focus as never)) return false;
      return true;
    });
  }, [step, filters]);

  const chosen = idsOf(routine, step);
  const total = totalMinutes(routine);
  const canStart = routine.classes.length > 0;

  const toggle = (id: string) => {
    const cur = idsOf(routine, step);
    let next: string[];
    if (cur.includes(id)) next = cur.filter((x) => x !== id);
    else if (def.max === 1) next = [id];
    else next = cur.length >= def.max ? cur : [...cur, id];
    setRoutine(withIds(routine, step, next));
  };

  const start = (r: Routine) => {
    writeLocal(ROUTINE_KEYS.current, r);
    writeLocal(ROUTINE_KEYS.last, r);
    router.push("/rutina/reproducir");
  };

  const save = () => {
    const r = { ...routine, name: name.trim() || `Rutina ${total} min` };
    const list = readLocal<Routine[]>(ROUTINE_KEYS.saved, NONE).filter((x) => x.id !== r.id);
    writeLocal(ROUTINE_KEYS.saved, [r, ...list].slice(0, 12));
    setRoutine(r);
    setName("");
  };

  const remove = (id: string) => writeLocal(ROUTINE_KEYS.saved, readLocal<Routine[]>(ROUTINE_KEYS.saved, NONE).filter((x) => x.id !== id));

  const stepIndex = STEPS.findIndex((s) => s.key === step);
  const focusOptions = FOCUS.filter((f) => FOCUS_PRIMARY.includes(f.value));
  const durOptions = step === "close" ? MEDITATION_DURATIONS : DURATIONS.filter((d) => poolFor(step).some((x) => x.duration === d.value));

  return (
    <div className="container-x pb-32">
      {/* ---------- Atajos ---------- */}
      <section className="pt-8">
        <div className="flex items-baseline justify-between">
          <p className="label text-cocoa">Rutinas rápidas</p>
          {last && (
            <button type="button" onClick={() => start(last)} className="label link text-terracotta">
              Repetir la última ({totalMinutes(last)} min)
            </button>
          )}
        </div>
        <div className="scroll-row -mx-5 mt-3 px-5 sm:mx-0 sm:grid sm:grid-cols-2 sm:px-0 lg:grid-cols-4">
          {[...saved, ...PRESETS].map((p) => (
            <div key={p.id} className="group relative w-[240px] rounded-lg border border-espresso/12 bg-cream p-4 transition-colors hover:border-espresso/40 sm:w-auto">
              <button type="button" onClick={() => start(p)} className="block w-full text-left">
                <p className="font-display text-2xl leading-tight">{p.name}</p>
                <p className="mt-1 text-[13px] text-cocoa">{"blurb" in p ? (p as { blurb: string }).blurb : `${p.classes.length} clase${p.classes.length > 1 ? "s" : ""}${p.warmup ? " · warm-up" : ""}${p.stretch ? " · stretch" : ""}${p.close ? " · cierre" : ""}`}</p>
                <p className="label mt-3 text-terracotta">{totalMinutes(p)} min · Empezar</p>
              </button>
              <div className="mt-2 flex gap-3">
                <button type="button" onClick={() => setRoutine({ ...p, id: emptyRoutine().id, createdAt: Date.now() })} className="label link text-cocoa">
                  Editar
                </button>
                {saved.some((s) => s.id === p.id) && (
                  <button type="button" onClick={() => remove(p.id)} className="label link text-cocoa">
                    Borrar
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ---------- Pasos ---------- */}
      <section className="mt-12">
        <p className="label text-cocoa">Arma la tuya</p>
        <ol className="mt-3 flex gap-2 overflow-x-auto">
          {STEPS.map((s, i) => {
            const n = idsOf(routine, s.key).length;
            const active = s.key === step;
            return (
              <li key={s.key} className="shrink-0">
                <button type="button" onClick={() => setStep(s.key)} className={`flex items-center gap-2 rounded-md border px-3.5 py-2.5 text-[14px] transition-colors ${active ? "border-espresso bg-espresso text-cream" : n ? "border-terracotta text-espresso" : "border-espresso/15 text-cocoa"}`}>
                  <span className="label opacity-70">0{i + 1}</span>
                  {s.title}
                  {n > 0 && <span className={`ml-1 rounded-full px-1.5 text-[11px] ${active ? "bg-cream text-espresso" : "bg-terracotta text-cream"}`}>{n}</span>}
                </button>
              </li>
            );
          })}
        </ol>

        <div className="mt-6 flex flex-wrap items-baseline justify-between gap-3">
          <div>
            <h2 className="font-display text-3xl sm:text-4xl">
              {def.title} {def.optional && <span className="text-xl text-cocoa">(opcional)</span>}
            </h2>
            <p className="mt-1 text-[14px] text-cocoa">{def.hint}</p>
          </div>
          <div className="flex gap-2">
            {stepIndex > 0 && (
              <button type="button" onClick={() => setStep(STEPS[stepIndex - 1].key)} className="label rounded-md border border-espresso/15 px-3 py-2">
                Anterior
              </button>
            )}
            {stepIndex < STEPS.length - 1 && (
              <button type="button" onClick={() => setStep(STEPS[stepIndex + 1].key)} className="label rounded-md border border-espresso px-3 py-2">
                {chosen.length ? "Siguiente" : def.optional ? "Saltar" : "Siguiente"}
              </button>
            )}
          </div>
        </div>

        {/* filtros del paso */}
        <div className="mt-4 flex flex-wrap gap-x-6 gap-y-3">
          <div className="flex items-center gap-2">
            <span className="label text-cocoa">Duración</span>
            <div className="scroll-row">
              {durOptions.map((d) => {
                const k = `${step}:duration`;
                const on = filters[k] === String(d.value);
                return (
                  <button key={d.value} type="button" onClick={() => setFilters({ ...filters, [k]: on ? "" : String(d.value) })} className={`h-8 shrink-0 rounded-md border px-3 text-[13px] ${on ? "border-espresso bg-espresso text-cream" : "border-espresso/15"}`}>
                    {d.label}
                  </button>
                );
              })}
            </div>
          </div>
          {step !== "close" && (
            <div className="flex items-center gap-2">
              <span className="label text-cocoa">Enfoque</span>
              <div className="scroll-row">
                {focusOptions.map((f) => {
                  const k = `${step}:focus`;
                  const on = filters[k] === f.value;
                  return (
                    <button key={f.value} type="button" onClick={() => setFilters({ ...filters, [k]: on ? "" : f.value })} className={`h-8 shrink-0 rounded-md border px-3 text-[13px] ${on ? "border-espresso bg-espresso text-cream" : "border-espresso/15"}`}>
                      {f.label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* pool */}
        <motion.div layout className="mt-6 grid grid-cols-2 gap-x-4 gap-y-6 md:grid-cols-3 lg:grid-cols-4">
          <AnimatePresence mode="popLayout">
            {pool.map((x) => {
              const on = chosen.includes(x.id);
              const v = videoById(x.videoId);
              const sub = isClass(x) ? x.focus.slice(0, 2).map((f) => labelOf(FOCUS, f)).join(" · ") : x.feelings.slice(0, 2).join(" · ");
              return (
                <motion.button
                  key={x.id}
                  layout
                  type="button"
                  onClick={() => toggle(x.id)}
                  aria-pressed={on}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="group text-left"
                >
                  <div className={`card-media relative aspect-[3/2] overflow-hidden rounded-md bg-cream-deep ring-2 ring-offset-2 ring-offset-cream transition-all ${on ? "ring-terracotta" : "ring-transparent"}`}>
                    <Image src={v.thumbnail} alt="" fill sizes="(min-width: 1024px) 320px, 45vw" className="object-cover" />
                    <span className={`absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full transition-colors ${on ? "bg-terracotta text-cream" : "bg-cream/90 text-espresso"}`}>
                      <Icon name={on ? "check" : "play"} size={14} />
                    </span>
                  </div>
                  <p className="label mt-2 text-cocoa">{x.duration} min</p>
                  <p className="font-display text-lg leading-tight">{x.title}</p>
                  <p className="text-[12px] text-cocoa">{sub}</p>
                </motion.button>
              );
            })}
          </AnimatePresence>
        </motion.div>
        {!pool.length && <p className="mt-6 text-[14px] text-cocoa">Nada con ese filtro todavía.</p>}
      </section>

      {/* ---------- Resumen fijo ---------- */}
      <AnimatePresence>
        {(total > 0 || canStart) && (
          <motion.div initial={{ y: 80, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 80, opacity: 0 }} transition={{ type: "spring", stiffness: 380, damping: 36 }} className="fixed inset-x-0 bottom-14 z-30 md:bottom-0">
            <div className="container-x">
              <div className="flex flex-col gap-3 rounded-t-xl bg-espresso p-4 text-cream shadow-[0_-10px_40px_rgba(47,40,35,0.25)] sm:flex-row sm:items-center sm:justify-between sm:rounded-t-2xl sm:px-6">
                <div className="min-w-0">
                  <p className="label text-cream/60">Tu rutina · {total} min</p>
                  <p className="truncate text-[14px]">
                    {STEPS.filter((s) => idsOf(routine, s.key).length).map((s) => `${s.title}${s.key === "classes" && routine.classes.length > 1 ? ` ×${routine.classes.length}` : ""}`).join("  →  ") || "Elige una clase para empezar"}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nombre" className="hidden h-10 w-32 rounded-md bg-cream/10 px-3 text-[13px] outline-none placeholder:text-cream/50 sm:block" />
                  <button type="button" onClick={save} disabled={!canStart} className="label h-10 rounded-md border border-cream/30 px-4 disabled:opacity-40">
                    Guardar
                  </button>
                  <button type="button" onClick={() => start(routine)} disabled={!canStart} className="label h-10 rounded-md bg-cream px-5 text-espresso transition-colors hover:bg-terracotta hover:text-cream disabled:opacity-40">
                    Empezar
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <p className="mt-10 text-[13px] text-cocoa">
        ¿Prefieres buscar una clase suelta? <Link href="/movement" className="link">Ir a Movement</Link>
      </p>
    </div>
  );
}
