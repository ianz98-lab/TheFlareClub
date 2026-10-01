import { LeadForm } from "@/components/forms/LeadForm";
import { PageHero } from "@/components/PageHero";
import { STUDIO_PHOTOS } from "@/content/media";
import { COURSES } from "@/content/site";
import { pageMetadata } from "@/lib/seo";

const PHOTO = STUDIO_PHOTOS.estocada;

export const metadata = pageMetadata({ title: COURSES.eyebrow, description: COURSES.paragraphs[0], path: "/cursos", image: PHOTO });

/**
 * Cursos: todavía no hay ninguno publicado. La página es solo el anuncio y la lista de espera
 * (pedido de las fundadoras: "quitar todo lo de la página"). Cuando COURSES.status sea "live",
 * aquí vuelve la grilla de CourseCard.
 * La cabecera es la de todo el sitio (PageHero) y la lista de espera va dentro: todo es primer
 * pantallazo y llega visible desde el servidor (sin Reveal ni parallax).
 */
export default function CursosPage() {
  return (
    <PageHero
      eyebrow={COURSES.eyebrow}
      title={COURSES.title}
      description={COURSES.paragraphs.join(" ")}
      image={PHOTO}
      imagePosition="center 35%"
    >
      {/* #lista-espera: destino de "Unirme a la lista de espera" en Inicio (llega directo al formulario) */}
      <div id="lista-espera" className="rule max-w-lg pt-6">
        <h2 className="font-display text-display-md">{COURSES.waitlistPrompt}</h2>
        <LeadForm kind="lista-espera-cursos" source="cursos" cta={COURSES.cta} done={COURSES.done} className="mt-6" />
      </div>
    </PageHero>
  );
}
