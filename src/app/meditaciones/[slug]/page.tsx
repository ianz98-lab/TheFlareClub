import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { VideoPlayer } from "@/components/VideoPlayer";
import { FavoriteButton } from "@/components/FavoriteButton";
import { Badge, AccessBadge } from "@/components/ui/Badge";
import { Icon } from "@/components/ui/Icon";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Row } from "@/components/Row";
import { MeditationCard } from "@/components/cards/MeditationCard";
import { meditationBySlug, meditations } from "@/content/meditations";
import { videoById } from "@/content/videos";
import { instructorById } from "@/content/instructors";
import { FEELINGS, MOMENTS, labelOf } from "@/content/taxonomies";

export async function generateStaticParams() {
  return meditations.map((m) => ({ slug: m.slug }));
}

export async function generateMetadata({ params }: PageProps<"/meditaciones/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  return { title: meditationBySlug(slug)?.title ?? "Meditación" };
}

export default async function MeditationPage({ params }: PageProps<"/meditaciones/[slug]">) {
  const { slug } = await params;
  const m = meditationBySlug(slug);
  if (!m) notFound();
  const video = videoById(m.videoId);
  const inst = instructorById(m.instructorId);
  const related = meditations.filter((x) => x.id !== m.id && (x.moment === m.moment || x.feelings.some((f) => m.feelings.includes(f)))).slice(0, 4);

  return (
    <>
      <section className="container-x pt-4 sm:pt-8">
        <Link href="/meditaciones" className="mb-3 inline-flex items-center gap-1 text-sm text-cocoa hover:text-espresso">
          <Icon name="arrow" size={16} className="rotate-180" /> Meditaciones
        </Link>
        <div className="grid gap-6 md:grid-cols-[1.4fr_0.6fr] md:gap-8 lg:gap-10">
          <VideoPlayer video={video} title={m.title} contentKey={`meditation:${m.id}`} label={`${m.duration} min · ${labelOf(MOMENTS, m.moment)}`} />
          <aside>
            <div className="flex flex-wrap gap-1.5">
              <Badge tone="sage">{labelOf(MOMENTS, m.moment)}</Badge>
              <Badge>{m.duration} min</Badge>
              <AccessBadge access={m.access} />
            </div>
            <div className="mt-3 flex items-start justify-between gap-3">
              <h1 className="font-display text-3xl leading-[1.05] sm:text-4xl">{m.title}</h1>
              <FavoriteButton itemKey={`meditation:${m.id}`} className="bg-cream-deep" />
            </div>
            <p className="mt-3 text-[15px] text-cocoa">{m.description}</p>
            <div className="mt-4 flex flex-wrap gap-1.5">
              {m.feelings.map((f) => (
                <Link key={f} href={`/meditaciones?feeling=${f}`} className="rounded-full bg-cream-deep px-3 py-1 text-xs font-medium hover:bg-sand">
                  {labelOf(FEELINGS, f)}
                </Link>
              ))}
            </div>
            <div className="mt-5 flex items-center gap-3 rounded-2xl p-2">
              <span className="relative block h-12 w-12 shrink-0 overflow-hidden rounded-full">
                <Image src={inst.photo} alt="" fill sizes="48px" className="object-cover" />
              </span>
              <span>
                <span className="block text-[11px] uppercase tracking-[0.16em] text-cocoa">Guiada por</span>
                <span className="block font-medium">{inst.name}</span>
              </span>
            </div>
            <div className="mt-6 rounded-2xl bg-sage-soft p-4 text-sm">
              <p className="font-medium">Tip</p>
              <p className="mt-1 text-cocoa">Ponte cómoda, baja el brillo y deja el celular boca abajo. Solo escucha.</p>
            </div>
          </aside>
        </div>
      </section>
      <section className="container-x py-12">
        <SectionHeading title="También te puede ayudar" href="/meditaciones" />
        <Row>
          {related.map((x) => (
            <MeditationCard key={x.id} m={x} size="row" />
          ))}
        </Row>
      </section>
    </>
  );
}
