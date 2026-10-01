"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState, useSyncExternalStore, type MouseEvent } from "react";
import { AnimatePresence } from "motion/react";
import * as m from "motion/react-m";
import { Icon } from "@/components/ui/Icon";
import { Button, ButtonLink } from "@/components/ui/Button";
import { NewTabHint } from "@/components/ui/NewTabHint";
import { PlayOverlay } from "@/components/ui/PlayOverlay";
import { PlaceholderNotice, usePlayingFlag } from "@/components/VideoPlayer";
import { embedUrl, useVimeoEvents } from "@/lib/video";
import { useLocal } from "@/lib/local-store";
import { useAuth } from "@/lib/auth";
import { DUR, EASE_OUT, RISE } from "@/lib/motion";
import { markCompleted, markStarted } from "@/lib/user-data";
import { ROUTINE_KEYS, STEPS, toQueue, type QueueItem, type Routine } from "@/lib/routine";
import { ROUTINE } from "@/content/site";
import { meditations } from "@/content/meditations";
import { videoById } from "@/content/videos";
import { workbooks } from "@/content/workbooks";
import { WORKBOOK_COVER } from "@/content/media";
import { latestEpisode, PODCAST } from "@/content/podcast";
import { resumeStep, savePosition, saveRoutine, seenSteps, type PlayingRoutine } from "./routine-store";

const COUNTDOWN = 6;
const NONE: Routine[] = [];

/** Clave de historial de cada video de la cola: "class:<id>" / "meditation:<id>" (ver user-data). */
const keyOf = (q: QueueItem) => `${q.kind}:${q.id}`;
const stepTitle = (q: QueueItem) => STEPS.find((s) => s.key === q.stepKey)?.title;
const focal = (q: QueueItem) => (q.video.thumbnailFocal ? { objectPosition: q.video.thumbnailFocal } : undefined);
/** Ancho del video: todo el ancho hasta xl (con tope por el alto de la pantalla) y la columna grande después. */
const STAGE_SIZES = "(min-width: 1408px) 900px, (min-width: 1280px) 65vw, 100vw";

const noop = () => () => {};
/** false en el HTML estático y en la hidratación; true ya en el navegador (sin setState en efectos). */
const useHydrated = () => useSyncExternalStore(noop, () => true, () => false);

/* ---------- Pantalla completa propia (Safari de iPad usa el prefijo; en iPhone no existe fuera de <video>) ---------- */
type FsDocument = Document & { webkitFullscreenEnabled?: boolean; webkitFullscreenElement?: Element | null; webkitExitFullscreen?: () => Promise<void> };
type FsElement = HTMLElement & { webkitRequestFullscreen?: () => Promise<void> };
type LockableOrientation = ScreenOrientation & { lock?: (orientation: string) => Promise<void> };

const fsDoc = () => document as FsDocument;
const fullscreenEnabled = () => Boolean(fsDoc().fullscreenEnabled || fsDoc().webkitFullscreenEnabled);
const fullscreenElement = () => fsDoc().fullscreenElement ?? fsDoc().webkitFullscreenElement ?? null;
const subscribeFullscreen = (cb: () => void) => {
  document.addEventListener("fullscreenchange", cb);
  document.addEventListener("webkitfullscreenchange", cb);
  return () => {
    document.removeEventListener("fullscreenchange", cb);
    document.removeEventListener("webkitfullscreenchange", cb);
  };
};

/** A dónde va el foco después de un cambio que desmonta el botón tocado (nunca a <body>). */
type FocusTarget = "title" | "player" | "pause" | "finish";

/**
 * Reproduce la rutina en un solo player. Al terminar un video (evento `ended` del player de
 * Vimeo) o con "Terminé", ese video queda como visto en el historial de la usuaria, se muestra
 * una cuenta regresiva y pasa solo al siguiente. Con videos de muestra (sin id real de Vimeo) no
 * se monta el iframe: el póster muestra un aviso y "Terminé" y la cuenta regresiva siguen igual.
 *
 * - El paso actual y los ya vistos se guardan con la rutina (routine-store): salir o recargar retoma
 *   ahí, con "Visto" en la cola y el conteo del cierre completos.
 * - Con el celular acostado (landscape-short) solo quedan el video, que nunca pasa del alto de la
 *   pantalla, y los botones al costado. La barra inferior y el header se ocultan con data-playing.
 * - Desde xl, la cola y los controles van en una columna al lado del video. En lg (tablet acostada) el
 *   video va a todo el ancho y el título y "Terminé" en una fila debajo, siempre a la vista.
 * - Pantalla completa propia sobre el contenedor del video: la cuenta regresiva y "Terminé" siguen a la vista.
 */
export function RoutinePlayer() {
  const hydrated = useHydrated();
  const routine = useLocal<PlayingRoutine | null>(ROUTINE_KEYS.current, null);
  const queue = useMemo(() => (routine ? toQueue(routine) : []), [routine]);
  const resumeAt = resumeStep(routine, queue.length);
  /** Posiciones de la cola que la usuaria ya terminó en esta vuelta (guardadas con la rutina) */
  const finished = useMemo(() => seenSteps(routine, queue.length), [routine, queue.length]);
  /** Paso elegido en esta visita; null = el que quedó guardado (retomar donde iba). */
  const [chosen, setChosen] = useState<number | null>(null);
  const [playing, setPlaying] = useState(false);
  const [count, setCount] = useState<number | null>(null);
  /** Videos vistos al terminar la rutina (se fija al llegar a "Bien hecho."; null = en curso) */
  const [doneCount, setDoneCount] = useState<number | null>(null);
  const done = doneCount !== null;
  const stage = useRef<HTMLDivElement>(null);
  const iframe = useRef<HTMLIFrameElement>(null);
  const notice = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const pauseRef = useRef<HTMLButtonElement>(null);
  const finishRef = useRef<HTMLButtonElement>(null);
  const exitDialog = useRef<HTMLDialogElement>(null);
  const focusNext = useRef<FocusTarget | null>(null);
  const fsElement = useSyncExternalStore(subscribeFullscreen, fullscreenElement, () => null);
  const canFullscreen = useSyncExternalStore(noop, fullscreenEnabled, () => false);
  const fullscreen = Boolean(fsElement?.hasAttribute("data-stage"));

  const index = Math.min(chosen ?? resumeAt, Math.max(queue.length - 1, 0));
  const current = queue[index];
  const total = queue.reduce((a, q) => a + q.durationMin, 0);
  const elapsed = queue.slice(0, index).reduce((a, q) => a + q.durationMin, 0);
  const live = playing && current && !current.video.placeholder;
  const resumed = chosen === null && resumeAt > 0;

  // Mientras la rutina está en pantalla (hasta "Bien hecho.") la barra inferior no estorba
  usePlayingFlag(hydrated && queue.length > 0 && !done);

  /** Reproduce el video `i` de la cola, lo registra como empezado ("Continuar viendo") y anota el paso. */
  const playAt = (i: number, focus: FocusTarget = "title") => {
    const q = queue[i];
    if (!q || !routine) return;
    setCount(null);
    setChosen(i);
    setPlaying(true);
    markStarted(keyOf(q));
    savePosition(routine, i, finished);
    focusNext.current = focus;
  };

  /** Terminó el video actual (Vimeo o botón): queda como visto y arranca la cuenta regresiva. */
  const finish = () => {
    if (!current || !routine || count !== null) return;
    markCompleted(keyOf(current));
    // Junto con el paso actual: si sale durante la cuenta, retoma aquí y este video ya cuenta como visto
    if (!finished.includes(index)) savePosition(routine, index, [...finished, index]);
    setCount(COUNTDOWN);
    // La cuenta avanza sola: el foco va a "Pausa" para que teclado y lector la alcancen a tiempo
    focusNext.current = "pause";
  };

  const goNext = () => {
    setCount(null);
    if (index + 1 >= queue.length) {
      // El resumen se fija antes de limpiar: terminada, la próxima vez empieza desde el principio
      setDoneCount(finished.length);
      setPlaying(false);
      if (routine) savePosition(routine, 0);
    } else {
      playAt(index + 1);
    }
  };

  const pause = () => {
    setCount(null);
    focusNext.current = "finish";
  };

  const restart = () => {
    if (!routine) return;
    setChosen(0);
    // Desde el principio también se borra lo visto en esta vuelta
    savePosition(routine, 0);
    focusNext.current = "title";
  };

  /** Con la rutina empezada, salir pide confirmación (queda guardada en el paso actual). */
  const onExit = (e: MouseEvent<HTMLAnchorElement>) => {
    if (index === 0 || !exitDialog.current) return;
    e.preventDefault();
    exitDialog.current.showModal();
  };

  const toggleFullscreen = async () => {
    const el = stage.current as FsElement | null;
    if (!el) return;
    try {
      if (fullscreenElement()) {
        await (document.exitFullscreen ? document.exitFullscreen() : fsDoc().webkitExitFullscreen?.());
        return;
      }
      await (el.requestFullscreen ? el.requestFullscreen() : el.webkitRequestFullscreen?.());
      // En Android fija la pantalla en horizontal (el celular en el piso); donde no se puede, no pasa nada
      await (screen.orientation as LockableOrientation | undefined)?.lock?.("landscape");
    } catch {}
  };

  // La cuenta regresiva vive fuera del ciclo de render: siempre llama a la versión más reciente
  const latest = useRef({ goNext });
  useEffect(() => {
    latest.current = { goNext };
  });

  // Foco después de cada cambio de paso o de la cuenta regresiva (el botón tocado puede ya no existir)
  useEffect(() => {
    const target = focusNext.current;
    if (!target) return;
    focusNext.current = null;
    const el = { title: titleRef.current, pause: pauseRef.current, finish: finishRef.current, player: iframe.current ?? notice.current }[target];
    el?.focus({ preventScroll: true });
  });

  // El fin del video de Vimeo cuenta como "Terminé"
  useVimeoEvents(iframe, { ended: () => finish() }, Boolean(live && current?.video.provider === "vimeo"));

  // Cuenta regresiva entre videos
  useEffect(() => {
    if (count === null) return;
    const t = setTimeout(() => (count === 0 ? latest.current.goNext() : setCount(count - 1)), count === 0 ? 50 : 1000);
    return () => clearTimeout(t);
  }, [count]);

  if (!hydrated) return <div className="min-h-[70vh]" aria-busy="true" />;

  if (!routine || !queue.length || !current) {
    return (
      <div className="container-x py-20 text-center">
        <p className="font-display text-display-lg">No hay una rutina lista.</p>
        <p className="mt-3 text-body-sm text-ink-muted">Elige una rutina predeterminada o arma la tuya.</p>
        <ButtonLink href="/rutina" size="lg" className="mt-6">
          {ROUTINE.cta}
        </ButtonLink>
      </div>
    );
  }

  if (doneCount !== null) return <RoutineDone routine={routine} queue={queue} total={total} finished={doneCount} />;

  const hasNext = index + 1 < queue.length;
  const finishLabel = hasNext ? "Terminé, siguiente" : "Terminé";
  const exitLink = (className: string) => (
    <Link href="/rutina" onClick={onExit} className={`link-action text-ink-muted ${className}`}>
      <Icon name="arrow-left" size={16} />
      Salir de la rutina
    </Link>
  );

  return (
    <>
      {/* -mb-24 pb-24: el espresso baja hasta el footer (también espresso; su margen superior es mt-24) en vez de
          dejar una franja clara entre los dos. El filete de abajo los separa. */}
      <div className="on-dark -mb-24 border-b border-line bg-espresso pb-24">
        <div className="container-x pt-4 sm:pt-6 landscape-short:pt-2">
          {/* Con el celular acostado solo quedan el video y sus botones; esto vuelve al girarlo */}
          <div className="landscape-short:hidden">
            {exitLink("")}
            {/* Progreso por pasos: los hechos llenos, el actual a media tinta (no se mide el avance dentro del video) */}
            <div className="mt-1 flex items-center gap-1.5" aria-hidden="true">
              {queue.map((q, i) => (
                <div key={q.id + i} className="h-1 flex-1 overflow-hidden bg-line">
                  <div
                    className={`h-full origin-left bg-accent transition-[scale,opacity] duration-(--duration-slow) ease-out-quint motion-reduce:transition-none ${i < index ? "" : i === index ? "opacity-50" : "scale-x-0"}`}
                  />
                </div>
              ))}
            </div>
            <p className="mt-3 flex flex-wrap justify-between gap-x-4 text-body-sm text-ink-muted">
              <span>
                Paso {index + 1} de {queue.length}
              </span>
              <span>
                {elapsed} de {total} min
              </span>
            </p>
            {resumed && (
              <p className="mt-2 flex flex-wrap items-center gap-x-4 text-body-sm text-ink-muted">
                Retomas donde ibas.
                <button type="button" onClick={restart} className="link-action -my-3 text-ink">
                  Empezar desde el principio
                </button>
              </p>
            )}
          </div>

          {/* "Terminé" siempre a la vista sin hacer scroll. Desde xl el player y los controles van lado a lado: el
              video ocupa las dos filas; la de la cola (1fr) absorbe lo que sobre, así no se abre un hueco bajo los
              controles. En lg (tablet acostada) el video va a todo el ancho y los controles en una fila debajo. */}
          <div className="mt-4 grid grid-cols-[minmax(0,1fr)] xl:grid-cols-[minmax(0,1fr)_24rem] xl:grid-rows-[auto_1fr] xl:items-start xl:gap-x-10 landscape-short:mt-0 landscape-short:grid-cols-[minmax(0,1fr)_10rem] landscape-short:items-center landscape-short:gap-x-4">
            {/* Escenario: nunca más alto que la pantalla (en lg deja lugar al progreso y a la fila de controles; en
                xl, al progreso; acostado, a todo el alto) */}
            <div
              ref={stage}
              data-stage
              className="relative mx-auto aspect-video w-full overflow-hidden rounded-media bg-espresso lg:max-w-[calc((100svh-19rem)*16/9)] xl:row-span-2 xl:max-w-[calc((100svh-15rem)*16/9)] landscape-short:max-w-[calc((100svh-1rem)*16/9)] [&:fullscreen]:rounded-none"
            >
              {live ? (
                // `fullscreen` ya va en allow (allowFullScreen duplicado genera un aviso en consola)
                <iframe ref={iframe} key={`${index}-${current.id}`} src={embedUrl(current.video, true)} title={current.title} className="absolute inset-0 h-full w-full" allow="autoplay; fullscreen; picture-in-picture" />
              ) : playing ? (
                <>
                  <Image src={current.video.thumbnail} alt="" fill sizes={STAGE_SIZES} className="object-cover" style={focal(current)} />
                  {/* Durante la cuenta regresiva el aviso se quita para que no se lea a través de ella */}
                  {count === null && <PlaceholderNotice ref={notice} hint="Toca «Terminé» para seguir con la rutina." />}
                </>
              ) : (
                <PlayOverlay
                  image={current.video.thumbnail}
                  focal={current.video.thumbnailFocal}
                  sizes={STAGE_SIZES}
                  label={`Reproducir ${current.title}`}
                  onClick={() => playAt(index, "player")}
                  size="lg"
                  dim
                />
              )}

              <AnimatePresence>
                {count !== null && (
                  <m.div
                    key="cuenta"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: DUR.fast }}
                    className="absolute inset-0 flex flex-col items-center justify-center bg-scrim-strong px-4 text-center"
                  >
                    <div role="status" className="max-w-full">
                      <p className="text-body-sm text-ink-muted">{hasNext ? "Siguiente" : "Terminando"}</p>
                      <p className="mt-1 truncate font-display text-display-md sm:mt-2 sm:whitespace-normal sm:text-display-lg landscape-short:text-display-md">{hasNext ? queue[index + 1].title : "Rutina completada"}</p>
                    </div>
                    <m.p
                      key={count}
                      initial={{ scale: 1.3, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: DUR.fast, ease: EASE_OUT }}
                      className="mt-1 font-display text-display-xl leading-none tabular-nums text-accent-soft sm:mt-3 landscape-short:text-display-lg"
                      aria-hidden="true"
                    >
                      {count}
                    </m.p>
                    <div className="mt-3 flex gap-3 sm:mt-4">
                      <Button variant="light" size="sm" onClick={goNext}>
                        {hasNext ? "Ahora" : "Terminar"}
                      </Button>
                      <Button ref={pauseRef} variant="outline-on-dark" size="sm" onClick={pause}>
                        Pausa
                      </Button>
                    </div>
                  </m.div>
                )}
              </AnimatePresence>

              {/* En pantalla completa lo demás no se ve: salir y "Terminé" van encima del video */}
              {fullscreen && (
                <div className="absolute inset-x-0 top-0 flex items-start justify-between gap-3 p-3 sm:p-4">
                  <Button variant="outline-on-dark" size="sm" onClick={toggleFullscreen}>
                    Salir de pantalla completa
                  </Button>
                  <Button variant="light" size="sm" aria-disabled={count !== null} onClick={finish}>
                    {finishLabel}
                  </Button>
                </div>
              )}
            </div>

            {/* Título y controles. En lg van en una fila bajo el video y con su mismo ancho: el título a la izquierda y
                las acciones a la derecha */}
            <div className="mt-4 lg:mx-auto lg:grid lg:w-full lg:max-w-[calc((100svh-19rem)*16/9)] lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end lg:gap-x-8 xl:mx-0 xl:mt-0 xl:block xl:max-w-none landscape-short:mt-0 landscape-short:block landscape-short:max-w-none">
              <div className="min-w-0">
                <p className="text-body-sm text-ink-muted landscape-short:text-sm">
                  {stepTitle(current)} · {current.durationMin} min
                </p>
                <h1 ref={titleRef} tabIndex={-1} className="mt-1 font-display text-display-lg focus:outline-none lg:line-clamp-2 lg:text-display-md xl:line-clamp-none landscape-short:line-clamp-2 landscape-short:text-display-sm">
                  {current.title}
                </h1>
              </div>
              <div className="lg:flex lg:items-center lg:gap-6 xl:block landscape-short:block">
                <div className="mt-4 flex gap-2 lg:mt-0 xl:mt-5 landscape-short:mt-3 landscape-short:flex-col-reverse">
                  {index > 0 && (
                    <Button variant="outline-on-dark" size="lg" wrap onClick={() => playAt(index - 1)} className="flex-1 sm:flex-none sm:px-6 xl:flex-1 landscape-short:flex-none landscape-short:px-3">
                      Anterior
                    </Button>
                  )}
                  {/* aria-disabled y no disabled: durante la cuenta conserva el foco (disabled lo tiraría a <body>) */}
                  <Button
                    ref={finishRef}
                    variant="light"
                    size="lg"
                    wrap
                    aria-disabled={count !== null}
                    onClick={finish}
                    className="flex-[2] sm:flex-none xl:flex-[2] landscape-short:flex-none landscape-short:px-3"
                  >
                    {finishLabel}
                  </Button>
                </div>
                {/* En lg, antes de los botones y en la misma fila */}
                <div className="mt-2 flex flex-wrap gap-x-5 lg:order-first lg:mt-0 xl:mt-2 landscape-short:mt-2">
                  {canFullscreen && (
                    <button type="button" onClick={toggleFullscreen} className="link-action text-ink-muted">
                      Pantalla completa
                    </button>
                  )}
                  {exitLink("hidden landscape-short:inline-flex")}
                </div>
              </div>
            </div>

            {/* Cola: toda la fila salta a ese video */}
            <ol aria-label="Videos de la rutina" className="@container mt-6 divide-y divide-line border-t border-line xl:col-start-2 xl:mt-8 landscape-short:col-span-2 landscape-short:mt-4">
              {queue.map((q, i) => {
                const now = i === index;
                const seen = finished.includes(i);
                const past = i < index;
                const row = (
                  <>
                    <span className="w-5 shrink-0 text-sm tabular-nums text-ink-muted">{i + 1}</span>
                    {/* Si la cola mide menos de 14 rem (letra agrandada) la miniatura se oculta: con ella, "Ahora" se salía de la pantalla */}
                    <span className="relative h-10 w-16 shrink-0 overflow-hidden rounded-media bg-line @max-[14rem]:hidden">
                      <Image src={q.video.thumbnail} alt="" fill sizes="64px" className="object-cover" style={focal(q)} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className={`line-clamp-2 block text-body-sm leading-snug ${past ? "text-ink-muted" : ""}`}>{q.title}</span>
                      <span className="mt-0.5 block text-sm text-ink-muted">
                        {stepTitle(q)} · {q.durationMin} min
                      </span>
                    </span>
                  </>
                );
                return (
                  <li key={q.id + i} aria-current={now ? "step" : undefined}>
                    {now ? (
                      <div className="flex min-h-16 items-center gap-3 py-2 sm:gap-4">
                        {row}
                        <span className="shrink-0 text-sm font-medium text-accent-soft">Ahora</span>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => playAt(i)}
                        aria-label={`${i > index ? "Saltar a" : "Volver a"} ${q.title}${seen ? ", visto" : ""}`}
                        className="flex min-h-16 w-full items-center gap-3 py-2 text-left transition-colors hover:bg-hover active:bg-press sm:gap-4"
                      >
                        {row}
                        {seen ? (
                          <span className="inline-flex shrink-0 items-center gap-1 text-sm text-ink-muted">
                            <Icon name="check" size={14} />
                            Visto
                          </span>
                        ) : (
                          <span className="hidden shrink-0 text-sm text-ink-muted sm:inline">{i > index ? "Saltar aquí" : "Repetir"}</span>
                        )}
                      </button>
                    )}
                  </li>
                );
              })}
            </ol>
          </div>
        </div>
      </div>

      {/* Confirmación al salir (fuera de .on-dark: es un diálogo claro). <dialog> nativo: foco, Esc e inert incluidos */}
      <dialog
        ref={exitDialog}
        aria-labelledby="salir-titulo"
        aria-describedby="salir-texto"
        className="m-auto w-[min(28rem,calc(100%-2*var(--gutter)))] rounded-control bg-surface p-6 text-ink backdrop:bg-scrim sm:p-8"
      >
        <h2 id="salir-titulo" className="font-display text-display-md">
          ¿Salir de la rutina?
        </h2>
        <p id="salir-texto" className="mt-3 text-body-sm leading-relaxed text-ink-muted">
          Queda guardada en el paso {index + 1} de {queue.length}. Para seguir, vuelve a {ROUTINE.cta} y toca «Seguir donde ibas».
        </p>
        <form method="dialog" className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <ButtonLink href="/rutina" variant="outline">
            Salir
          </ButtonLink>
          <Button type="submit" autoFocus>
            Seguir con la rutina
          </Button>
        </form>
      </dialog>
    </>
  );
}

/**
 * Pantalla final. Nada de cursos ni charlas (aún no hay): una meditación corta para cerrar si la
 * rutina no tenía (nunca una de mañana), el workbook y el último episodio del podcast.
 */
function RoutineDone({ routine, queue, total, finished }: { routine: Routine; queue: QueueItem[]; total: number; finished: number }) {
  const { status } = useAuth();
  const saved = useLocal<Routine[]>(ROUTINE_KEYS.saved, NONE);
  const isSaved = saved.some((x) => x.id === routine.id);
  const [savedName, setSavedName] = useState<string | null>(null);
  const heading = useRef<HTMLHeadingElement>(null);

  // La pantalla cambia entera: arriba de todo y el foco en "Bien hecho." (el lector lo anuncia)
  useEffect(() => {
    window.scrollTo({ top: 0 });
    heading.current?.focus({ preventScroll: true });
  }, []);

  const short = meditations.filter((m) => m.duration <= 10);
  const med = routine.close ? null : (short.find((m) => m.moment !== "morning" && m.feelings.includes("volver-a-ti")) ?? short.find((m) => m.moment === "stress") ?? null);
  const medVideo = med ? videoById(med.videoId) : null;
  const wb = workbooks[0];
  const n = queue.length;
  const summary = finished >= n ? `Completaste ${n === 1 ? "1 video" : `los ${n} videos`}.` : `Completaste ${finished} de ${n} videos.`;

  return (
    <div className="container-x py-10 sm:py-16">
      <m.div initial={{ opacity: 0, y: RISE.block }} animate={{ opacity: 1, y: 0 }} transition={{ duration: DUR.slow, ease: EASE_OUT }}>
        <p className="label text-ink-muted">Rutina completada · {total} min</p>
        <h1 ref={heading} tabIndex={-1} className="mt-3 font-display text-display-xl focus:outline-none">
          Bien hecho.
        </h1>
        <p className="mt-4 max-w-md text-body-sm leading-relaxed text-ink-muted">
          {summary}
          {finished > 0 && status === "signed-in" && (
            <>
              {" "}
              {finished === 1 ? "Quedó como visto" : "Quedaron como vistos"} en{" "}
              <Link href="/cuenta" className="link text-ink">
                Mi cuenta
              </Link>
              .
            </>
          )}
          {finished > 0 && status === "signed-out" && (
            <>
              {" "}
              Lo guardamos en este dispositivo:{" "}
              <Link href="/cuenta/crear" className="link text-ink">
                crea tu cuenta
              </Link>{" "}
              para no perderlo.
            </>
          )}
        </p>
        <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
          <ButtonLink href="/rutina?last=1" size="lg">
            Repetir o editar
          </ButtonLink>
          <Button variant="outline" size="lg" aria-disabled={isSaved} onClick={() => setSavedName(saveRoutine(routine).name)}>
            {isSaved ? "Guardada en Tus rutinas" : "Guardar esta rutina"}
          </Button>
          <Link href="/movement" className="link-action self-start text-ink sm:ml-2 sm:self-auto">
            Ir a Movement
          </Link>
        </div>
        <p className="sr-only" aria-live="polite">
          {savedName ? `Guardaste «${savedName}» en Tus rutinas.` : ""}
        </p>
      </m.div>

      <section aria-labelledby="para-seguir" className="mt-16 sm:mt-20">
        <h2 id="para-seguir" className="rule pt-4 font-display text-display-lg">
          Para seguir
        </h2>
        <ul className="mt-2 grid gap-x-8 lg:grid-cols-3">
          {med && medVideo && (
            <li className="border-b border-line lg:border-b-0">
              <Link href={`/meditaciones/${med.slug}`} className="group grid grid-cols-[112px_1fr] items-start gap-5 py-5 sm:grid-cols-[140px_1fr]">
                <span className="card-media relative aspect-[4/3] overflow-hidden rounded-media bg-surface-alt">
                  <Image src={medVideo.thumbnail} alt="" fill sizes="(min-width: 640px) 140px, 112px" className="object-cover" style={medVideo.thumbnailFocal ? { objectPosition: medVideo.thumbnailFocal } : undefined} />
                </span>
                <span className="min-w-0">
                  <span className="label block text-ink-muted">Para cerrar</span>
                  <span className="mt-1.5 block font-display text-display-sm transition-colors group-hover:text-accent-ink">{med.title}</span>
                  <span className="mt-1 block text-sm text-ink-muted">Meditación · {med.duration} min</span>
                  <span className="link mt-2 inline-block text-body-sm font-medium">Ver meditación</span>
                </span>
              </Link>
            </li>
          )}
          {wb && (
            <li className="border-b border-line lg:border-b-0">
              <Link href="/workbooks" className="group grid grid-cols-[112px_1fr] items-start gap-5 py-5 sm:grid-cols-[140px_1fr]">
                <span className="card-media relative block overflow-hidden rounded-media bg-surface-alt" style={{ aspectRatio: `${WORKBOOK_COVER.width} / ${WORKBOOK_COVER.height}` }}>
                  <Image src={WORKBOOK_COVER.src} alt="" fill sizes="(min-width: 640px) 140px, 112px" className="object-cover" />
                </span>
                <span className="min-w-0">
                  <span className="label block text-ink-muted">Para escribir</span>
                  <span className="mt-1.5 block font-display text-display-sm transition-colors group-hover:text-accent-ink">{wb.title}</span>
                  <span className="mt-1 block text-sm text-ink-muted">Workbook · {wb.pages} páginas</span>
                  <span className="link mt-2 inline-block text-body-sm font-medium">Ver workbook</span>
                </span>
              </Link>
            </li>
          )}
          <li>
            <a href={latestEpisode.spotifyUrl} target="_blank" rel="noopener noreferrer" className="group grid grid-cols-[112px_1fr] items-start gap-5 py-5 sm:grid-cols-[140px_1fr]">
              <span className="card-media relative aspect-square overflow-hidden rounded-media bg-surface-alt">
                <Image src={PODCAST.cover} alt="" fill sizes="(min-width: 640px) 140px, 112px" className="object-cover" />
              </span>
              <span className="min-w-0">
                <span className="label block text-ink-muted">Para escuchar</span>
                <span className="mt-1.5 block font-display text-display-sm transition-colors group-hover:text-accent-ink">{latestEpisode.title}</span>
                <span className="mt-1 block text-sm text-ink-muted">
                  {PODCAST.title} ·{" "}
                  <span className="whitespace-nowrap">
                    Ep. {latestEpisode.number} · {latestEpisode.durationMin} min
                  </span>
                </span>
                <span className="mt-2 inline-flex items-center gap-1 text-body-sm font-medium">
                  <span className="link">Escuchar en Spotify</span>
                  <NewTabHint />
                </span>
              </span>
            </a>
          </li>
        </ul>
      </section>
    </div>
  );
}
