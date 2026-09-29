import type { Metadata } from "next";
import { PageHero } from "@/components/PageHero";
import { RoutineBuilder } from "@/components/routine/RoutineBuilder";

export const metadata: Metadata = { title: "Arma tu rutina" };

export default function RutinaPage() {
  return (
    <>
      <PageHero compact eyebrow="Rutinas" title="Arma tu rutina" description="Calentamiento, clase, stretch y cierre. Eliges una vez y los videos corren seguidos, sin tocar nada. Guárdala y repítela cuando quieras." tone="sand" image="/images/clase-04.jpg" />
      <RoutineBuilder />
    </>
  );
}
