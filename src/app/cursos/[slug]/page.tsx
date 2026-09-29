import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CourseLessonList } from "@/components/CourseLessonList";
import { Badge, AccessBadge } from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { WorkbookCard } from "@/components/cards/WorkbookCard";
import { courseBySlug, courses, courseStats } from "@/content/courses";
import { instructorById } from "@/content/instructors";
import { workbookById } from "@/content/workbooks";
import { formatPrice } from "@/lib/format";

export async function generateStaticParams() {
  return courses.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: PageProps<"/cursos/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  return { title: courseBySlug(slug)?.title ?? "Curso" };
}

export default async function CoursePage({ params }: PageProps<"/cursos/[slug]">) {
  const { slug } = await params;
  const c = courseBySlug(slug);
  if (!c) notFound();
  const s = courseStats(c);
  const inst = instructorById(c.instructorId);
  const wbs = c.workbookIds.map(workbookById).filter(Boolean);

  return (
    <>
      <section className="bg-sky-soft/70">
        <div className="container-x grid gap-6 py-8 md:grid-cols-[0.9fr_1.1fr] md:items-center md:py-12 lg:py-14">
          <div className="relative aspect-[16/10] overflow-hidden rounded-3xl shadow-soft md:order-2">
            <Image src={c.cover} alt="" fill priority sizes="(min-width: 1024px) 600px, 100vw" className="object-cover" />
          </div>
          <div>
            <Link href="/cursos" className="mb-3 inline-flex items-center gap-1 text-sm text-cocoa hover:text-espresso">
              <Icon name="arrow" size={16} className="rotate-180" /> Cursos
            </Link>
            <div className="flex flex-wrap gap-1.5">
              <Badge tone="sky">Curso</Badge>
              <AccessBadge access={c.access} />
            </div>
            <h1 className="mt-3 font-display text-4xl leading-[1.02] sm:text-5xl">{c.title}</h1>
            <p className="mt-3 text-lg text-cocoa">{c.tagline}</p>
            <ul className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-sm text-cocoa">
              <li className="flex items-center gap-1.5"><Icon name="book" size={16} /> {s.modules} módulos · {s.lessons} lecciones</li>
              <li className="flex items-center gap-1.5"><Icon name="clock" size={16} /> {s.minutes} min en total</li>
              <li className="flex items-center gap-1.5"><Icon name="user" size={16} /> {inst.name}</li>
            </ul>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <ButtonLink href="#contenido" variant="primary" size="lg">
                {c.access === "paid" ? `Comprar · ${formatPrice(c.price ?? 0)}` : "Empezar el curso"}
              </ButtonLink>
              {c.access === "member" && <span className="text-sm text-cocoa">Incluido en tu membresía</span>}
            </div>
          </div>
        </div>
      </section>

      <section id="contenido" className="container-x grid gap-10 py-10 md:grid-cols-[1.2fr_0.8fr]">
        <div>
          <h2 className="font-display text-3xl">Contenido del curso</h2>
          <p className="mt-2 text-[15px] text-cocoa">{c.description}</p>
          <CourseLessonList course={c} />
        </div>
        <aside className="space-y-8">
          <div className="rounded-3xl bg-white/60 p-5 ring-1 ring-sand/60">
            <p className="eyebrow mb-3">Tu instructora</p>
            <div className="flex items-center gap-3">
              <span className="relative block h-14 w-14 shrink-0 overflow-hidden rounded-full">
                <Image src={inst.photo} alt="" fill sizes="56px" className="object-cover" />
              </span>
              <div>
                <p className="font-medium">{inst.name}</p>
                <p className="text-sm text-cocoa">{inst.role}</p>
              </div>
            </div>
            <p className="mt-3 text-sm text-cocoa">{inst.bio}</p>
          </div>
          {wbs.length > 0 && (
            <div>
              <p className="eyebrow mb-3">Workbooks del curso</p>
              <div className="grid gap-4">
                {wbs.map((w) => w && <WorkbookCard key={w.id} w={w} />)}
              </div>
            </div>
          )}
        </aside>
      </section>
    </>
  );
}
