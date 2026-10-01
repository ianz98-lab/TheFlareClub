import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { VideoPlayer } from "@/components/VideoPlayer";
import { FavoriteButton } from "@/components/FavoriteButton";
import { MemberUpsell } from "@/components/MemberUpsell";
import { AccessBadge, Badge } from "@/components/ui/Badge";
import { Icon } from "@/components/ui/Icon";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Row } from "@/components/Row";
import { ClassCard } from "@/components/cards/ClassCard";
import { classBySlug, classes } from "@/content/classes";
import { videoById } from "@/content/videos";
import { instructorById } from "@/content/instructors";
import { FOCUS, labelOf } from "@/content/taxonomies";
import { minutes } from "@/lib/format";
import { CLASS_STYLE_LABEL, CLASS_TYPE_SINGULAR, LEVEL_LABEL } from "@/lib/movement";
import { pageMetadata } from "@/lib/seo";

export async function generateStaticParams() {
  return classes.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: PageProps<"/movement/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const c = classBySlug(slug);
  if (!c) return { title: "Clase" };
  // Al compartir, el póster de la clase
  return pageMetadata({ title: c.title, description: c.description, path: `/movement/${c.slug}`, image: videoById(c.videoId).thumbnail });
}

export default async function ClassPage({ params }: PageProps<"/movement/[slug]">) {
  const { slug } = await params;
  const c = classBySlug(slug);
  if (!c) notFound();

  const video = videoById(c.videoId);
  const warmup = c.warmupVideoId ? videoById(c.warmupVideoId) : null;
  const warmupClass = warmup ? classes.find((x) => x.videoId === warmup.id) : null;
  const inst = instructorById(c.instructorId);
  const related = classes.filter((x) => x.id !== c.id && x.type !== "warmup" && (x.type === c.type || x.focus.some((f) => c.focus.includes(f)))).slice(0, 4);

  const facts: [string, string][] = [
    ["Duración", `${c.duration} min`],
    ["Nivel", LEVEL_LABEL[c.level]],
    ["Enfoque", c.focus.map((f) => labelOf(FOCUS, f)).join(", ")],
    ["Equipo", c.equipment.join(", ")],
  ];

  return (
    <>
      <section className="container-x pt-3 sm:pt-6">
        <Link href="/movement" className="link-action text-ink-muted">
          <Icon name="arrow-left" size={16} />
          Movement
        </Link>

        {/* Una columna hasta lg: en tablet vertical el video ocupa todo el ancho. minmax(0,…): un título largo en
            Gloock (o la letra agrandada) no ensancha la columna */}
        <div className="mt-3 grid grid-cols-[minmax(0,1fr)] gap-8 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)] lg:gap-12 xl:gap-16">
          <div>
            <VideoPlayer video={video} title={c.title} contentKey={`class:${c.id}`} label={`${c.duration} min · ${CLASS_TYPE_SINGULAR[c.type]}`} />

            {warmup && warmupClass && (
              <Link href={`/movement/${warmupClass.slug}`} className="group rule mt-6 grid grid-cols-[88px_1fr] items-center gap-4 pt-4">
                <span className="card-media relative aspect-[4/3] overflow-hidden rounded-media bg-surface-alt">
                  <Image src={warmup.thumbnail} alt="" fill sizes="88px" className="object-cover" style={warmup.thumbnailFocal ? { objectPosition: warmup.thumbnailFocal } : undefined} />
                </span>
                <span className="min-w-0">
                  <span className="label text-ink-muted">Antes de empezar · {minutes(warmup.durationSec)}</span>
                  <span className="mt-1 block font-display text-display-sm transition-colors group-hover:text-accent-ink">{warmupClass.title}</span>
                  <span className="mt-0.5 block text-sm text-ink-muted">Para activar el cuerpo antes de la clase.</span>
                </span>
              </Link>
            )}
          </div>

          {/* div y no aside: dentro de <main> un complementary anidado es un landmark de más (axe) */}
          <div>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <Badge>{CLASS_STYLE_LABEL[c.style]}</Badge>
              {c.isNew && <Badge tone="accent">Nuevo</Badge>}
              <AccessBadge access={c.access} />
            </div>
            <div className="mt-3 flex items-start justify-between gap-4">
              <h1 className="min-w-0 font-display text-display-xl lg:text-display-lg">{c.title}</h1>
              <FavoriteButton itemKey={`class:${c.id}`} title={c.title} framed />
            </div>
            <p className="mt-4 text-body-sm leading-relaxed text-ink-muted">{c.description}</p>

            <dl className="mt-6 border-t border-ink">
              {facts.map(([k, v]) => (
                <div key={k} className="rule-soft grid grid-cols-[110px_1fr] gap-4 py-3 text-sm first:border-0">
                  <dt className="label text-ink-muted">{k}</dt>
                  <dd>{v}</dd>
                </div>
              ))}
            </dl>

            <Link href="/sobre-nosotras" className="group rule-soft flex items-center gap-3 py-4">
              <span className="relative block h-12 w-12 shrink-0 overflow-hidden rounded-media bg-surface-alt">
                <Image src={inst.photo} alt="" fill sizes="48px" className="object-cover" />
              </span>
              <span>
                <span className="label block text-ink-muted">Con</span>
                <span className="block text-body-sm font-medium transition-colors group-hover:text-accent-ink">{inst.name}</span>
              </span>
            </Link>

            {/* Solo a quien aún no tiene membresía (se decide en el cliente) */}
            {c.access === "member" && <MemberUpsell noun="clase" />}
          </div>
        </div>
      </section>

      {related.length > 0 && (
        <section className="container-x mt-20 sm:mt-28">
          {/* display-md: el H2 queda claramente por debajo del H1 de la clase */}
          <SectionHeading size="md" title="Sigue con" href="/movement" />
          <Row>
            {related.map((x) => (
              <ClassCard key={x.id} c={x} size="row" />
            ))}
          </Row>
        </section>
      )}
    </>
  );
}
