"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Icon } from "@/components/ui/Icon";
import { embedUrl } from "@/lib/video";
import { useLocal } from "@/lib/local-store";
import { ROUTINE_KEYS, STEPS, toQueue, type Routine } from "@/lib/routine";
import { courses } from "@/content/courses";
import { talks } from "@/content/talks";
import { latestEpisode, PODCAST } from "@/content/podcast";
import { CourseCard } from "@/components/cards/CourseCard";
import { TalkCard } from "@/components/cards/TalkCard";

const COUNTDOWN = 6;

/**
 * Reproduce la rutina en un solo player. Al terminar un video (evento `ended`
 * del player de Vimeo) muestra una cuenta regresiva y pasa solo al siguiente.
 * "Terminé" fuerza el mismo flujo cuando el video es un placeholder.
 */
export function RoutinePlayer() {
  const routine = useLocal<Routine | null>(ROUTINE_KEYS.current, null);
  const queue = useMemo(() => (routine ? toQueue(routine) : []), [routine]);
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [count, setCount] = useState<number | null>(null);
  const [done, setDone] = useState(false);
  const iframe = useRef<HTMLIFrameElement>(null);

  const current = queue[index];
  const total = queue.reduce((a, q) => a + q.durationMin, 0);
  const elapsed = queue.slice(0, index).reduce((a, q) => a + q.durationMin, 0);

  const finish = () => setCount(COUNTDOWN);
  const goNext = () => {
    setCount(null);
    if (index + 1 >= queue.length) {
      setDone(true);
      setPlaying(false);
    } else {
      setIndex(index + 1);
      setPlaying(true);
    }
  };

  // Escucha el fin del video de Vimeo (Player API por postMessage)
  useEffect(() => {
    const onMessage = (e: MessageEvent) => {
      if (!/vimeo\.com$/.test(new URL(e.origin).hostname)) return;
      try {
        const data = typeof e.data === "string" ? JSON.parse(e.data) : e.data;
        if (data?.event === "ready") iframe.current?.contentWindow?.postMessage(JSON.stringify({ method: "addEventListener", value: "ended" }), "*");
        if (data?.event === "ended") finish();
      } catch {}
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
     
  }, [index]);

  // Cuenta regresiva entre videos
  useEffect(() => {
    if (count === null) return;
    const t = setTimeout(() => (count === 0 ? goNext() : setCount(count - 1)), count === 0 ? 50 : 1000);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [count]);

  if (!routine || !queue.length) {
    return (
      <div className="container-x py-20 text-center">
        <p className="font-display text-3xl">No hay una rutina lista.</p>
        <Link href="/rutina" className="label link mt-4 inline-block">
          Armar una rutina
        </Link>
      </div>
    );
  }

  if (done) {
    const recCourses = courses.slice(0, 2);
    const recTalks = talks.filter((t) => t.featured).slice(0, 2);
    return (
      <div className="container-x py-10 sm:py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}>
          <p className="label text-terracotta">Rutina completada · {total} min</p>
          <h1 className="mt-3 font-display text-5xl leading-[0.98] sm:text-7xl">Bien hecho.</h1>
          <p className="mt-4 max-w-md text-[15px] text-cocoa">
            {queue.length} {queue.length === 1 ? "video" : "videos"} seguidos, sin tocar nada. Para cerrar el momento, algo para la mente:
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/rutina" className="label rounded-md bg-espresso px-5 py-3.5 text-cream">
              Repetir o editar
            </Link>
            <Link href="/movement" className="label rounded-md border border-espresso px-5 py-3.5">
              Ir a Movement
            </Link>
          </div>
        </motion.div>

        <section className="mt-16">
          <p className="label border-t border-espresso/30 pt-4 text-cocoa">Para seguir · Cursos</p>
          <div className="mt-6 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {recCourses.map((c) => (
              <CourseCard key={c.id} c={c} />
            ))}
          </div>
        </section>
        <section className="mt-16">
          <p className="label border-t border-espresso/30 pt-4 text-cocoa">Para escuchar · Charlas</p>
          <div className="mt-6 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {recTalks.map((t) => (
              <TalkCard key={t.id} t={t} />
            ))}
          </div>
        </section>
        <section className="mt-16">
          <p className="label border-t border-espresso/30 pt-4 text-cocoa">Podcast · {PODCAST.title}</p>
          <a href={latestEpisode.spotifyUrl} target="_blank" rel="noreferrer" className="group mt-6 grid grid-cols-[96px_1fr] items-center gap-5">
            <span className="card-media relative aspect-square overflow-hidden rounded-md bg-cream-deep">
              <Image src={PODCAST.cover} alt="" fill sizes="96px" className="object-cover" />
            </span>
            <span>
              <span className="label block text-cocoa">Último episodio · Ep. {latestEpisode.number}</span>
              <span className="mt-1 block font-display text-2xl leading-tight group-hover:text-terracotta">{latestEpisode.title}</span>
              <span className="label link mt-2 inline-block">Escuchar en Spotify</span>
            </span>
          </a>
        </section>
      </div>
    );
  }

  return (
    <div className="bg-espresso text-cream">
      <div className="container-x py-4 sm:py-6">
        {/* progreso de pasos */}
        <div className="flex items-center gap-2">
          {queue.map((q, i) => (
            <div key={q.id + i} className="h-1 flex-1 overflow-hidden rounded-full bg-cream/15">
              <motion.div className="h-full bg-terracotta" initial={false} animate={{ width: i < index ? "100%" : i === index ? (playing ? "35%" : "0%") : "0%" }} transition={{ duration: 0.6 }} />
            </div>
          ))}
        </div>
        <div className="mt-3 flex items-center justify-between text-[12px] text-cream/70">
          <span className="label">
            {STEPS.find((s) => s.key === current.stepKey)?.title} · {index + 1} de {queue.length}
          </span>
          <span className="label">
            {elapsed} / {total} min
          </span>
        </div>

        {/* player */}
        <div className="relative mt-4 aspect-video w-full overflow-hidden rounded-lg bg-black">
          {playing ? (
            <iframe ref={iframe} key={current.id} src={`${embedUrl(current.video, true)}&api=1`} title={current.title} className="absolute inset-0 h-full w-full" allow="autoplay; fullscreen; picture-in-picture" allowFullScreen />
          ) : (
            <button type="button" onClick={() => setPlaying(true)} className="group absolute inset-0" aria-label={`Reproducir ${current.title}`}>
              <Image src={current.video.thumbnail} alt="" fill sizes="100vw" className="object-cover opacity-80" priority />
              <span className="absolute left-1/2 top-1/2 flex h-20 w-20 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-cream text-espresso transition-transform group-hover:scale-105">
                <Icon name="play" size={28} className="ml-1" />
              </span>
            </button>
          )}

          <AnimatePresence>
            {count !== null && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 flex flex-col items-center justify-center bg-espresso/85 text-center backdrop-blur-sm">
                <p className="label text-cream/70">{index + 1 < queue.length ? "Siguiente" : "Terminando"}</p>
                <p className="mt-2 font-display text-3xl sm:text-5xl">{index + 1 < queue.length ? queue[index + 1].title : "Rutina completada"}</p>
                <motion.p key={count} initial={{ scale: 1.3, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="mt-4 font-display text-7xl text-terracotta-soft">
                  {count}
                </motion.p>
                <div className="mt-4 flex gap-3">
                  <button type="button" onClick={goNext} className="label rounded-md bg-cream px-4 py-2.5 text-espresso">
                    Ahora
                  </button>
                  <button type="button" onClick={() => setCount(null)} className="label rounded-md border border-cream/40 px-4 py-2.5">
                    Pausa
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* título + controles */}
        <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="label text-cream/60">{current.durationMin} min</p>
            <h1 className="font-display text-3xl leading-tight sm:text-4xl">{current.title}</h1>
          </div>
          <div className="flex gap-2">
            {index > 0 && (
              <button type="button" onClick={() => { setIndex(index - 1); setPlaying(true); }} className="label rounded-md border border-cream/30 px-4 py-2.5">
                Anterior
              </button>
            )}
            <button type="button" onClick={finish} className="label rounded-md bg-cream px-4 py-2.5 text-espresso">
              {index + 1 < queue.length ? "Terminé, siguiente" : "Terminé"}
            </button>
          </div>
        </div>

        {/* cola */}
        <ol className="mt-6 divide-y divide-cream/10 border-t border-cream/10">
          {queue.map((q, i) => (
            <li key={q.id + i} className={`flex items-center gap-4 py-3 ${i === index ? "" : i < index ? "opacity-40" : "opacity-70"}`}>
              <span className="label w-6 text-cream/60">{i + 1}</span>
              <span className="relative h-10 w-16 shrink-0 overflow-hidden rounded-sm bg-cream/10">
                <Image src={q.video.thumbnail} alt="" fill sizes="64px" className="object-cover" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[15px]">{q.title}</span>
                <span className="label text-cream/60">{STEPS.find((s) => s.key === q.stepKey)?.title} · {q.durationMin} min</span>
              </span>
              {i === index && <span className="label text-terracotta-soft">Ahora</span>}
              {i > index && (
                <button type="button" onClick={() => { setIndex(i); setPlaying(true); setCount(null); }} className="label link text-cream/70">
                  Saltar aquí
                </button>
              )}
            </li>
          ))}
        </ol>
        <p className="mt-6 text-[12px] text-cream/50">Los videos son placeholders en este prototipo; con Vimeo real la transición ocurre sola al terminar cada video.</p>
      </div>
    </div>
  );
}
