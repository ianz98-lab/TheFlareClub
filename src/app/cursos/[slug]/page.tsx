import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CourseLessonList } from "@/components/CourseLessonList";
import { Badge, AccessBadge } from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/Button";
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
      <section className="bg-sky-soft md:grid md:grid-cols-2">
        <div className="relative aspect-[4/3] md:order-2 md:aspect-auto md:min-h-[460px]">
          <Image src={c.cover} alt="" fill priority sizes="(min-width: 768px) 50vw, 100vw" className="object-cover" />
        </div>
        <div className="container-x flex flex-col justify-end py-10 md:py-16 lg:py-24">
          <div>
            <Link href="/cursos" className="label link text-cocoa">← Cursos</Link>
            <div className="mt-4 flex items-center gap-3">
              <Badge tone="sky">Curso</Badge>
              <AccessBadge access={c.access} />
            </div>
            <h1 className="mt-3 font-display text-5xl leading-[0.98] sm:text-6xl lg:text-7xl">{c.title}</h1>
            <p className="mt-4 max-w-md text-[15px] leading-relaxed text-cocoa sm:text-base">{c.tagline}</p>
            <p className="label mt-6 text-cocoa">
              {s.modules} módulos · {s.lessons} lecciones · {s.minutes} min · Con {inst.name}
            </p>
            <div className="mt-7 flex flex-wrap items-center gap-6">
              <ButtonLink href="#contenido" size="lg">
                {c.access === "paid" ? `Comprar · ${formatPrice(c.price ?? 0)}` : "Empezar el curso"}
              </ButtonLink>
              {c.access === "member" && <span className="text-[13px] text-cocoa">Incluido en tu membresía</span>}
            </div>
          </div>
        </div>
      </section>

      <section id="contenido" className="container-x mt-16 grid gap-12 sm:mt-24 md:grid-cols-[1.3fr_0.7fr] md:gap-16">
        <div>
          <h2 className="font-display text-4xl">Contenido del curso</h2>
          <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-cocoa">{c.description}</p>
          <CourseLessonList course={c} />
        </div>
        <aside className="space-y-8">
          <div className="border-t border-espresso pt-4">
            <p className="label text-cocoa mb-4">Tu instructora</p>
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
              <p className="label border-t border-espresso pt-4 text-cocoa">Workbooks del curso</p>
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
