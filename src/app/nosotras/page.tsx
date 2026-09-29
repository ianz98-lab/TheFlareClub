import type { Metadata } from "next";
import Image from "next/image";
import { ButtonLink } from "@/components/ui/Button";
import { instructors } from "@/content/instructors";

export const metadata: Metadata = { title: "Nosotras" };

export default function NosotrasPage() {
  const founders = instructors.filter((i) => i.founder);
  return (
    <>
      <section className="bg-rose-soft/70">
        <div className="container-x grid gap-8 py-10 lg:grid-cols-2 lg:items-center lg:py-16">
          <div>
            <p className="eyebrow mb-3">Nosotras</p>
            <h1 className="font-display text-4xl leading-[1.02] sm:text-5xl lg:text-6xl">
              Un club para <em className="text-terracotta">volver a ti</em>
            </h1>
            <p className="mt-5 text-[15px] text-cocoa sm:text-lg">
              The Flare Club nació en un estudio con ventanales, entre mats rosas y conversaciones
              que se alargaban después de clase. Hoy es una comunidad de mujeres que eligen
              moverse, respirar y cuidarse sin exigirse.
            </p>
          </div>
          <div className="relative aspect-[4/3] overflow-hidden rounded-3xl shadow-soft">
            <Image src="/images/fundadoras-mariana-sofi-estudio.jpg" alt="Mariana y Sofi Wer" fill priority sizes="(min-width: 1024px) 600px, 100vw" className="object-cover" />
          </div>
        </div>
      </section>

      <section className="container-x grid gap-8 py-14 md:grid-cols-3">
        {[
          { t: "Historia", d: "Empezamos con clases presenciales en Guatemala. Las alumnas pedían llevarse la clase a casa, a viajes, a días sin tiempo. Así nació la plataforma." },
          { t: "Qué significa Flare", d: "Flare es ese destello propio que se enciende cuando te mueves con intención. No es brillar para afuera: es reconocer la luz que ya tienes." },
          { t: "Filosofía", d: "Cuidarte no es un castigo ni una meta estética. Es un hábito amable. Aquí no hay culpa, hay constancia con cariño." },
        ].map((b) => (
          <div key={b.t} className="rounded-3xl bg-white/60 p-6 ring-1 ring-sand/60">
            <h2 className="font-display text-3xl">{b.t}</h2>
            <p className="mt-3 text-[15px] text-cocoa">{b.d}</p>
          </div>
        ))}
      </section>

      <section className="container-x pb-14">
        <p className="eyebrow mb-3">Fundadoras</p>
        <div className="grid gap-6 md:grid-cols-2">
          {founders.map((f) => (
            <article key={f.id} className="grid grid-cols-[120px_1fr] gap-4 sm:grid-cols-[180px_1fr] sm:gap-6">
              <div className="relative aspect-[3/4] overflow-hidden rounded-3xl">
                <Image src={f.photo} alt={f.name} fill sizes="200px" className="object-cover" />
              </div>
              <div>
                <h3 className="font-display text-3xl">{f.name}</h3>
                <p className="text-sm text-terracotta">{f.role}</p>
                <p className="mt-3 text-[15px] text-cocoa">{f.bio}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="container-x pb-6">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {["/images/clase-03.jpg", "/images/coach-clase-barre-vertical.jpg", "/images/meditacion-clase-ventanal.jpg", "/images/coaches-mariana-sofi-retrato.jpg"].map((src, i) => (
            <div key={src} className={`relative overflow-hidden rounded-2xl ${i % 2 ? "aspect-[3/4]" : "aspect-square"}`}>
              <Image src={src} alt="" fill sizes="25vw" className="object-cover" />
            </div>
          ))}
        </div>
        <div className="mt-10 text-center">
          <ButtonLink href="/membresia" size="lg">Únete al club</ButtonLink>
        </div>
      </section>
    </>
  );
}
