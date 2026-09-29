import type { Metadata } from "next";
import { PageHero } from "@/components/PageHero";
import { CorporateForm } from "@/components/CorporateForm";
import { ButtonLink } from "@/components/ui/Button";
import { corporatePlans } from "@/content/plans";

export const metadata: Metadata = { title: "The Flare Club for Companies" };

const SERVICES = ["Pilates", "Meditaciones", "Journaling", "Vision Boards", "Actividades creativas", "Charlas con expertos", "Eventos especiales", "Programas anuales de bienestar"];

export default function CorporativoPage() {
  return (
    <>
      <PageHero eyebrow="Corporativo" title="The Flare Club for Companies" description="Experiencias y programas de bienestar para equipos. Presenciales, online o híbridos, con precio a la medida." tone="sand" image="/images/clase-04.jpg">
        <ButtonLink href="#cotizar">Cotiza una experiencia</ButtonLink>
      </PageHero>

      <section className="container-x mt-16 sm:mt-24 md:grid md:grid-cols-[1fr_2fr] md:gap-10">
        <p className="label border-t border-espresso pt-4 text-cocoa">Servicios</p>
        <ul className="mt-6 border-t border-espresso sm:columns-2 md:mt-0">
          {SERVICES.map((s) => (
            <li key={s} className="rule-soft break-inside-avoid py-3 font-display text-2xl first:border-0">
              {s}
            </li>
          ))}
        </ul>
      </section>

      <section className="container-x mt-16 sm:mt-24">
        <p className="label border-t border-espresso pt-4 text-cocoa">Paquetes</p>
        <div className="mt-6 grid gap-px bg-espresso/15 md:grid-cols-3">
          {corporatePlans.map((p) => (
            <div key={p.id} className={`flex flex-col p-7 ${p.highlight ? "bg-espresso text-cream" : "bg-cream"}`}>
              <h3 className="font-display text-3xl">{p.name}</h3>
              <p className={`mt-1 text-[14px] ${p.highlight ? "text-cream/70" : "text-cocoa"}`}>{p.tagline}</p>
              <ul className={`mt-6 divide-y text-[14px] ${p.highlight ? "divide-cream/15" : "divide-espresso/15"}`}>
                {p.features.map((f) => (
                  <li key={f} className="py-2">
                    {f}
                  </li>
                ))}
              </ul>
              <a href="#cotizar" className={`label mt-8 inline-flex h-11 items-center justify-center ${p.highlight ? "bg-cream text-espresso" : "border border-espresso"}`}>
                {p.cta}
              </a>
            </div>
          ))}
        </div>
      </section>

      <section id="cotizar" className="container-x mt-16 grid gap-8 border-t border-espresso pt-8 sm:mt-24 md:grid-cols-[1fr_1.4fr] md:gap-12">
        <div>
          <p className="label text-cocoa">Cotiza una experiencia</p>
          <h2 className="mt-3 font-display text-4xl leading-[1] sm:text-5xl">Cuéntanos de tu equipo</h2>
          <p className="mt-4 max-w-sm text-[15px] leading-relaxed text-cocoa">Te respondemos en menos de 48 horas con una propuesta y precio a la medida.</p>
        </div>
        <CorporateForm />
      </section>
    </>
  );
}
