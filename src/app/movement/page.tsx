import type { Metadata } from "next";
import { Suspense } from "react";
import { PageHero } from "@/components/PageHero";
import { MovementLibrary } from "@/components/libraries/MovementLibrary";

export const metadata: Metadata = { title: "Movement" };

export default function MovementPage() {
  return (
    <>
      <PageHero
        eyebrow="Movement"
        title="Tu biblioteca de clases"
        description="Pilates Mat, Barre, warm-ups y stretching. Filtra por tiempo, tipo y zona. Cada clase incluye un short de calentamiento."
        tone="rose"
        image="/images/clase-pilates-squat-ventanal.jpg"
      />
      <Suspense>
        <MovementLibrary />
      </Suspense>
    </>
  );
}
