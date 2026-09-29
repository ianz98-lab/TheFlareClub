import type { Metadata } from "next";
import { Suspense } from "react";
import { PageHero } from "@/components/PageHero";
import { MeditationLibrary } from "@/components/libraries/MeditationLibrary";

export const metadata: Metadata = { title: "Meditaciones" };

export default function MeditacionesPage() {
  return (
    <>
      <PageHero
        eyebrow="Meditaciones"
        title="Calma para cualquier momento"
        description="Por momento del día o por lo que estás sintiendo. De cinco a veinte minutos, guiadas por Mariana y Sofi."
        tone="sage"
        image="/images/meditacion-clase-ventanal.jpg"
      />
      <Suspense>
        <MeditationLibrary />
      </Suspense>
    </>
  );
}
