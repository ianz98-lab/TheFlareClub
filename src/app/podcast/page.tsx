import type { Metadata } from "next";
import Image from "next/image";
import { Suspense } from "react";
import { EpisodeRow } from "@/components/cards/EpisodeRow";
import { PodcastLibrary } from "@/components/libraries/PodcastLibrary";
import { latestEpisode, PODCAST } from "@/content/podcast";

export const metadata: Metadata = { title: `Podcast · ${PODCAST.title}` };

export default function PodcastPage() {
  return (
    <>
      <section className="bg-sage-soft md:grid md:grid-cols-2">
        <div className="container-x flex flex-col justify-end py-10 md:py-16 lg:py-24">
          <p className="label text-cocoa">Podcast · por {PODCAST.host}</p>
          <h1 className="mt-3 font-display text-6xl leading-[0.95] sm:text-7xl lg:text-8xl">{PODCAST.title}</h1>
          <p className="mt-6 max-w-md text-[15px] leading-relaxed text-cocoa sm:text-base">{PODCAST.description}</p>
          <a href={PODCAST.spotifyShowUrl} target="_blank" rel="noreferrer" className="label mt-8 inline-flex h-12 items-center self-start bg-espresso px-6 text-cream transition-colors hover:bg-terracotta">
            Escuchar en Spotify
          </a>
        </div>
        <div className="relative aspect-square md:aspect-auto md:min-h-[480px]">
          <Image src={PODCAST.cover} alt={`${PODCAST.title}, podcast de ${PODCAST.host}`} fill priority sizes="(min-width: 768px) 50vw, 100vw" className="object-cover" />
        </div>
      </section>

      <section className="container-x mt-14 sm:mt-20">
        <p className="label border-t border-espresso pt-4 text-cocoa">Último episodio</p>
        <EpisodeRow ep={latestEpisode} />
      </section>

      <section className="container-x mt-14 sm:mt-20">
        <p className="label border-t border-espresso pt-4 text-cocoa">Todos los episodios</p>
        <div className="mt-4">
          <Suspense>
            <PodcastLibrary />
          </Suspense>
        </div>
        <p className="mt-8 text-[13px] text-cocoa">Los episodios se reproducen en Spotify.</p>
      </section>
    </>
  );
}
