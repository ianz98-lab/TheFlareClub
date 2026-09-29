import type { Metadata } from "next";
import { Suspense } from "react";
import { PageHero } from "@/components/PageHero";
import { MovementFinder } from "@/components/finder/finders";
import { ButtonLink } from "@/components/ui/Button";

export const metadata: Metadata = { title: "Movement" };

export default function MovementPage() {
  return (
    <>
      <PageHero compact eyebrow="Movement" title="Clases" description="Pilates Mat, Barre, warm-ups y stretching. Filtra por tiempo, tipo y zona, o arma una rutina completa en un minuto." tone="rose" image="/images/clase-pilates-squat-ventanal.jpg">
        <ButtonLink href="/rutina" size="sm">
          Arma tu rutina
        </ButtonLink>
      </PageHero>
      <Suspense>
        <MovementFinder />
      </Suspense>
    </>
  );
}
