import Link from "next/link";
import { PageHero } from "@/components/PageHero";
import { MovementFinder } from "@/components/finder/finders";
import { ButtonLink } from "@/components/ui/Button";
import { Reveal, RevealHeading, RevealList } from "@/components/motion/Reveal";
import { MOVEMENT, ROUTINE } from "@/content/site";
import { PRESETS } from "@/lib/routine";
import { presetHref, presetLabel } from "@/lib/movement";
import { pageMetadata } from "@/lib/seo";

const HERO_IMAGE = "/images/eventos/pilates-journaling-feb-2026/02.jpg";

export const metadata = pageMetadata({ title: "Movement", description: MOVEMENT.description, path: "/movement", image: HERO_IMAGE });

/**
 * Movement: la biblioteca de clases. "Arma tu rutina" es una herramienta de Movement, no una
 * categoría (documento de las fundadoras, 30-sep): por eso vive aquí, bien a la vista, justo
 * debajo del encabezado y antes del buscador. El encabezado es compacto para que en el celular las
 * clases empiecen pronto; el CTA de la rutina va una sola vez, en su bloque.
 */
export default function MovementPage() {
  const prompt = MOVEMENT.routinePrompt;
  return (
    <>
      <PageHero compact title={MOVEMENT.title} description={MOVEMENT.description} image={HERO_IMAGE} />

      {/* ---------- ¿No sabes qué hacer hoy? → Arma tu rutina ----------
          El único bloque oscuro de la página: separa la herramienta de la biblioteca sin color por módulo. */}
      <section aria-labelledby="rutina-titulo" className="on-dark bg-espresso">
        <div className="container-x grid gap-10 py-14 sm:py-16 lg:grid-cols-[1fr_1.1fr] lg:gap-20 lg:py-24">
          <div>
            <RevealHeading id="rutina-titulo" className="max-w-[14ch] font-display text-display-lg">
              {prompt.title}
            </RevealHeading>
            <Reveal delay={0.1}>
              <p className="mt-5 max-w-md text-base leading-relaxed text-ink-muted sm:text-lead">{prompt.description}</p>
              <ButtonLink href="/rutina" variant="light" size="lg" className="mt-8 w-full sm:w-auto">
                {prompt.cta}
              </ButtonLink>
            </Reveal>
          </div>

          <div>
            <h3 className="text-body-sm font-medium text-ink-muted">{ROUTINE.presetsTitle}</h3>
            {/* Toda la fila es el enlace; "Usar esta rutina →" lo dice a la vista (abre el constructor con la
                rutina cargada), igual que en Inicio. Desde sm, 2 × 2: la lista no se estira muy por debajo del
                título y el bloque queda compacto y parejo; mt-auto deja la acción al pie de cada celda, alineada
                con la de al lado. */}
            <RevealList as="ul" className="mt-4 grid sm:grid-cols-2 sm:gap-x-8">
              {PRESETS.map((p) => (
                // Filete fuerte arriba de la primera fila (1 en móvil, 2 desde sm) y suave entre las demás
                <li key={p.id} className="border-t border-line first:border-line-strong sm:[&:nth-child(2)]:border-line-strong">
                  <Link href={presetHref(p)} className="group flex h-full flex-col py-5 sm:pb-7">
                    <span className="label block text-ink-muted">{presetLabel(p)}</span>
                    <span className="mt-2 block font-display text-display-md decoration-1 underline-offset-[6px] group-hover:underline">{p.name}</span>
                    <span className="mt-2 block max-w-md text-body-sm leading-snug text-ink-muted">{p.blurb}</span>
                    {/* La flecha en inline-block: queda fuera del subrayado y se corre al pasar el mouse */}
                    <span className="link-action mt-auto self-start pt-2 group-hover:decoration-current">
                      <span>
                        Usar esta rutina
                        <span
                          aria-hidden="true"
                          className="ml-1.5 inline-block transition-transform duration-(--duration-base) group-hover:translate-x-1 motion-reduce:group-hover:translate-x-0"
                        >
                          →
                        </span>
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
            </RevealList>
          </div>
        </div>
      </section>

      {/* ---------- Biblioteca ----------
          #clases: destino de los atajos de Inicio ("Solo tengo 5 minutos", "Quiero estirarme"),
          que llegan con el filtro puesto y deben caer directo en los resultados. El catálogo viene completo
          en el HTML (sin Suspense): el filtro de la URL se aplica al hidratar. El margen negativo
          descuenta la barra del buscador del scroll-padding: esa barra vive dentro de esta sección,
          debajo de su título, y no tapa el título al llegar. */}
      <section id="clases" aria-labelledby="clases-titulo" className="mt-14 scroll-mt-[calc(var(--subheader-h)*-1)] sm:mt-20">
        <div className="container-x">
          <h2 id="clases-titulo" className="font-display text-display-lg">
            Clases
          </h2>
        </div>
        <MovementFinder />
      </section>
    </>
  );
}
