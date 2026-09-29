import type { Metadata } from "next";
import { Suspense } from "react";
import { PageHero } from "@/components/PageHero";
import { TalkLibrary } from "@/components/libraries/TalkLibrary";

export const metadata: Metadata = { title: "Charlas" };

export default function CharlasPage() {
  return (
    <>
      <PageHero
        eyebrow="Charlas"
        title="Conversaciones con expertas"
        description="Nutrición, autoestima, relaciones, hábitos, sueño, finanzas. Charlas pregrabadas para ver cuando quieras."
        tone="sand"
        image="/images/coaches-mariana-sofi-retrato.jpg"
      />
      <Suspense>
        <TalkLibrary />
      </Suspense>
    </>
  );
}
