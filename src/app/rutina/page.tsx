import Link from "next/link";
import { PageHero } from "@/components/PageHero";
import { RoutineBuilder } from "@/components/routine/RoutineBuilder";
import { Icon } from "@/components/ui/Icon";
import { ROUTINE } from "@/content/site";
import { pageMetadata } from "@/lib/seo";

const HERO_IMAGE = "/images/eventos/pilates-mindfulness-may-2026/03.jpg";

export const metadata = pageMetadata({ title: "Arma tu rutina", description: ROUTINE.description, path: "/rutina", image: HERO_IMAGE });

/** Arma tu rutina: herramienta de Movement (no es una sección propia del menú). */
export default function RutinaPage() {
  return (
    <>
      {/* Sin eyebrow: la miga "Movement" ya da el contexto */}
      <PageHero
        compact
        crumb={
          <Link href="/movement" className="link-action -my-3 text-ink-muted">
            <Icon name="arrow-left" size={16} />
            Movement
          </Link>
        }
        title={ROUTINE.title}
        description={ROUTINE.description}
        image={HERO_IMAGE}
      />
      <RoutineBuilder />
    </>
  );
}
