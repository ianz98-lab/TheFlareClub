"use client";

import { useMemo, useState } from "react";
import type { Course } from "@/content/types";
import { videoById } from "@/content/videos";
import { VideoPlayer } from "@/components/VideoPlayer";
import { KEYS, readLocal, useLocal, writeLocal } from "@/lib/local-store";

type CourseProgress = Record<string, string[]>;
const EMPTY: CourseProgress = {};
const NONE: string[] = [];

/**
 * Lista de módulos/lecciones con progreso (marcar lección completada).
 * Persistencia local por ahora; en Fase 2 → tabla `course_progress`.
 */
export function CourseLessonList({ course }: { course: Course }) {
  const all = useMemo(() => course.modules.flatMap((m) => m.lessons), [course]);
  const progress = useLocal<CourseProgress>(KEYS.courseProgress, EMPTY);
  const done = progress[course.id] ?? NONE;
  const [current, setCurrent] = useState(all[0]?.id);

  const toggle = (id: string) => {
    const map = { ...readLocal<CourseProgress>(KEYS.courseProgress, EMPTY) };
    const cur = map[course.id] ?? [];
    map[course.id] = cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id];
    writeLocal(KEYS.courseProgress, map);
  };

  const pct = all.length ? Math.round((done.length / all.length) * 100) : 0;
  const lesson = all.find((l) => l.id === current) ?? all[0];

  return (
    <div className="mt-8">
      <div className="mb-6 border-t border-espresso pt-3">
        <div className="flex items-baseline justify-between">
          <span className="label text-cocoa">Tu progreso</span>
          <span className="text-[13px] text-cocoa">
            {done.length}/{all.length} lecciones · {pct}%
          </span>
        </div>
        <div className="mt-3 h-px bg-espresso/15">
          <div className="h-full bg-terracotta transition-all" style={{ width: `${pct}%` }} />
        </div>
      </div>

      {lesson && <VideoPlayer key={lesson.id} video={videoById(lesson.videoId)} title={lesson.title} contentKey={`lesson:${course.id}:${lesson.id}`} label={`Lección · ${lesson.durationMin} min`} />}

      <div className="mt-10 space-y-10">
        {course.modules.map((m, mi) => (
          <div key={m.id}>
            <div className="border-t border-espresso pt-3">
              <p className="label text-cocoa">Módulo {mi + 1}</p>
              <h3 className="mt-1 font-display text-3xl leading-tight">{m.title}</h3>
              {m.description && <p className="mt-1 text-[14px] text-cocoa">{m.description}</p>}
            </div>
            <ol className="mt-3">
              {m.lessons.map((l, li) => {
                const isDone = done.includes(l.id);
                const isCurrent = l.id === lesson?.id;
                return (
                  <li key={l.id} className={`rule-soft flex items-center gap-4 py-3 ${isCurrent ? "text-terracotta" : ""}`}>
                    <button
                      type="button"
                      onClick={() => toggle(l.id)}
                      aria-label={isDone ? "Marcar como pendiente" : "Marcar como completada"}
                      className={`flex h-5 w-5 shrink-0 items-center justify-center border text-[11px] transition-colors ${isDone ? "border-terracotta bg-terracotta text-cream" : "border-espresso/40 text-transparent hover:border-espresso"}`}
                    >
                      ✓
                    </button>
                    <button type="button" onClick={() => setCurrent(l.id)} className="flex min-w-0 flex-1 items-baseline justify-between gap-4 text-left">
                      <span className="min-w-0">
                        <span className="block truncate text-[15px]">
                          <span className="label mr-3 text-cocoa">{String(li + 1).padStart(2, "0")}</span>
                          {l.title}
                        </span>
                        {l.resources?.length ? <span className="label mt-1 block text-cocoa">{l.resources.length} recurso{l.resources.length > 1 ? "s" : ""} descargable{l.resources.length > 1 ? "s" : ""}</span> : null}
                      </span>
                      <span className="label shrink-0 text-cocoa">{isCurrent ? "Viendo" : `${l.durationMin} min`}</span>
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
