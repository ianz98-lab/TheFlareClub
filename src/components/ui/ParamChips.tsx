"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

/**
 * Fila de chips que activan/desactivan un parámetro de la URL (un valor por parámetro).
 * Son enlaces: funcionan sin JS y se comparten. Cliente para poder leer la URL en export estático.
 */
export function ParamChips({
  param,
  options,
  allLabel,
  label,
}: {
  param: string;
  options: { value: string | number; label: string; muted?: boolean }[];
  allLabel?: string;
  label?: string;
}) {
  const sp = useSearchParams();
  const pathname = usePathname();
  const current = sp.get(param) ?? "";

  const href = (value: string) => {
    const next = new URLSearchParams(sp.toString());
    if (!value || current === value) next.delete(param);
    else next.set(param, value);
    const s = next.toString();
    return s ? `${pathname}?${s}` : pathname;
  };

  const cls = (active: boolean, muted?: boolean) =>
    `h-9 shrink-0 rounded-full border px-3.5 text-[13px] font-medium leading-9 transition-colors ${
      active ? "border-espresso bg-espresso text-cream" : "border-sand bg-cream hover:bg-cream-deep"
    } ${muted ? "opacity-50" : ""}`;

  return (
    <div>
      {label && <p className="mb-2 text-[11px] font-medium uppercase tracking-[0.18em] text-cocoa">{label}</p>}
      <div className="scroll-row -mx-4 px-4 sm:mx-0 sm:flex-wrap sm:px-0">
        {allLabel && (
          <Link href={href("")} scroll={false} className={cls(!current)}>
            {allLabel}
          </Link>
        )}
        {options.map((o) => (
          <Link key={o.value} href={href(String(o.value))} scroll={false} className={cls(current === String(o.value), o.muted)}>
            {o.label}
          </Link>
        ))}
      </div>
    </div>
  );
}

export function useParam(param: string) {
  return useSearchParams().get(param) ?? undefined;
}
