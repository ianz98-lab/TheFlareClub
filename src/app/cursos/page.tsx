import type { Metadata } from "next";
import { PageHero } from "@/components/PageHero";
import { CourseCard } from "@/components/cards/CourseCard";
import { courses } from "@/content/courses";

export const metadata: Metadata = { title: "Cursos" };

export default function CursosPage() {
  return (
    <>
      <PageHero
        eyebrow="Cursos"
        title="Programas para ir más profundo"
        description="Módulos, lecciones en video, recursos descargables y workbooks. Avanza a tu ritmo y retoma donde te quedaste."
        tone="sky"
        image="/images/coach-vertical-02.jpg"
      />
      <section className="container-x py-10">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((c) => (
            <CourseCard key={c.id} c={c} />
          ))}
        </div>
      </section>
    </>
  );
}
