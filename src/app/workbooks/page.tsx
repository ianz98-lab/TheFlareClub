import type { Metadata } from "next";
import { Suspense } from "react";
import { PageHero } from "@/components/PageHero";
import { WorkbookFinder } from "@/components/finder/finders";

export const metadata: Metadata = { title: "Workbooks" };

export default function WorkbooksPage() {
  return (
    <>
      <PageHero compact eyebrow="Workbooks" title="Workbooks" description="Recursos descargables para journaling, planeación y reflexión. Imprímelos o úsalos en tu tablet." tone="rose" image="/images/coach-evento-gorra-vertical.jpg" />
      <Suspense>
        <WorkbookFinder />
      </Suspense>
    </>
  );
}
