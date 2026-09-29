import type { Metadata } from "next";
import { Suspense } from "react";
import { PageHero } from "@/components/PageHero";
import { TalkFinder } from "@/components/finder/finders";

export const metadata: Metadata = { title: "Charlas" };

export default function CharlasPage() {
  return (
    <>
      <PageHero compact eyebrow="Charlas" title="Charlas con expertas" description="Nutrición, autoestima, relaciones, hábitos, sueño, finanzas. Pregrabadas, para ver cuando quieras." tone="sand" image="/images/coaches-mariana-sofi-retrato.jpg" />
      <Suspense>
        <TalkFinder />
      </Suspense>
    </>
  );
}
