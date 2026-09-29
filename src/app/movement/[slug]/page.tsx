import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { VideoPlayer } from "@/components/VideoPlayer";
import { FavoriteButton } from "@/components/FavoriteButton";
import { AccessBadge, Badge } from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/Button";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Row } from "@/components/Row";
import { ClassCard } from "@/components/cards/ClassCard";
import { classBySlug, classes } from "@/content/classes";
import { videoById } from "@/content/videos";
import { instructorById } from "@/content/instructors";
import { CLASS_TYPES, FOCUS, labelOf } from "@/content/taxonomies";
import { minutes } from "@/lib/format";

const STYLE_LABEL: Record<string, string> = {
  "pilates-flow": "Pilates Flow",
  "pilates-strength": "Pilates Strength",
  barre: "Barre",
  warmup: "Warm Up",
  stretching: "Stretching",
};

export async function generateStaticParams() {
  return classes.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: PageProps<"/movement/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  return { title: classBySlug(slug)?.title ?? "Clase" };
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
    ["Nivel", c.level],
    ["Enfoque", c.focus.map((f) => labelOf(FOCUS, f)).join(", ")],
    ["Equipo", c.equipment.join(", ")],
  ];

  return (
    <>
      <section className="container-x pt-5 sm:pt-8">
        <Link href="/movement" className="label link text-cocoa">
          ← Movement
        </Link>

        <div className="mt-5 grid gap-8 md:grid-cols-[1.5fr_1fr] md:gap-10 lg:gap-16">
          <div>
            <VideoPlayer video={video} title={c.title} contentKey={`class:${c.id}`} label={`${c.duration} min · ${labelOf(CLASS_TYPES, c.type)}`} />

            {warmup && warmupClass && (
              <Link href={`/movement/${warmupClass.slug}`} className="group rule mt-6 grid grid-cols-[88px_1fr] items-center gap-4 pt-4">
                <span className="relative aspect-[4/3] overflow-hidden rounded-xs bg-cream-deep">
                  <Image src={warmup.thumbnail} alt="" fill sizes="100px" className="object-cover" />
                </span>
                <span>
                  <span className="label text-terracotta">Antes de empezar · {minutes(warmup.durationSec)}</span>
                  <span className="mt-1 block font-display text-xl leading-tight group-hover:text-terracotta">{warmupClass.title}</span>
                  <span className="mt-0.5 block text-[13px] text-cocoa">Short de calentamiento compartido con otras clases.</span>
                </span>
              </Link>
            )}
          </div>

          <aside>
            <div className="flex items-center gap-3">
              <Badge tone="rose">{STYLE_LABEL[c.style]}</Badge>
              {c.isNew && <Badge tone="terracotta">Nuevo</Badge>}
              <AccessBadge access={c.access} />
            </div>
            <div className="mt-3 flex items-start justify-between gap-4">
              <h1 className="font-display text-4xl leading-[1] sm:text-5xl">{c.title}</h1>
              <FavoriteButton itemKey={`class:${c.id}`} className="border border-espresso/15" />
            </div>
            <p className="mt-4 text-[15px] leading-relaxed text-cocoa">{c.description}</p>

            <dl className="mt-6 border-t border-espresso">
              {facts.map(([k, v]) => (
                <div key={k} className="rule-soft grid grid-cols-[110px_1fr] gap-4 py-3 text-[14px] first:border-0">
                  <dt className="label text-cocoa">{k}</dt>
                  <dd>{v}</dd>
                </div>
              ))}
            </dl>

            <Link href="/nosotras" className="rule-soft flex items-center gap-3 py-4">
              <span className="relative block h-11 w-11 shrink-0 overflow-hidden rounded-full">
                <Image src={inst.photo} alt="" fill sizes="44px" className="object-cover" />
              </span>
              <span>
                <span className="label block text-cocoa">Con</span>
                <span className="block text-[15px]">{inst.name}</span>
              </span>
            </Link>

            {c.access === "member" && (
              <div className="rule pt-5">
                <p className="text-[14px] text-cocoa">Esta clase es parte de la membresía. Prueba siete días gratis y accede a toda la biblioteca.</p>
                <ButtonLink href="/membresia" variant="outline" size="sm" className="mt-4">
                  Ver planes
                </ButtonLink>
              </div>
            )}
          </aside>
        </div>
      </section>

      <section className="container-x mt-20 sm:mt-28">
        <SectionHeading title="Sigue con" href="/movement" />
        <Row>
          {related.map((x) => (
            <ClassCard key={x.id} c={x} size="row" />
          ))}
        </Row>
      </section>
    </>
  );
}
