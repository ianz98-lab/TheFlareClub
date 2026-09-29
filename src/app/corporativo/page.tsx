import type { Metadata } from "next";
import Image from "next/image";
import { PageHero } from "@/components/PageHero";
import { CorporateForm } from "@/components/CorporateForm";
import { Icon, type IconName } from "@/components/ui/Icon";
import { corporatePlans } from "@/content/plans";

export const metadata: Metadata = { title: "The Flare Club for Companies" };

const SERVICES: { label: string; icon: IconName }[] = [
  { label: "Pilates", icon: "move" },
  { label: "Meditaciones", icon: "leaf" },
  { label: "Journaling", icon: "file" },
  { label: "Vision Boards", icon: "sparkle" },
  { label: "Actividades creativas", icon: "sparkle" },
  { label: "Charlas con expertos", icon: "mic" },
  { label: "Eventos especiales", icon: "calendar" },
  { label: "Programas anuales", icon: "book" },
];

export default function CorporativoPage() {
  return (
    <>
      <PageHero
        eyebrow="Corporativo"
        title="The Flare Club for Companies"
        description="Experiencias y programas de bienestar para equipos. Presenciales, online o híbridos, con pricing a la medida."
        tone="sand"
        image="/images/clase-04.jpg"
      >
        <a href="#cotizar" className="inline-flex h-12 items-center gap-2 rounded-full bg-espresso px-6 font-medium text-cream shadow-soft hover:bg-cocoa">
          Cotiza una experiencia <Icon name="arrow" size={18} />
        </a>
      </PageHero>

      <section className="container-x py-12">
        <p className="eyebrow mb-3">Servicios</p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {SERVICES.map((s) => (
            <div key={s.label} className="flex items-center gap-3 rounded-2xl bg-white/60 p-4 ring-1 ring-sand/60">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-sand-light text-espresso">
                <Icon name={s.icon} size={18} />
              </span>
              <span className="text-[15px] font-medium">{s.label}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="container-x pb-12">
        <p className="eyebrow mb-3">Paquetes</p>
        <div className="grid gap-4 md:grid-cols-3">
          {corporatePlans.map((p) => (
            <div key={p.id} className={`flex flex-col rounded-3xl p-6 ${p.highlight ? "bg-espresso text-cream" : "bg-white/60 ring-1 ring-sand/60"}`}>
              <h3 className="font-display text-3xl">{p.name}</h3>
              <p className={`mt-1 text-sm ${p.highlight ? "text-cream/80" : "text-cocoa"}`}>{p.tagline}</p>
              <ul className="mt-5 space-y-2 text-sm">
                {p.features.map((f) => (
                  <li key={f} className="flex gap-2"><Icon name="check" size={16} className={p.highlight ? "text-terracotta-soft" : "text-terracotta"} /> {f}</li>
                ))}
              </ul>
              <a href="#cotizar" className={`mt-6 inline-flex h-11 items-center justify-center rounded-full font-medium ${p.highlight ? "bg-cream text-espresso" : "bg-espresso text-cream"}`}>
                {p.cta}
              </a>
            </div>
          ))}
        </div>
      </section>

      <section id="cotizar" className="container-x grid gap-8 py-12 lg:grid-cols-[0.9fr_1.1fr]">
        <div>
          <p className="eyebrow mb-3">Cotiza una experiencia</p>
          <h2 className="font-display text-4xl leading-tight">Cuéntanos de tu equipo</h2>
          <p className="mt-3 text-[15px] text-cocoa">Te respondemos en menos de 48 horas con una propuesta y precio a la medida.</p>
          <div className="relative mt-6 hidden aspect-[4/3] overflow-hidden rounded-3xl lg:block">
            <Image src="/images/fundadoras-mariana-sofi-estudio.jpg" alt="" fill sizes="500px" className="object-cover" />
          </div>
        </div>
        <CorporateForm />
      </section>
    </>
  );
}
