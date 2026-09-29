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
import { TalkCard } from "@/components/cards/TalkCard";
import { talkBySlug, talks } from "@/content/talks";
import { videoById } from "@/content/videos";
import { instructorById } from "@/content/instructors";
import { TALK_CATEGORIES, labelOf } from "@/content/taxonomies";

export async function generateStaticParams() {
  return talks.map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({ params }: PageProps<"/charlas/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  return { title: talkBySlug(slug)?.title ?? "Charla" };
}

export default async function TalkPage({ params }: PageProps<"/charlas/[slug]">) {
  const { slug } = await params;
  const t = talkBySlug(slug);
  if (!t) notFound();
  const video = videoById(t.videoId);
  const expert = instructorById(t.expertId);
  const related = talks.filter((x) => x.id !== t.id).slice(0, 3);

  return (
    <>
      <section className="container-x pt-4 sm:pt-8">
        <Link href="/charlas" className="label link text-cocoa">← Charlas</Link>
        <div className="grid gap-6 md:grid-cols-[1.4fr_0.6fr] md:gap-8 lg:gap-10">
          <VideoPlayer video={video} title={t.title} contentKey={`talk:${t.id}`} label={`${t.durationMin} min · ${labelOf(TALK_CATEGORIES, t.category)}`} />
          <aside>
            <div className="flex flex-wrap gap-1.5">
              <Badge>{labelOf(TALK_CATEGORIES, t.category)}</Badge>
              <Badge>{t.durationMin} min</Badge>
              <AccessBadge access={t.access} />
            </div>
            <div className="mt-3 flex items-start justify-between gap-3">
              <h1 className="font-display text-3xl leading-[1.05] sm:text-4xl">{t.title}</h1>
              <FavoriteButton itemKey={`talk:${t.id}`} className="bg-cream-deep" />
            </div>
            <p className="mt-3 text-[15px] text-cocoa">{t.description}</p>
            <div className="rule mt-6 pt-4">
              <div className="flex items-center gap-3">
                <span className="relative block h-14 w-14 shrink-0 overflow-hidden rounded-full">
                  <Image src={expert.photo} alt="" fill sizes="56px" className="object-cover" />
                </span>
                <div>
                  <p className="font-medium">{expert.name}</p>
                  <p className="text-sm text-cocoa">{t.specialty}</p>
                </div>
              </div>
              <p className="mt-3 text-sm text-cocoa">{expert.bio}</p>
            </div>
          </aside>
        </div>
      </section>
      <section className="container-x py-12">
        <SectionHeading title="Más charlas" href="/charlas" />
        <Row cols="lg:grid-cols-3">
          {related.map((x) => (
            <TalkCard key={x.id} t={x} size="row" />
          ))}
        </Row>
      </section>
    </>
  );
}
