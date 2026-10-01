import { LeadForm } from "@/components/forms/LeadForm";
import { RevealHeading, RevealList } from "@/components/motion/Reveal";
import { PageHero } from "@/components/PageHero";
import { TalkCard } from "@/components/cards/TalkCard";
import { publishedTalks } from "@/content/talks";
import { ABOUT_PHOTOS } from "@/content/media";
import { TALKS } from "@/content/site";
import { pageMetadata } from "@/lib/seo";

/** Una fundadora dando una charla (Sobre nosotras ya no la repite en su galería). */
const HERO = ABOUT_PHOTOS[1];

export const metadata = pageMetadata({ title: TALKS.eyebrow, description: TALKS.paragraphs[0], path: "/charlas", image: HERO });

/**
 * Charlas: presentación, aviso por correo de la próxima charla en vivo y, abajo, las grabaciones.
 * Mientras no haya ninguna publicada se muestra un estado vacío (sin filtros ni muestras).
 * La cabecera es la de todo el sitio (PageHero: foto protagonista sobre la superficie neutra); el aviso
 * va dentro, porque hoy es la acción principal de la página. Primer pantallazo: sin Reveal.
 */
export default function CharlasPage() {
  const recordings = [...publishedTalks].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));

  return (
    <>
      {/* Los dos párrafos del documento van juntos como entradilla (son dos frases cortas). */}
      <PageHero eyebrow={TALKS.eyebrow} title={TALKS.title} description={TALKS.paragraphs.join(" ")} image={HERO}>
        {/* #avisos: destino de "Activar notificaciones" en Inicio (llega directo al formulario) */}
        <div id="avisos" className="rule max-w-lg pt-6">
          <h2 className="font-display text-display-md">{TALKS.notify.title}</h2>
          <p className="mt-3 max-w-md text-body-sm leading-relaxed text-ink-muted">{TALKS.notify.description}</p>
          <LeadForm kind="notificaciones-charlas" source="charlas" cta={TALKS.notify.cta} done={TALKS.notify.done} className="mt-6" />
        </div>
      </PageHero>

      <section aria-labelledby="grabaciones" className="container-x pb-16 pt-6 sm:pb-24 sm:pt-10 lg:pt-14">
        {recordings.length > 0 ? (
          <>
            <div className="rule mb-8 pt-4">
              <h2 id="grabaciones" className="font-display text-display-lg">
                Grabaciones
              </h2>
            </div>
            <RevealList className="grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
              {recordings.map((t) => (
                <TalkCard key={t.id} t={t} />
              ))}
            </RevealList>
          </>
        ) : (
          // Estado vacío (texto del documento): la frase misma es el titular de la sección.
          <div className="rule pt-8 sm:pt-10">
            <RevealHeading id="grabaciones" className="max-w-[22ch] font-display text-display-lg">
              {TALKS.empty.title}
            </RevealHeading>
            <p className="mt-5 max-w-md text-base leading-relaxed text-ink-muted sm:text-lead">{TALKS.empty.description}</p>
          </div>
        )}
      </section>
    </>
  );
}
