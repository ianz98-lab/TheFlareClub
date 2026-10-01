import { PageHero } from "@/components/PageHero";
import { MeditationFinder } from "@/components/finder/finders";
import { MEDITATIONS } from "@/content/site";
import { MEDITATION_PHOTOS } from "@/content/media";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({ title: "Meditaciones", description: MEDITATIONS.description, path: "/meditaciones", image: MEDITATION_PHOTOS[0] });

export default function MeditacionesPage() {
  return (
    <>
      {/* Sin eyebrow: repetiría el título ("Meditaciones") */}
      <PageHero compact title={MEDITATIONS.title} description={MEDITATIONS.description} image={MEDITATION_PHOTOS[0].src} />
      {/* Sin Suspense: el catálogo viene completo en el HTML y los filtros de la URL se aplican al hidratar */}
      <MeditationFinder />
    </>
  );
}
