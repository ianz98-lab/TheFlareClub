"use client";

import { useMemo, useState } from "react";
import type { Course } from "@/content/types";
import { videoById } from "@/content/videos";
import { VideoPlayer } from "@/components/VideoPlayer";
import { Icon } from "@/components/ui/Icon";
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
    <div className="mt-6">
      <div className="mb-5 rounded-2xl bg-cream-deep p-4">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium">Tu progreso</span>
          <span className="text-cocoa">{done.length}/{all.length} lecciones · {pct}%</span>
        </div>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-sand/70">
          <div className="h-full rounded-full bg-terracotta transition-all" style={{ width: `${pct}%` }} />
        </div>
      </div>

      {lesson && (
        <VideoPlayer
          key={lesson.id}
          video={videoById(lesson.videoId)}
          title={lesson.title}
          contentKey={`lesson:${course.id}:${lesson.id}`}
          label={`Lección · ${lesson.durationMin} min`}
        />
      )}

      <div className="mt-6 space-y-4">
        {course.modules.map((m, mi) => (
          <div key={m.id} className="overflow-hidden rounded-3xl bg-white/60 ring-1 ring-sand/60">
            <div className="border-b border-sand/50 px-4 py-3 sm:px-5">
              <p className="eyebrow">Módulo {mi + 1}</p>
              <h3 className="font-display text-2xl leading-tight">{m.title}</h3>
              {m.description && <p className="mt-0.5 text-sm text-cocoa">{m.description}</p>}
            </div>
            <ul>
              {m.lessons.map((l, li) => {
                const isDone = done.includes(l.id);
                const isCurrent = l.id === lesson?.id;
                return (
                  <li key={l.id} className={`flex items-center gap-3 px-3 py-2.5 sm:px-4 ${isCurrent ? "bg-sky-soft/60" : ""}`}>
                    <button
                      type="button"
                      onClick={() => toggle(l.id)}
                      aria-label={isDone ? "Marcar como pendiente" : "Marcar como completada"}
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border transition-colors ${
                        isDone ? "border-terracotta bg-terracotta text-cream" : "border-sand text-transparent hover:border-espresso"
                      }`}
                    >
                      <Icon name="check" size={16} />
                    </button>
                    <button type="button" onClick={() => setCurrent(l.id)} className="flex min-w-0 flex-1 items-center justify-between gap-3 text-left">
                      <span className="min-w-0">
                        <span className="block truncate text-[15px] font-medium">{li + 1}. {l.title}</span>
                        {l.resources?.length ? (
                          <span className="mt-0.5 flex items-center gap-1 text-xs text-terracotta">
                            <Icon name="download" size={13} /> {l.resources.length} recurso{l.resources.length > 1 ? "s" : ""}
                          </span>
                        ) : null}
                      </span>
                      <span className="flex shrink-0 items-center gap-1 text-xs text-cocoa">
                        <Icon name={isCurrent ? "play" : "clock"} size={13} /> {l.durationMin} min
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
