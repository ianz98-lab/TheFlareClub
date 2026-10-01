import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CourseLessonList } from "@/components/CourseLessonList";
import { PageHero } from "@/components/PageHero";
import { ButtonLink } from "@/components/ui/Button";
import { courseBySlug, courses, courseStats } from "@/content/courses";
import { instructorById } from "@/content/instructors";
import { coursesLive } from "@/content/site";
import { workbookById } from "@/content/workbooks";
import type { Workbook } from "@/content/types";
import { assetUrl } from "@/lib/asset";
import { ACCESS_LABEL, formatPrice } from "@/lib/format";
import { pageMetadata } from "@/lib/seo";

/**
 * Detalle de un curso. Mientras los cursos estén "Próximamente" (`coursesLive()` en site.ts) todas
 * las rutas responden 404: los cursos de muestra no se publican. Al abrir los cursos, esta página
 * vuelve sola (la usan también las compras de Mi cuenta). No se indexa.
 */
const liveCourseBySlug = (slug: string) => (coursesLive() ? courseBySlug(slug) : undefined);

export async function generateStaticParams() {
  // El export estático exige al menos una ruta: con los cursos cerrados se genera una sola, que responde 404.
  const list = coursesLive() ? courses : courses.slice(0, 1);
  return list.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: PageProps<"/cursos/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const c = liveCourseBySlug(slug);
  if (!c) return { title: "Curso", robots: { index: false } };
  return {
    ...pageMetadata({ title: c.title, description: c.tagline, path: `/cursos/${c.slug}`, image: c.cover }),
    robots: { index: false },
  };
}

export default async function CoursePage({ params }: PageProps<"/cursos/[slug]">) {
  const { slug } = await params;
  const c = liveCourseBySlug(slug);
  if (!c) notFound();
  const s = courseStats(c);
  const inst = instructorById(c.instructorId);
  // Ids de workbooks que ya no existen (muestras viejas) se descartan.
  const wbs = c.workbookIds.map(workbookById).filter((w): w is Workbook => Boolean(w));
  const access = c.access === "paid" && c.price ? `${ACCESS_LABEL.paid} · ${formatPrice(c.price)}` : ACCESS_LABEL[c.access];

  return (
    <>
      {/* La cabecera de todo el sitio (PageHero): portada protagonista sobre la superficie neutra. Sin
          eyebrow "Curso": repetiría la miga de pan. */}
      <PageHero
        crumb={
          <Link href="/cursos" className="link-action -my-3 text-ink-muted">
            <span aria-hidden="true">←</span> Cursos
          </Link>
        }
        title={c.title}
        description={c.tagline}
        image={c.cover}
      >
        <p className="label text-ink-muted">
          {s.modules} {s.modules === 1 ? "módulo" : "módulos"} · {s.lessons} {s.lessons === 1 ? "lección" : "lecciones"} · {s.minutes} min · Con {inst.name}
        </p>
        {/* El acceso es el dato clave: con precio va en el acento */}
        <p className={`mt-2 text-body-sm font-medium tabular-nums ${c.access === "paid" ? "text-accent-ink" : "text-ink"}`}>{access}</p>
        <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3">
          <ButtonLink href="#contenido-curso" size="lg" className="w-full sm:w-auto">
            Ver el contenido
          </ButtonLink>
          {c.access === "paid" && <span className="text-sm text-ink-muted">Los cursos se compran aparte de la membresía.</span>}
        </div>
      </PageHero>

      {/* El destino del ancla ya queda bajo el header por el scroll-padding global */}
      <section id="contenido-curso" className="container-x mt-6 grid gap-12 pb-16 sm:mt-10 sm:pb-24 lg:mt-14 lg:grid-cols-[1.3fr_0.7fr] lg:gap-16">
        <div className="min-w-0">
          <h2 className="font-display text-display-lg">Contenido del curso</h2>
          <p className="mt-3 max-w-xl text-body-sm leading-relaxed text-ink-muted">{c.description}</p>
          <CourseLessonList course={c} />
        </div>
        <aside className="space-y-10">
          <div className="rule pt-4">
            <h3 className="mb-4 text-body-sm font-medium">Tu instructora</h3>
            <div className="flex items-center gap-3">
              <span className="relative block h-12 w-12 shrink-0 overflow-hidden rounded-media bg-surface-alt">
                <Image src={inst.photo} alt="" fill sizes="48px" className="object-cover" />
              </span>
              <div>
                {inst.founder ? (
                  <Link href="/sobre-nosotras" className="link font-medium">
                    {inst.name}
                  </Link>
                ) : (
                  <p className="font-medium">{inst.name}</p>
                )}
                <p className="text-sm text-ink-muted">{inst.role}</p>
              </div>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-ink-muted">{inst.bio}</p>
          </div>

          {wbs.length > 0 && (
            <div className="rule pt-4">
              <h3 className="text-body-sm font-medium">Workbooks del curso</h3>
              <ul className="mt-2">
                {wbs.map((w) => (
                  <li key={w.id} className="rule-soft flex items-center justify-between gap-4 py-3">
                    <span className="min-w-0">
                      <span className="block font-display text-display-sm">{w.title}</span>
                      <span className="label mt-1 block text-ink-muted">{w.pages} páginas · PDF</span>
                    </span>
                    <a href={assetUrl(w.fileUrl)} download type="application/pdf" className="link-action shrink-0">
                      Descargar<span className="sr-only"> {w.title} (PDF)</span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </aside>
      </section>
    </>
  );
}
