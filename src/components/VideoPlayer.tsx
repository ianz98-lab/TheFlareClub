"use client";

import Image from "next/image";
import { useState } from "react";
import type { Video } from "@/content/types";
import { embedUrl } from "@/lib/video";
import { Icon } from "@/components/ui/Icon";
import { minutes } from "@/lib/format";
import { KEYS, readLocal, useLocal, writeLocal, type ProgressMap } from "@/lib/local-store";

const EMPTY: ProgressMap = {};

/**
 * Player embebido (Vimeo/YouTube). Poster limpio con botón de play grande.
 * "Continuar viendo": guarda un marcador local; en Fase 2 se usa el Player SDK
 * de Vimeo para guardar el segundo exacto en `watch_progress`.
 */
export function VideoPlayer({ video, title, contentKey, label }: { video: Video; title: string; contentKey: string; label?: string }) {
  const [playing, setPlaying] = useState(false);
  const progress = useLocal<ProgressMap>(KEYS.progress, EMPTY);
  const p = progress[contentKey];
  const resume = p && p.pct > 5 && p.pct < 95 ? p.pct : null;

  const start = () => {
    setPlaying(true);
    const map = { ...readLocal<ProgressMap>(KEYS.progress, EMPTY) };
    map[contentKey] = { at: Date.now(), pct: Math.max(map[contentKey]?.pct ?? 0, 10) };
    writeLocal(KEYS.progress, map);
  };

  return (
    <div>
      <div className="relative aspect-video w-full overflow-hidden rounded-xs bg-espresso">
        {playing ? (
          <iframe src={embedUrl(video, true)} title={title} className="absolute inset-0 h-full w-full" allow="autoplay; fullscreen; picture-in-picture" allowFullScreen />
        ) : (
          <button type="button" onClick={start} className="group absolute inset-0 h-full w-full" aria-label={`Reproducir ${title}`}>
            <Image src={video.thumbnail} alt="" fill sizes="(min-width: 1024px) 900px, 100vw" className="object-cover" priority />
            <span className="absolute left-1/2 top-1/2 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-cream text-espresso transition-transform group-hover:scale-105 sm:h-20 sm:w-20">
              <Icon name="play" size={26} className="ml-1" />
            </span>
            {resume && (
              <span className="absolute inset-x-0 bottom-0 h-0.5 bg-cream/30">
                <span className="block h-full bg-terracotta" style={{ width: `${resume}%` }} />
              </span>
            )}
          </button>
        )}
      </div>
      <div className="mt-3 flex items-center justify-between text-cocoa">
        <p className="label">{label}</p>
        <p className="label">{resume ? `Continuar · ${resume}%` : label ? "" : minutes(video.durationSec)}</p>
      </div>
    </div>
  );
}
