"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { CLASS_TYPES, DURATIONS, FOCUS, FOCUS_PRIMARY } from "@/content/taxonomies";
import { Chip } from "@/components/ui/Chip";
import { Icon } from "@/components/ui/Icon";

type Option = { value: string | number; label: string };

function FilterRow({
  label,
  selected,
  options,
  onToggle,
}: {
  label: string;
  selected: string[];
  options: Option[];
  onToggle: (value: string) => void;
}) {
  return (
    <div>
      <p className="mb-2 text-[11px] font-medium uppercase tracking-[0.18em] text-cocoa">{label}</p>
      <div className="scroll-row -mx-4 px-4 sm:mx-0 sm:flex-wrap sm:px-0">
        {options.map((o) => (
          <Chip key={o.value} active={selected.includes(String(o.value))} onClick={() => onToggle(String(o.value))}>
            {o.label}
          </Chip>
        ))}
      </div>
    </div>
  );
}

const FOCUS_OPTIONS = FOCUS.filter((f) => FOCUS_PRIMARY.includes(f.value));

/** Filtros de la biblioteca Movement. Estado en la URL para poder compartir enlaces. */
export function MovementFilters({ total }: { total: number }) {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();
  const [pending, start] = useTransition();

  const get = (k: string) => (sp.get(k) ?? "").split(",").filter(Boolean);

  const toggle = (key: string) => (value: string) => {
    const next = new URLSearchParams(sp.toString());
    const cur = get(key);
    const val = cur.includes(value) ? cur.filter((v) => v !== value) : [...cur, value];
    if (val.length) next.set(key, val.join(","));
    else next.delete(key);
    start(() => router.replace(`${pathname}?${next.toString()}`, { scroll: false }));
  };

  const clear = () => start(() => router.replace(pathname, { scroll: false }));
  const active = get("duration").length + get("type").length + get("focus").length;

  return (
    <div className={`space-y-4 transition-opacity ${pending ? "opacity-60" : ""}`}>
      <FilterRow label="Duración" selected={get("duration")} options={DURATIONS} onToggle={toggle("duration")} />
      <FilterRow label="Tipo" selected={get("type")} options={CLASS_TYPES} onToggle={toggle("type")} />
      <FilterRow label="Enfoque" selected={get("focus")} options={FOCUS_OPTIONS} onToggle={toggle("focus")} />
      <div className="flex items-center justify-between pt-1 text-sm text-cocoa">
        <span className="flex items-center gap-1.5">
          <Icon name="filter" size={15} /> {total} {total === 1 ? "clase" : "clases"}
        </span>
        {active > 0 && (
          <button type="button" onClick={clear} className="font-medium text-terracotta hover:underline">
            Limpiar filtros ({active})
          </button>
        )}
      </div>
    </div>
  );
}
