import type { Metadata } from "next";
import { ButtonLink } from "@/components/ui/Button";
import { personalPlans } from "@/content/plans";
import { formatPrice } from "@/lib/format";

export const metadata: Metadata = { title: "Membresía" };

const FAQ = [
  { q: "¿Puedo cancelar cuando quiera?", a: "Sí. Sin permanencia. Cancelas desde Mi cuenta y conservas el acceso hasta el final del periodo pagado." },
  { q: "¿Cómo funciona la prueba gratis?", a: "Siete días con acceso completo. Pedimos tarjeta pero no cobramos nada hasta el día ocho. Si cancelas antes, no pagas." },
  { q: "¿Qué no incluye la membresía?", a: "Cursos premium, workbooks de pago individual y entradas a eventos presenciales se compran aparte (con descuento en el plan anual)." },
  { q: "¿Sirve para mi empresa?", a: "Sí. Tenemos paquetes corporativos: membresías por asiento, experiencias y programas anuales." },
];

export default function MembresiaPage() {
  return (
    <>
      <section className="container-x pt-12 sm:pt-20">
        <p className="label text-cocoa">Membresía</p>
        <h1 className="mt-3 max-w-3xl font-display text-5xl leading-[0.98] sm:text-7xl">Todo The Flare Club, a tu ritmo.</h1>
        <p className="mt-5 max-w-lg text-[15px] leading-relaxed text-cocoa sm:text-base">Movement, meditaciones, charlas y workbooks. Empieza con siete días gratis y cancela cuando quieras.</p>
      </section>

      <section className="container-x mt-12 grid gap-px bg-espresso/15 sm:mt-16 md:grid-cols-2">
        {personalPlans.map((p) => (
          <div key={p.id} className={`flex flex-col p-7 sm:p-10 ${p.highlight ? "bg-espresso text-cream" : "bg-cream"}`}>
            <div className="flex items-baseline justify-between">
              <h2 className="font-display text-3xl sm:text-4xl">{p.name}</h2>
              {p.highlight && <span className="label text-terracotta-soft">Más elegido</span>}
            </div>
            <p className={`mt-1 text-[14px] ${p.highlight ? "text-cream/70" : "text-cocoa"}`}>{p.tagline}</p>
            <p className="mt-8 flex items-baseline gap-2">
              <span className="font-display text-6xl leading-none">{formatPrice(p.price ?? 0, p.currency)}</span>
              <span className={`label ${p.highlight ? "text-cream/70" : "text-cocoa"}`}>/ {p.period}</span>
            </p>
            <ul className={`mt-8 divide-y text-[15px] ${p.highlight ? "divide-cream/15" : "divide-espresso/15"}`}>
              {p.features.map((f) => (
                <li key={f} className="py-2.5">
                  {f}
                </li>
              ))}
            </ul>
            <ButtonLink href="/cuenta" variant={p.highlight ? "light" : "primary"} size="lg" className="mt-10">
              {p.cta}
            </ButtonLink>
          </div>
        ))}
      </section>

      <section className="container-x mt-12 grid gap-6 border-t border-espresso pt-8 sm:mt-16 md:grid-cols-[1fr_auto] md:items-center">
        <div>
          <p className="label text-cocoa">Empresas</p>
          <h2 className="mt-2 font-display text-3xl sm:text-4xl">The Flare Club for Companies</h2>
          <p className="mt-2 text-[15px] text-cocoa">Membresías por asiento, experiencias o programas anuales, con precio a la medida.</p>
        </div>
        <ButtonLink href="/corporativo" variant="outline">
          Cotizar
        </ButtonLink>
      </section>

      <section className="container-x mt-20 max-w-3xl sm:mt-28">
        <h2 className="font-display text-3xl sm:text-4xl">Preguntas frecuentes</h2>
        <div className="mt-6 border-t border-espresso">
          {FAQ.map((f) => (
            <details key={f.q} className="group rule-soft py-4 first:border-0">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-[16px]">
                {f.q}
                <span className="font-display text-2xl leading-none transition-transform group-open:rotate-45">+</span>
              </summary>
              <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-cocoa">{f.a}</p>
            </details>
          ))}
        </div>
      </section>
    </>
  );
}
