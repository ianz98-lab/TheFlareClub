import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { VideoPlayer } from "@/components/VideoPlayer";
import { FavoriteButton } from "@/components/FavoriteButton";
import { Badge, AccessBadge } from "@/components/ui/Badge";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Row } from "@/components/Row";
import { TalkCard } from "@/components/cards/TalkCard";
import { publishedTalks, talks } from "@/content/talks";
import { videoById } from "@/content/videos";
import { instructorById } from "@/content/instructors";
import { TALK_CATEGORIES, labelOf } from "@/content/taxonomies";
import { pageMetadata } from "@/lib/seo";

/**
 * Detalle de una charla. Solo existen las publicadas: las de muestra del prototipo responden 404
 * (pedido de las fundadoras: "quitar todo lo de la página"). Por ahora no se indexan.
 */
const publishedBySlug = (slug: string) => publishedTalks.find((t) => t.slug === slug);

export async function generateStaticParams() {
  // El export estático exige al menos una ruta: mientras no haya ninguna publicada se genera una
  // de muestra, que responde 404 igual que cualquier otra no publicada.
  const list = publishedTalks.length > 0 ? publishedTalks : talks.slice(0, 1);
  return list.map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({ params }: PageProps<"/charlas/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const t = publishedBySlug(slug);
  if (!t) return { title: "Charla", robots: { index: false } };
  return {
    ...pageMetadata({ title: t.title, description: t.description, path: `/charlas/${t.slug}`, image: videoById(t.videoId).thumbnail, type: "article" }),
    robots: { index: false },
  };
}

export default async function TalkPage({ params }: PageProps<"/charlas/[slug]">) {
  const { slug } = await params;
  const t = publishedBySlug(slug);
  if (!t) notFound();
  const video = videoById(t.videoId);
  const expert = instructorById(t.expertId);
  const category = labelOf(TALK_CATEGORIES, t.category);
  const related = publishedTalks.filter((x) => x.id !== t.id).slice(0, 3);

  return (
    <>
      <section className="container-x pb-12 pt-4 sm:pb-16 sm:pt-8">
        <Link href="/charlas" className="link-action text-ink-muted">
          <span aria-hidden="true">←</span> Charlas
        </Link>
        {/* Una sola columna hasta lg: en tablet vertical el video quedaba a la mitad del ancho. minmax(0,…): un
            título largo en Gloock (o la letra agrandada) no ensancha la columna */}
        <div className="mt-2 grid grid-cols-[minmax(0,1fr)] gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,0.6fr)] lg:gap-10">
          <VideoPlayer video={video} title={t.title} contentKey={`talk:${t.id}`} label={`${t.durationMin} min · ${category}`} />
          {/* div y no aside: dentro de <main> un complementary anidado es un landmark de más (axe) */}
          <div>
            <div className="flex flex-wrap gap-x-4 gap-y-1.5">
              <Badge>{category}</Badge>
              <Badge>{t.durationMin} min</Badge>
              <AccessBadge access={t.access} />
            </div>
            <div className="mt-3 flex items-start justify-between gap-3">
              {/* Junto al video (desde lg, en una columna angosta) baja un paso para no partirse en muchas líneas */}
              <h1 className="min-w-0 font-display text-display-lg lg:text-display-md">{t.title}</h1>
              <FavoriteButton itemKey={`talk:${t.id}`} title={t.title} tone="surface-alt" />
            </div>
            <p className="mt-3 max-w-[65ch] text-body-sm leading-relaxed text-ink-muted">{t.description}</p>
            <div className="rule mt-6 pt-4">
              <div className="flex items-center gap-3">
                <span className="relative block h-12 w-12 shrink-0 overflow-hidden rounded-media bg-surface-alt">
                  <Image src={expert.photo} alt="" fill sizes="48px" className="object-cover" />
                </span>
                <div>
                  {expert.founder ? (
                    <Link href="/sobre-nosotras" className="link font-medium">
                      {expert.name}
                    </Link>
                  ) : (
                    <p className="font-medium">{expert.name}</p>
                  )}
                  <p className="text-sm text-ink-muted">{t.specialty}</p>
                </div>
              </div>
              <p className="mt-3 max-w-[65ch] text-sm leading-relaxed text-ink-muted">{expert.bio}</p>
            </div>
          </div>
        </div>
      </section>

      {related.length > 0 && (
        <section className="container-x pb-12 sm:pb-16">
          <SectionHeading size="md" title="Más charlas" href="/charlas" />
          <Row cols="lg:grid-cols-3">
            {related.map((x) => (
              <TalkCard key={x.id} t={x} size="row" />
            ))}
          </Row>
        </section>
      )}
    </>
  );
}
