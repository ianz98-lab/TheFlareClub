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
import { ClassCard } from "@/components/cards/ClassCard";
import { classBySlug, classes } from "@/content/classes";
import { videoById } from "@/content/videos";
import { instructorById } from "@/content/instructors";
import { CLASS_TYPES, FOCUS, labelOf } from "@/content/taxonomies";
import { minutes } from "@/lib/format";

export async function generateStaticParams() {
  return classes.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: PageProps<"/movement/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const c = classBySlug(slug);
  return { title: c?.title ?? "Clase" };
}

export default async function ClassPage({ params }: PageProps<"/movement/[slug]">) {
  const { slug } = await params;
  const c = classBySlug(slug);
  if (!c) notFound();

  const video = videoById(c.videoId);
  const warmup = c.warmupVideoId ? videoById(c.warmupVideoId) : null;
  const warmupClass = warmup ? classes.find((x) => x.videoId === warmup.id) : null;
  const inst = instructorById(c.instructorId);
  const related = classes
    .filter((x) => x.id !== c.id && x.type !== "warmup" && (x.type === c.type || x.focus.some((f) => c.focus.includes(f))))
    .slice(0, 4);

  const STYLE_LABEL: Record<string, string> = {
    "pilates-flow": "Pilates Flow",
    "pilates-strength": "Pilates Strength",
    barre: "Barre",
    warmup: "Warm Up",
    stretching: "Stretching",
  };

  return (
    <>
      <section className="container-x pt-4 sm:pt-8">
        <Link href="/movement" className="mb-3 inline-flex items-center gap-1 text-sm text-cocoa hover:text-espresso">
          <Icon name="arrow" size={16} className="rotate-180" /> Movement
        </Link>
        <div className="grid gap-6 md:grid-cols-[1.4fr_0.6fr] md:gap-8 lg:gap-10">
          <div>
            <VideoPlayer video={video} title={c.title} contentKey={`class:${c.id}`} label={`${c.duration} min · ${labelOf(CLASS_TYPES, c.type)}`} />

            {/* Warm-up compartido */}
            {warmup && warmupClass && (
              <div className="mt-4 flex items-center gap-4 rounded-2xl bg-sand-light p-3 sm:p-4">
                <Link href={`/movement/${warmupClass.slug}`} className="relative h-16 w-24 shrink-0 overflow-hidden rounded-xl">
                  <Image src={warmup.thumbnail} alt="" fill sizes="100px" className="object-cover" />
                  <span className="absolute inset-0 flex items-center justify-center bg-espresso/30 text-cream">
                    <Icon name="play" size={18} />
                  </span>
                </Link>
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] uppercase tracking-[0.16em] text-terracotta">Antes de empezar · {minutes(warmup.durationSec)}</p>
                  <p className="truncate font-display text-lg leading-tight">{warmupClass.title}</p>
                  <p className="text-xs text-cocoa">Short de calentamiento compartido para esta clase.</p>
                </div>
                <Link href={`/movement/${warmupClass.slug}`} className="hidden text-sm font-medium text-espresso sm:block">
                  Ver
                </Link>
              </div>
            )}
          </div>

          <aside>
            <div className="flex flex-wrap gap-1.5">
              <Badge tone="rose">{STYLE_LABEL[c.style]}</Badge>
              <Badge>{c.duration} min</Badge>
              <Badge>Nivel: {c.level}</Badge>
              {c.isNew && <Badge tone="terracotta">Nueva</Badge>}
              <AccessBadge access={c.access} />
            </div>
            <div className="mt-3 flex items-start justify-between gap-3">
              <h1 className="font-display text-3xl leading-[1.05] sm:text-4xl">{c.title}</h1>
              <FavoriteButton itemKey={`class:${c.id}`} className="bg-cream-deep" />
            </div>
            <p className="mt-3 text-[15px] text-cocoa">{c.description}</p>

            <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-2xl bg-cream-deep p-3">
                <p className="text-[11px] uppercase tracking-[0.16em] text-cocoa">Enfoque</p>
                <p className="mt-1 font-medium">{c.focus.map((f) => labelOf(FOCUS, f)).join(", ")}</p>
              </div>
              <div className="rounded-2xl bg-cream-deep p-3">
                <p className="text-[11px] uppercase tracking-[0.16em] text-cocoa">Equipo</p>
                <p className="mt-1 font-medium">{c.equipment.join(", ")}</p>
              </div>
            </div>

            <Link href="/nosotras" className="mt-5 flex items-center gap-3 rounded-2xl p-2 transition-colors hover:bg-cream-deep">
              <span className="relative block h-12 w-12 shrink-0 overflow-hidden rounded-full">
                <Image src={inst.photo} alt="" fill sizes="48px" className="object-cover" />
              </span>
              <span>
                <span className="block text-[11px] uppercase tracking-[0.16em] text-cocoa">Con</span>
                <span className="block font-medium">{inst.name}</span>
              </span>
            </Link>

            {c.access === "member" && (
              <div className="mt-6 rounded-2xl border border-terracotta/30 bg-terracotta/5 p-4 text-sm">
                <p className="flex items-center gap-2 font-medium"><Icon name="lock" size={16} /> Clase de membresía</p>
                <p className="mt-1 text-cocoa">Prueba 7 días gratis y accede a toda la biblioteca.</p>
                <Link href="/membresia" className="mt-3 inline-flex text-sm font-medium text-terracotta hover:underline">
                  Ver planes <Icon name="arrow" size={15} className="ml-1" />
                </Link>
              </div>
            )}
          </aside>
        </div>
      </section>

      <section className="container-x py-12">
        <SectionHeading title="Sigue con" description="Clases relacionadas por tipo o zona." href="/movement" />
        <Row>
          {related.map((x) => (
            <ClassCard key={x.id} c={x} size="row" />
          ))}
        </Row>
      </section>
    </>
  );
}
