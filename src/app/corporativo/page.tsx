import type { CSSProperties } from "react";
import Image from "next/image";
import { CorporateForm } from "@/components/CorporateForm";
import { PageHero } from "@/components/PageHero";
import { Reveal, RevealHeading, RevealImage } from "@/components/motion/Reveal";
import { ButtonLink } from "@/components/ui/Button";
import { CORPORATE_HERO, CORPORATE_PHOTOS, EVENT_GALLERIES } from "@/content/media";
import { CORPORATE } from "@/content/site";
import type { Photo } from "@/content/types";
import { pageMetadata } from "@/lib/seo";

// Recorte sin el techo: en el cuadro del hero el grupo es lo que vende la experiencia.
const HERO = CORPORATE_HERO;

export const metadata = pageMetadata({ title: CORPORATE.title, description: CORPORATE.paragraphs[0], path: "/corporativo", image: HERO });

/**
 * Fila de fotos: una clase grande, la clase en una oficina (foto de celular: solo sirve chica) y un
 * taller creativo (charms), para mostrar clase + actividad especial.
 */
const ROW: Photo[] = [
  EVENT_GALLERIES["pilates-mindfulness-may-2026"]?.[0],
  CORPORATE_PHOTOS[1],
  EVENT_GALLERIES["pilates-charms-sep-2026"]?.[1],
].filter((p): p is Photo => Boolean(p));

const ratio = (p: Photo) => p.width / p.height;
const ROW_TOTAL = ROW.reduce((s, p) => s + ratio(p), 0);

export default function CorporativoPage() {
  return (
    <>
      {/*
        La cabecera de todo el sitio (PageHero): la foto del grupo es la protagonista (su `focal` deja al
        grupo en el cuadro) y el texto va sobre la superficie neutra. Los dos párrafos del documento van
        juntos como entradilla. Primer pantallazo: sin Reveal ni parallax.
      */}
      <PageHero eyebrow={CORPORATE.eyebrow} title={CORPORATE.title} description={CORPORATE.paragraphs.join(" ")} image={HERO}>
        <ButtonLink href="#cotizar" size="lg" className="w-full sm:w-auto">
          {CORPORATE.cta}
        </ButtonLink>
      </PageHero>

      {/* Para quién: dos bloques grandes con filetes, en la forma del documento ("Para empresas →"). Sin numeración: no es una secuencia.
          La flecha promete un destino: cada titular es un enlace al formulario de cotización (#cotizar). */}
      <section className="container-x mt-6 sm:mt-10 lg:mt-14">
        <ul className="grid border-t border-ink md:grid-cols-2">
          {CORPORATE.audiences.map((a, i) => (
            <li
              key={a.title}
              className="border-t border-line py-8 first:border-t-0 sm:py-10 md:border-t-0 md:py-12 md:pr-10 md:even:border-l md:even:pr-0 md:even:pl-10"
            >
              <Reveal delay={i * 0.08}>
                <h2 className="font-display text-display-lg">
                  {/* Terracota al pasar el mouse (text-accent: el titular mide más de 24 px) */}
                  <a href="#cotizar" className="group transition-colors duration-(--duration-base) hover:text-accent">
                    {a.title}
                    <span className="sr-only">: {CORPORATE.cta.toLowerCase()}</span>
                    {/* Espacio duro: la flecha nunca queda sola en otra línea */}
                    <span aria-hidden="true">{"\u00a0"}</span>
                    <span
                      aria-hidden="true"
                      className="inline-block transition-transform duration-(--duration-base) group-hover:translate-x-1 motion-reduce:group-hover:translate-x-0"
                    >
                      →
                    </span>
                  </a>
                </h2>
                <p className="mt-4 max-w-lg text-base leading-relaxed text-ink-muted sm:text-lead">{a.description}</p>
              </Reveal>
            </li>
          ))}
        </ul>
      </section>

      {/* Fotos: en móvil una ancha arriba y dos abajo; desde md una fila que respeta la proporción de cada foto */}
      {ROW.length > 0 && (
        <section className="container-x mt-6 sm:mt-10" aria-label="Experiencias de The Flare Club">
          <div className="grid grid-cols-2 gap-2 sm:gap-3 md:flex md:items-start md:gap-4">
            {ROW.map((p, i) => (
              <div
                key={p.src}
                style={{ "--r": ratio(p) } as CSSProperties}
                className={`relative ${i === 0 ? "col-span-2 aspect-[3/2]" : "aspect-[4/5]"} md:[aspect-ratio:var(--r)] md:[flex:var(--r)_1_0%]`}
              >
                {/* La cortina va en una capa interna: el contenedor necesita su style (proporción) */}
                <RevealImage delay={i * 0.08} className="absolute inset-0 overflow-hidden rounded-media bg-surface-alt">
                  <Image
                    src={p.src}
                    alt={p.alt ?? ""}
                    fill
                    sizes={`(min-width: 768px) ${Math.ceil((ratio(p) / ROW_TOTAL) * 100)}vw, ${i === 0 ? "100vw" : "50vw"}`}
                    className="object-cover"
                    style={{ objectPosition: p.focal }}
                  />
                </RevealImage>
              </div>
            ))}
          </div>
        </section>
      )}

      {/*
        Cotización: el único bloque con fondo de la página (surface-alt), porque es el formulario y debe
        separarse del resto. El ancla queda bajo el header por el scroll-padding global.
      */}
      <section id="cotizar" className="mt-16 bg-surface-alt sm:mt-24">
        <div className="container-x grid gap-10 py-12 sm:py-16 md:grid-cols-[1fr_1.4fr] md:gap-12 lg:py-20">
          {/* Fijo bajo el header mientras se llena el formulario; sube con el header cuando se oculta */}
          <div className="md:sticky-aside md:self-start">
            <RevealHeading className="max-w-[12ch] font-display text-display-lg">{CORPORATE.cta}</RevealHeading>
          </div>
          <CorporateForm />
        </div>
      </section>
    </>
  );
}
