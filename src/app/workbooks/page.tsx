import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/PageHero";
import { WorkbookCard } from "@/components/cards/WorkbookCard";
import { workbooks } from "@/content/workbooks";

export const metadata: Metadata = { title: "Workbooks" };

const TABS = [
  { value: "", label: "Todos" },
  { value: "member", label: "Incluidos en membresía" },
  { value: "free", label: "Gratuitos" },
  { value: "paid", label: "Pago individual" },
] as const;

export default async function WorkbooksPage({ searchParams }: PageProps<"/workbooks">) {
  const sp = await searchParams;
  const access = typeof sp.access === "string" ? sp.access : "";
  const items = access ? workbooks.filter((w) => w.access === access) : workbooks;

  return (
    <>
      <PageHero
        eyebrow="Workbooks"
        title="Escribe, ordena, decide"
        description="Recursos descargables para journaling, planeación y reflexión. Imprímelos o úsalos en tu tablet."
        tone="rose"
        image="/images/coach-evento-gorra-vertical.jpg"
      />
      <section className="container-x py-8">
        <div className="scroll-row -mx-4 px-4 sm:mx-0 sm:flex-wrap sm:px-0">
          {TABS.map((t) => (
            <Link
              key={t.value}
              href={t.value ? `/workbooks?access=${t.value}` : "/workbooks"}
              className={`h-9 shrink-0 rounded-full border px-3.5 text-[13px] font-medium leading-9 ${
                access === t.value ? "border-espresso bg-espresso text-cream" : "border-sand"
              }`}
            >
              {t.label}
            </Link>
          ))}
        </div>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((w) => (
            <WorkbookCard key={w.id} w={w} />
          ))}
        </div>
      </section>
    </>
  );
}
