"use client";

import { ParamChips, useParam } from "@/components/ui/ParamChips";
import { WorkbookCard } from "@/components/cards/WorkbookCard";
import { workbooks } from "@/content/workbooks";

const TABS = [
  { value: "member", label: "Incluidos en membresía" },
  { value: "free", label: "Gratuitos" },
  { value: "paid", label: "Pago individual" },
];

export function WorkbookLibrary() {
  const access = useParam("access");
  const items = access ? workbooks.filter((w) => w.access === access) : workbooks;
  return (
    <section className="container-x py-8">
      <ParamChips param="access" allLabel="Todos" options={TABS} />
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((w) => (
          <WorkbookCard key={w.id} w={w} />
        ))}
      </div>
    </section>
  );
}
