import type { Metadata } from "next";
import { Suspense } from "react";
import { PageHero } from "@/components/PageHero";
import { MeditationFinder } from "@/components/finder/finders";

export const metadata: Metadata = { title: "Meditaciones" };

export default function MeditacionesPage() {
  return (
    <>
      <PageHero compact eyebrow="Meditaciones" title="Meditaciones" description="Por momento del día o por cómo te sientes. De cinco a veinte minutos." tone="sage" image="/images/meditacion-clase-ventanal.jpg" />
      <Suspense>
        <MeditationFinder />
      </Suspense>
    </>
  );
}
