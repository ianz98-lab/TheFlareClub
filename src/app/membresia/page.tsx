import type { Metadata } from "next";
import Link from "next/link";
import { ButtonLink } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { personalPlans } from "@/content/plans";
import { formatPrice } from "@/lib/format";

export const metadata: Metadata = { title: "Membresía" };

const FAQ = [
  { q: "¿Puedo cancelar cuando quiera?", a: "Sí. Sin permanencia. Cancelas desde Mi cuenta y conservas el acceso hasta el final del periodo pagado." },
  { q: "¿Cómo funciona la prueba gratis?", a: "Siete días con acceso completo. Pedimos tarjeta pero no cobramos nada hasta el día ocho. Si cancelas antes, no pagas." },
  { q: "¿Qué no incluye la membresía?", a: "Cursos premium, workbooks de pago individual y entradas a eventos presenciales se compran aparte (con descuento en el plan anual)." },
  { q: "¿Sirve para mi empresa?", a: "Sí. Tenemos paquetes corporativos flexibles: membresías por asiento, experiencias y programas anuales." },
];

export default function MembresiaPage() {
  return (
    <>
      <section className="container-x pt-10 text-center sm:pt-16">
        <p className="eyebrow mb-3">Membresía</p>
        <h1 className="mx-auto max-w-2xl font-display text-4xl leading-[1.02] sm:text-6xl">Todo The Flare Club, a tu ritmo</h1>
        <p className="mx-auto mt-4 max-w-xl text-[15px] text-cocoa sm:text-lg">
          Movement, meditaciones, charlas y workbooks. Empieza con siete días gratis y cancela cuando quieras.
        </p>
      </section>

      <section className="container-x grid gap-4 py-10 md:grid-cols-2 lg:mx-auto lg:max-w-4xl">
        {personalPlans.map((p) => (
          <div key={p.id} className={`relative flex flex-col rounded-3xl p-6 sm:p-8 ${p.highlight ? "bg-espresso text-cream shadow-soft" : "bg-white/60 ring-1 ring-sand/60"}`}>
            {p.highlight && (
              <span className="absolute -top-3 left-6 rounded-full bg-terracotta px-3 py-1 text-xs font-medium text-cream">Más elegido</span>
            )}
            <h2 className="font-display text-3xl">{p.name}</h2>
            <p className={`mt-1 text-sm ${p.highlight ? "text-cream/80" : "text-cocoa"}`}>{p.tagline}</p>
            <p className="mt-5 flex items-baseline gap-1">
              <span className="font-display text-5xl">{formatPrice(p.price ?? 0, p.currency)}</span>
              <span className={p.highlight ? "text-cream/70" : "text-cocoa"}>/ {p.period}</span>
            </p>
            <ul className="mt-6 space-y-2.5 text-[15px]">
              {p.features.map((f) => (
                <li key={f} className="flex gap-2"><Icon name="check" size={18} className={p.highlight ? "text-terracotta-soft" : "text-terracotta"} /> {f}</li>
              ))}
            </ul>
            <ButtonLink href="/cuenta" variant={p.highlight ? "light" : "primary"} size="lg" className="mt-8">
              {p.cta}
            </ButtonLink>
          </div>
        ))}
      </section>

      <section className="container-x pb-10 lg:mx-auto lg:max-w-4xl">
        <div className="rounded-3xl bg-sand-light p-6 sm:flex sm:items-center sm:justify-between sm:p-8">
          <div>
            <p className="eyebrow mb-1">Empresas</p>
            <h2 className="font-display text-3xl">The Flare Club for Companies</h2>
            <p className="mt-1 text-[15px] text-cocoa">Pricing flexible por asiento, experiencia o programa anual.</p>
          </div>
          <Link href="/corporativo" className="mt-4 inline-flex h-11 items-center gap-2 rounded-full bg-espresso px-5 font-medium text-cream sm:mt-0">
            Cotizar <Icon name="arrow" size={16} />
          </Link>
        </div>
      </section>

      <section className="container-x pb-16 lg:mx-auto lg:max-w-3xl">
        <h2 className="mb-4 font-display text-3xl">Preguntas frecuentes</h2>
        <div className="divide-y divide-sand/60">
          {FAQ.map((f) => (
            <details key={f.q} className="group py-4">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-medium">
                {f.q}
                <Icon name="arrow" size={18} className="shrink-0 rotate-90 text-terracotta transition-transform group-open:-rotate-90" />
              </summary>
              <p className="mt-2 text-[15px] text-cocoa">{f.a}</p>
            </details>
          ))}
        </div>
      </section>
    </>
  );
}
