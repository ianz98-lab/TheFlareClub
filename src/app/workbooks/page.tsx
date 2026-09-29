import type { Metadata } from "next";
import { Suspense } from "react";
import { PageHero } from "@/components/PageHero";
import { WorkbookLibrary } from "@/components/libraries/WorkbookLibrary";

export const metadata: Metadata = { title: "Workbooks" };

export default function WorkbooksPage() {
  return (
    <>
      <PageHero
        eyebrow="Workbooks"
        title="Escribe, ordena, decide"
        description="Recursos descargables para journaling, planeación y reflexión. Imprímelos o úsalos en tu tablet."
        tone="rose"
        image="/images/coach-evento-gorra-vertical.jpg"
      />
      <Suspense>
        <WorkbookLibrary />
      </Suspense>
    </>
  );
}
