"use client";

import { useMemo, useRef, useState } from "react";
import type { Course } from "@/content/types";
import { videoById } from "@/content/videos";
import { VideoPlayer } from "@/components/VideoPlayer";
import { Icon } from "@/components/ui/Icon";
import { prefersReducedMotion } from "@/lib/motion";
import { isCompleted, markCompleted, useHistory } from "@/lib/user-data";

const lessonKey = (courseId: string, lessonId: string) => `lesson:${courseId}:${lessonId}`;

/**
 * Módulos y lecciones con progreso. Una lección "completada" es la misma marca de historial
 * que usa el player (`lesson:<curso>:<lección>` en src/lib/user-data.ts), así el check de la
 * lista, el "Ya la vi" del video y "Videos que ya viste" en Mi cuenta van sincronizados.
 */
export function CourseLessonList({ course }: { course: Course }) {
  const all = useMemo(() => course.modules.flatMap((m) => m.lessons), [course]);
  const history = useHistory();
  const [current, setCurrent] = useState(all[0]?.id);
  const player = useRef<HTMLDivElement>(null);

  const isDone = (lessonId: string) => isCompleted(history, lessonKey(course.id, lessonId));
  const doneCount = all.filter((l) => isDone(l.id)).length;
  const pct = all.length ? Math.round((doneCount / all.length) * 100) : 0;
  const lesson = all.find((l) => l.id === current) ?? all[0];

  const choose = (id: string) => {
    setCurrent(id);
    // En el celular la lista queda debajo del video: subir para verlo.
    const el = player.current;
    if (el && el.getBoundingClientRect().top < 0) el.scrollIntoView({ behavior: prefersReducedMotion() ? "auto" : "smooth", block: "start" });
  };

  return (
    <div className="mt-8">
      <div className="rule mb-6 pt-3">
        <div className="flex items-baseline justify-between gap-4">
          <span className="label text-ink-muted">Tu progreso</span>
          <span className="text-sm text-ink-muted">
            {doneCount}/{all.length} lecciones · {pct}%
          </span>
        </div>
        {/* scaleX y no width: la barra avanza sin recalcular el layout */}
        <div className="mt-3 h-px overflow-hidden bg-line" aria-hidden="true">
          <div
            className="h-full origin-left bg-accent transition-transform duration-(--duration-slow) ease-out-quint motion-reduce:transition-none"
            style={{ transform: `scaleX(${pct / 100})` }}
          />
        </div>
      </div>

      {/* El scroll-padding global ya deja libre el header al subir aquí */}
      <div ref={player}>
        {lesson && (
          <VideoPlayer
            key={lesson.id}
            video={videoById(lesson.videoId)}
            title={lesson.title}
            contentKey={lessonKey(course.id, lesson.id)}
            label={`Lección · ${lesson.durationMin} min`}
          />
        )}
      </div>

      <div className="mt-10 space-y-10">
        {course.modules.map((m, mi) => (
          <div key={m.id}>
            <div className="rule pt-3">
              <p className="label text-ink-muted">Módulo {mi + 1}</p>
              <h3 className="mt-1 font-display text-display-md">{m.title}</h3>
              {m.description && <p className="mt-1 text-sm text-ink-muted">{m.description}</p>}
            </div>
            <ol className="mt-2">
              {m.lessons.map((l, li) => {
                const done = isDone(l.id);
                const isCurrent = l.id === lesson?.id;
                return (
                  <li key={l.id} className={`rule-soft flex items-center gap-2 ${isCurrent ? "text-accent-ink" : ""}`}>
                    <button
                      type="button"
                      onClick={() => markCompleted(lessonKey(course.id, l.id), !done)}
                      aria-pressed={done}
                      aria-label={`Marcar «${l.title}» como completada`}
                      className="group -ml-3 flex h-11 w-11 shrink-0 items-center justify-center"
                    >
                      <span
                        className={`flex h-5 w-5 items-center justify-center border transition-colors ${done ? "border-ink bg-ink text-on-ink" : "border-line-input group-hover:border-ink group-active:bg-press"}`}
                      >
                        {done && <Icon name="check" size={14} strokeWidth={2} />}
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => choose(l.id)}
                      aria-current={isCurrent ? "true" : undefined}
                      className="flex min-h-11 min-w-0 flex-1 items-baseline justify-between gap-4 py-3 text-left"
                    >
                      <span className="min-w-0">
                        <span className="block text-body-sm leading-snug">
                          <span className="label mr-3 text-ink-muted">{String(li + 1).padStart(2, "0")}</span>
                          {l.title}
                        </span>
                        {l.resources?.length ? (
                          <span className="label mt-1 block text-ink-muted">
                            {l.resources.length} {l.resources.length > 1 ? "recursos descargables" : "recurso descargable"}
                          </span>
                        ) : null}
                      </span>
                      <span className={`label shrink-0 ${isCurrent ? "" : "text-ink-muted"}`}>{isCurrent ? "Viendo" : `${l.durationMin} min`}</span>
                    </button>
                  </li>
                );
              })}
            </ol>
          </div>
        ))}
      </div>
    </div>
  );
}
