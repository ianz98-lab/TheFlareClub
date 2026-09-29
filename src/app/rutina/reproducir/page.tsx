import type { Metadata } from "next";
import { RoutinePlayer } from "@/components/routine/RoutinePlayer";

export const metadata: Metadata = { title: "Tu rutina" };

export default function ReproducirPage() {
  return <RoutinePlayer />;
}
