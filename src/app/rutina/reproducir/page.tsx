import type { Metadata } from "next";
import { RoutinePlayer } from "@/components/routine/RoutinePlayer";
import { ROUTINE } from "@/content/site";
import { pageMetadata } from "@/lib/seo";

// La rutina vive en el navegador de cada usuaria: esta página no tiene contenido propio que indexar.
export const metadata: Metadata = {
  ...pageMetadata({ title: "Tu rutina", description: ROUTINE.description, path: "/rutina/reproducir" }),
  robots: { index: false },
};

export default function ReproducirPage() {
  return <RoutinePlayer />;
}
