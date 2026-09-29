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
 * Player embebido (Vimeo/YouTube). Muestra poster + botón grande de play
 * (pensado para tocar con el pie o la mano mientras estás en el mat).
 * "Continuar viendo": guarda un marcador local; en Fase 2 se usa el Player SDK
 * de Vimeo para guardar el segundo exacto en `watch_progress`.
 */
export function VideoPlayer({
  video,
  title,
  contentKey,
  label,
}: {
  video: Video;
  title: string;
  contentKey: string;
  label?: string;
}) {
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
    <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-espresso shadow-soft sm:rounded-3xl">
      {playing ? (
        <iframe
          src={embedUrl(video, true)}
          title={title}
          className="absolute inset-0 h-full w-full"
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
        />
      ) : (
        <button type="button" onClick={start} className="group absolute inset-0 h-full w-full text-left" aria-label={`Reproducir ${title}`}>
          <Image
            src={video.thumbnail}
            alt=""
            fill
            sizes="(min-width: 1024px) 900px, 100vw"
            className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-espresso/70 via-espresso/10 to-transparent" />
          {label && (
            <span className="absolute left-4 top-4 rounded-full bg-cream/90 px-3 py-1 text-xs font-medium text-espresso backdrop-blur">
              {label}
            </span>
          )}
          <span className="absolute left-1/2 top-1/2 flex h-[76px] w-[76px] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-cream text-espresso shadow-soft transition-transform group-hover:scale-105 group-active:scale-95">
            <Icon name="play" size={30} className="ml-1" />
          </span>
          <div className="absolute inset-x-4 bottom-4 flex items-end justify-between gap-3 text-cream">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-cream/80">{resume ? `Continuar · ${resume}%` : "Reproducir"}</p>
              <p className="font-display text-xl leading-tight sm:text-2xl">{title}</p>
            </div>
            <span className="flex items-center gap-1 rounded-full bg-cream/20 px-2.5 py-1 text-xs backdrop-blur">
              <Icon name="clock" size={13} /> {minutes(video.durationSec)}
            </span>
          </div>
          {resume && (
            <div className="absolute inset-x-0 bottom-0 h-1 bg-cream/20">
              <div className="h-full bg-terracotta" style={{ width: `${resume}%` }} />
            </div>
          )}
        </button>
      )}
    </div>
  );
}
