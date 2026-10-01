import { Suspense, type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { PageHero } from "@/components/PageHero";
import { Reveal, RevealImage } from "@/components/motion/Reveal";
import { ButtonLink } from "@/components/ui/Button";
import { CORPORATE_HERO, STUDIO_PHOTOS } from "@/content/media";
import { personalPlans, planById } from "@/content/plans";
import { MEMBERSHIP } from "@/content/site";
import { formatPrice } from "@/lib/format";
import { pageMetadata } from "@/lib/seo";
import { CheckoutNotice } from "./CheckoutNotice";
import { PlanCta } from "./PlanCta";

/**
 * Las fundadoras guiando una clase junto al ventanal, con las alumnas en primer plano: "todo el club"
 * en una foto. Con D2-C el calor lo pone la foto, no un bloque de color.
 */
const HERO = STUDIO_PHOTOS.meditacion;

export const metadata = pageMetadata({
  title: MEMBERSHIP.eyebrow,
  description: `${MEMBERSHIP.description} ${MEMBERSHIP.trialLine}`,
  path: "/membresia",
  image: HERO,
});

const monthly = planById("flare-mensual");
const annual = planById("flare-anual");

/** Diferencia real entre 12 meses del mensual y el anual (hoy USD 15). */
const annualSavings = monthly?.price && annual?.price ? monthly.price * 12 - annual.price : 0;

/**
 * Solo lo que dice el documento de las fundadoras. Permanencia, acceso tras cancelar y si la prueba
 * pide tarjeta quedan fuera hasta confirmarlos con Recurrente (decisión D12).
 */
const FAQ: { q: string; a: ReactNode }[] = [
  {
    q: "¿Puedo cancelar cuando quiera?",
    a: "Sí. Cancelas cuando quieras desde Mi cuenta.",
  },
  {
    q: "¿Cómo funciona la prueba gratis?",
    a: "Tienes 7 días gratis. Después, tu membresía se renueva automáticamente con el plan que elegiste hasta que decidas cancelarla.",
  },
  ...(annual?.price && annualSavings > 0
    ? [
        {
          q: "¿Qué diferencia hay entre el plan mensual y el anual?",
          a: `Los dos incluyen exactamente lo mismo. El anual cuesta ${formatPrice(annual.price, annual.currency)} al año: ahorras ${formatPrice(annualSavings, annual.currency)} frente a pagar 12 meses del mensual.`,
        },
      ]
    : []),
  {
    q: "¿Qué no incluye la membresía?",
    a: "Los cursos y las entradas a eventos se compran aparte.",
  },
  {
    q: "¿Sirve para mi empresa?",
    a: (
      <>
        La membresía es personal, pero también creamos experiencias para empresas y marcas. {MEMBERSHIP.business.description}{" "}
        <Link href="/corporativo" className="link text-ink">
          Conoce más en Corporativo
        </Link>
        .
      </>
    ),
  },
];

export default function MembresiaPage() {
  return (
    <>
      <Suspense fallback={null}>
        <CheckoutNotice />
      </Suspense>

      {/*
        La cabecera de todo el sitio (PageHero): foto protagonista y el titular sobre la superficie neutra.
        La prueba gratis es el dato clave de la página: va en el acento, en la voz de los titulares.
        Encabezado y planes sin Reveal: son lo primero que se ve y deben estar en el HTML desde el inicio.
      */}
      <PageHero eyebrow={MEMBERSHIP.eyebrow} title={MEMBERSHIP.title} description={MEMBERSHIP.description} image={HERO}>
        <p className="font-display text-display-md text-accent-ink">{MEMBERSHIP.trialLine}</p>
      </PageHero>

      {/*
        Dos planes con la misma jerarquía: mismos beneficios, el anual solo cuesta menos.
        Desde md cada plan es un subgrid de 5 filas (nombre, precio, frase, beneficios, botón), así
        todo queda a la misma altura aunque solo uno de los planes traiga frase.
      */}
      <section aria-label="Planes" className="container-x">
        <div className="grid border-t border-ink md:grid-cols-2 md:grid-rows-[repeat(5,auto)]">
          {personalPlans.map((p) => {
            const legalId = p.finePrint ? `plan-${p.id}-legal` : undefined;
            return (
              <article
                key={p.id}
                aria-labelledby={`plan-${p.id}`}
                className="flex flex-col border-t border-line py-8 first:border-t-0 sm:py-10 md:row-span-5 md:grid md:grid-rows-subgrid md:border-t-0 md:py-12 md:pr-10 md:even:border-l md:even:pr-0 md:even:pl-10"
              >
                {/* El nombre un paso abajo y el precio en grande: el precio es lo que se compara */}
                <h2 id={`plan-${p.id}`} className="font-display text-display-md">
                  {p.name}
                </h2>
                {/* flex-wrap: a 280 px el periodo baja de línea en vez de desbordar */}
                <p className="mt-4 flex flex-wrap items-baseline gap-x-2 gap-y-1">
                  <span className="font-display text-display-xl tabular-nums">{formatPrice(p.price ?? 0, p.currency)}</span>
                  <span className="label text-ink-muted">/ {p.period}</span>
                </p>
                {p.tagline ? (
                  <p className="mt-4 text-body-sm leading-relaxed text-ink">{p.tagline}</p>
                ) : (
                  // Reserva la fila de la frase en desktop (en móvil no ocupa nada).
                  <span aria-hidden="true" className="hidden md:block" />
                )}

                <div className="mt-8">
                  <p className="label text-ink-muted">Acceso a:</p>
                  <ul className="mt-3 divide-y divide-line border-y border-line text-body-sm">
                    {p.features.map((f) => (
                      <li key={f} className="py-2.5">
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-auto pt-8">
                  <PlanCta plan={p} describedBy={legalId} />
                  {/* La condición de cobro se lee para decidir: 14 px como el resto del texto, no letra chica */}
                  {p.finePrint && (
                    <p id={legalId} className="mt-3 max-w-sm text-sm leading-snug text-ink-muted">
                      {p.finePrint}
                    </p>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/*
        Empresas y marcas: sin banda de color (D2-C). La separan el filete y el aire, y la foto del grupo
        (la misma de la cabecera de Corporativo, adonde lleva) le da el calor. Botón en contorno: la acción
        terracota de la página es la prueba gratis.
      */}
      <section aria-labelledby="empresas" className="container-x mt-16 sm:mt-24">
        <div className="rule grid gap-8 pt-8 sm:pt-10 md:grid-cols-12 md:items-end md:gap-10 lg:gap-16 lg:pt-14">
          <RevealImage className="relative aspect-[3/2] overflow-hidden rounded-media bg-surface-alt md:col-span-5">
            <Image
              src={CORPORATE_HERO.src}
              alt={CORPORATE_HERO.alt ?? ""}
              fill
              sizes="(min-width: 1408px) 540px, (min-width: 768px) 40vw, 100vw"
              className="object-cover"
              style={{ objectPosition: CORPORATE_HERO.focal }}
            />
          </RevealImage>
          <div className="md:col-span-7">
            <Reveal>
              <p className="label text-ink-muted">{MEMBERSHIP.business.eyebrow}</p>
              <h2 id="empresas" className="mt-3 max-w-[20ch] font-display text-display-lg">
                {MEMBERSHIP.business.title}
              </h2>
              <p className="mt-4 max-w-xl text-base leading-relaxed text-ink-muted">{MEMBERSHIP.business.description}</p>
            </Reveal>
            <ButtonLink href="/corporativo#cotizar" variant="outline" size="lg" className="mt-8 w-full sm:w-auto">
              {MEMBERSHIP.business.cta}
            </ButtonLink>
          </div>
        </div>
      </section>

      {/* Preguntas frecuentes: alineadas a la izquierda como el resto; el límite de ancho va adentro. */}
      <section aria-labelledby="faq" className="container-x mt-16 sm:mt-24">
        <div className="max-w-3xl">
          <h2 id="faq" className="font-display text-display-lg">
            Preguntas frecuentes
          </h2>
          <div className="mt-6 border-t border-ink">
            {FAQ.map((f) => (
              <details key={f.q} className="group rule-soft first:border-0">
                <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 py-3 text-base font-medium [&::-webkit-details-marker]:hidden">
                  {f.q}
                  {/* Indicador funcional (no decorativo): gira a "×" al abrir */}
                  <span
                    aria-hidden="true"
                    className="text-2xl font-normal leading-none text-ink-muted transition-transform duration-(--duration-fast) ease-out-quint group-open:rotate-45 motion-reduce:transition-none"
                  >
                    +
                  </span>
                </summary>
                <p className="max-w-xl pb-5 text-base leading-relaxed text-ink-muted">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
