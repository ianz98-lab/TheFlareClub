import type { Metadata } from "next";
import Image from "next/image";
import { Suspense } from "react";
import { EpisodeRow } from "@/components/cards/EpisodeRow";
import { PodcastLibrary } from "@/components/libraries/PodcastLibrary";
import { Icon } from "@/components/ui/Icon";
import { latestEpisode, PODCAST } from "@/content/podcast";

export const metadata: Metadata = { title: `Podcast · ${PODCAST.title}` };

export default function PodcastPage() {
  return (
    <>
      <section className="bg-sage-soft/70">
        <div className="container-x grid gap-8 py-10 md:grid-cols-[0.8fr_1.2fr] md:items-center lg:py-16">
          <div className="relative mx-auto aspect-square w-full max-w-sm overflow-hidden rounded-3xl shadow-soft">
            <Image src={PODCAST.cover} alt={`Portada del podcast ${PODCAST.title}`} fill priority sizes="400px" className="object-cover" />
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-espresso/40 text-center text-cream">
              <p className="text-xs uppercase tracking-[0.3em]">Podcast</p>
              <p className="font-display text-5xl italic leading-none sm:text-6xl">Decide de Nuevo</p>
              <p className="mt-3 text-xs tracking-[0.2em]">THE FLARE CLUB</p>
            </div>
          </div>
          <div>
            <p className="eyebrow mb-3">Podcast</p>
            <h1 className="font-display text-4xl leading-[1.02] sm:text-5xl lg:text-6xl">{PODCAST.title}</h1>
            <p className="mt-2 text-xl text-cocoa">{PODCAST.tagline}</p>
            <p className="mt-4 max-w-lg text-[15px] text-cocoa">{PODCAST.description}</p>
            <a
              href={PODCAST.spotifyShowUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-6 inline-flex h-12 items-center gap-2 rounded-full bg-espresso px-6 font-medium text-cream shadow-soft hover:bg-cocoa"
            >
              <Icon name="spotify" size={20} className="text-[#1DB954]" /> Escuchar en Spotify
            </a>
            <p className="mt-3 text-xs text-cocoa/80">Los episodios se reproducen en Spotify.</p>
          </div>
        </div>
      </section>

      <section className="container-x py-10">
        <div className="mb-8 overflow-hidden rounded-3xl bg-white/60 p-5 ring-1 ring-sand/60 sm:p-6">
          <p className="eyebrow mb-2">Último episodio</p>
          <EpisodeRow ep={latestEpisode} />
        </div>
        <Suspense>
          <PodcastLibrary />
        </Suspense>
      </section>
    </>
  );
}
