import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { VideoPlayer } from "@/components/VideoPlayer";
import { FavoriteButton } from "@/components/FavoriteButton";
import { MemberUpsell } from "@/components/MemberUpsell";
import { AccessBadge } from "@/components/ui/Badge";
import { Icon } from "@/components/ui/Icon";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Row } from "@/components/Row";
import { MeditationCard } from "@/components/cards/MeditationCard";
import { meditationBySlug, meditations } from "@/content/meditations";
import { videoById } from "@/content/videos";
import { instructorById } from "@/content/instructors";
import { FEELINGS, MOMENTS, labelOf } from "@/content/taxonomies";
import { pageMetadata } from "@/lib/seo";

export async function generateStaticParams() {
  return meditations.map((m) => ({ slug: m.slug }));
}

export async function generateMetadata({ params }: PageProps<"/meditaciones/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const m = meditationBySlug(slug);
  if (!m) return { title: "Meditación" };
  // Al compartir, el póster de la meditación
  return pageMetadata({ title: m.title, description: m.description, path: `/meditaciones/${m.slug}`, image: videoById(m.videoId).thumbnail });
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
      <section className="container-x pt-3 sm:pt-6">
        <Link href="/meditaciones" className="link-action text-ink-muted">
          <Icon name="arrow-left" size={16} />
          Meditaciones
        </Link>
        {/* Una columna hasta lg: en tablet vertical el video ocupa todo el ancho. minmax(0,…): un título largo en
            Gloock (o la letra agrandada) no ensancha la columna */}
        <div className="mt-3 grid grid-cols-[minmax(0,1fr)] gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,0.6fr)] lg:gap-10">
          <VideoPlayer video={video} title={m.title} contentKey={`meditation:${m.id}`} label={`${m.duration} min · ${labelOf(MOMENTS, m.moment)}`} />
          {/* div y no aside: dentro de <main> un complementary anidado es un landmark de más (axe) */}
          <div>
            {/* Momento y duración ya van bajo el player: aquí solo el acceso (Gratis) si aplica */}
            <AccessBadge access={m.access} />
            <div className="mt-2 flex items-start justify-between gap-3">
              <h1 className="min-w-0 font-display text-display-xl lg:text-display-lg">{m.title}</h1>
              <FavoriteButton itemKey={`meditation:${m.id}`} title={m.title} framed />
            </div>
            <p className="mt-3 text-body-sm leading-relaxed text-ink-muted">{m.description}</p>
            {/* Cada sentimiento lleva a las meditaciones con ese filtro puesto */}
            <div className="mt-3 flex flex-wrap gap-x-5">
              {m.feelings.map((f) => (
                <Link key={f} href={`/meditaciones?feeling=${f}`} className="link-action">
                  {labelOf(FEELINGS, f)}
                </Link>
              ))}
            </div>
            <Link href="/sobre-nosotras" className="group rule-soft mt-2 flex items-center gap-3 py-4">
              <span className="relative block h-12 w-12 shrink-0 overflow-hidden rounded-media bg-surface-alt">
                <Image src={inst.photo} alt="" fill sizes="48px" className="object-cover" />
              </span>
              <span>
                <span className="label block text-ink-muted">Guiada por</span>
                <span className="block text-body-sm font-medium transition-colors group-hover:text-accent-ink">{inst.name}</span>
              </span>
            </Link>
            {/* La indicación va en la itálica real de Hanken (italic-accent: se carga aparte, sin precarga), sin
                filete: una voz baja, no otro bloque */}
            <p className="max-w-sm text-body-sm italic-accent leading-relaxed text-ink-muted">Ponte cómoda, baja el brillo y deja el celular boca abajo. Solo escucha.</p>
            {m.access === "member" && <MemberUpsell noun="meditación" className="mt-8" />}
          </div>
        </div>
      </section>
      {related.length > 0 && (
        <section className="container-x mt-20 pb-12 sm:mt-28">
          {/* display-md: el H2 queda claramente por debajo del H1 de la meditación */}
          <SectionHeading size="md" title="También te puede ayudar" href="/meditaciones" />
          <Row>
            {related.map((x) => (
              <MeditationCard key={x.id} m={x} size="row" />
            ))}
          </Row>
        </section>
      )}
    </>
  );
}
