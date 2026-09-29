import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { EpisodeRow } from "@/components/cards/EpisodeRow";
import { Icon } from "@/components/ui/Icon";
import { episodes, latestEpisode, PODCAST } from "@/content/podcast";
import { PODCAST_CATEGORIES } from "@/content/taxonomies";
import type { PodcastCategory } from "@/content/types";

export const metadata: Metadata = { title: `Podcast · ${PODCAST.title}` };

export default async function PodcastPage({ searchParams }: PageProps<"/podcast">) {
  const sp = await searchParams;
  const cat = typeof sp.cat === "string" ? (sp.cat as PodcastCategory) : undefined;
  const items = cat ? episodes.filter((e) => e.category === cat) : episodes;

  return (
    <>
      <section className="bg-sage-soft/70">
        <div className="container-x grid gap-8 py-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-center lg:py-16">
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

        <div className="scroll-row -mx-4 px-4 sm:mx-0 sm:flex-wrap sm:px-0">
          <Link href="/podcast" className={`h-9 shrink-0 rounded-full border px-3.5 text-[13px] font-medium leading-9 ${!cat ? "border-espresso bg-espresso text-cream" : "border-sand"}`}>
            Todos
          </Link>
          {PODCAST_CATEGORIES.map((c) => (
            <Link key={c.value} href={`/podcast?cat=${c.value}`} className={`h-9 shrink-0 rounded-full border px-3.5 text-[13px] font-medium leading-9 ${cat === c.value ? "border-espresso bg-espresso text-cream" : "border-sand"}`}>
              {c.label}
            </Link>
          ))}
        </div>

        <div className="mt-6 divide-y divide-sand/50">
          {items.map((e) => (
            <div key={e.id} className="py-2">
              <EpisodeRow ep={e} />
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
