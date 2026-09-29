import type { Metadata } from "next";
import Image from "next/image";
import { ButtonLink } from "@/components/ui/Button";
import { instructors } from "@/content/instructors";

export const metadata: Metadata = { title: "Nosotras" };

const BLOCKS = [
  { n: "01", t: "Historia", d: "Empezamos con clases presenciales en Guatemala. Las alumnas pedían llevarse la clase a casa, a viajes, a días sin tiempo. Así nació la plataforma." },
  { n: "02", t: "Qué significa Flare", d: "Flare es ese destello propio que se enciende cuando te mueves con intención. No es brillar para afuera: es reconocer la luz que ya tienes." },
  { n: "03", t: "Filosofía", d: "Cuidarte no es un castigo ni una meta estética. Es un hábito amable. Aquí no hay culpa, hay constancia con cariño." },
];

export default function NosotrasPage() {
  const founders = instructors.filter((i) => i.founder);
  return (
    <>
      <section className="relative">
        <div className="relative aspect-[4/5] sm:aspect-[16/9] lg:aspect-[21/9]">
          <Image src="/images/fundadoras-mariana-sofi-estudio.jpg" alt="Mariana y Sofi Wer" fill priority sizes="100vw" className="object-cover object-[center_25%]" />
        </div>
        <div className="container-x relative -mt-20 sm:-mt-28">
          <div className="max-w-2xl bg-cream pt-6 pr-8 sm:pt-8">
            <p className="label text-cocoa">Nosotras</p>
            <h1 className="mt-3 font-display text-5xl leading-[0.95] sm:text-7xl">Un club para volver a ti.</h1>
            <p className="mt-6 max-w-lg text-[15px] leading-relaxed text-cocoa sm:text-base">
              The Flare Club nació en un estudio con ventanales, entre mats rosas y conversaciones que se alargaban después de clase. Hoy es una comunidad de mujeres que eligen moverse, respirar y cuidarse sin exigirse.
            </p>
          </div>
        </div>
      </section>

      <section className="container-x mt-16 border-t border-espresso sm:mt-24 md:grid md:grid-cols-3 md:gap-10">
        {BLOCKS.map((b) => (
          <div key={b.n} className="rule-soft py-6 first:border-0 md:border-0 md:py-8">
            <p className="label text-cocoa">{b.n}</p>
            <h2 className="mt-2 font-display text-3xl">{b.t}</h2>
            <p className="mt-3 text-[15px] leading-relaxed text-cocoa">{b.d}</p>
          </div>
        ))}
      </section>

      <section className="container-x mt-16 sm:mt-24">
        <p className="label border-t border-espresso pt-4 text-cocoa">Fundadoras</p>
        <div className="mt-8 grid gap-12 md:grid-cols-2 md:gap-10">
          {founders.map((f) => (
            <article key={f.id}>
              <div className="relative aspect-[4/5] overflow-hidden rounded-xs bg-cream-deep">
                <Image src={f.photo} alt={f.name} fill sizes="(min-width: 768px) 50vw, 100vw" className="object-cover" />
              </div>
              <h3 className="mt-5 font-display text-4xl">{f.name}</h3>
              {f.tagline && <p className="mt-1 font-display text-xl italic text-terracotta">{f.tagline}</p>}
              <p className="label mt-3 text-cocoa">{f.role}</p>
              <p className="mt-4 text-[15px] leading-relaxed text-cocoa">{f.bio}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="container-x mt-20 sm:mt-28">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {["/images/clase-03.jpg", "/images/coach-clase-barre-vertical.jpg", "/images/meditacion-clase-ventanal.jpg", "/images/coaches-mariana-sofi-retrato.jpg"].map((src) => (
            <div key={src} className="relative aspect-[3/4] overflow-hidden rounded-xs bg-cream-deep">
              <Image src={src} alt="" fill sizes="25vw" className="object-cover" />
            </div>
          ))}
        </div>
        <div className="mt-12 flex items-center justify-between border-t border-espresso pt-6">
          <p className="font-display text-2xl sm:text-3xl">¿Entrenamos juntas?</p>
          <ButtonLink href="/membresia">Únete al club</ButtonLink>
        </div>
      </section>
    </>
  );
}
