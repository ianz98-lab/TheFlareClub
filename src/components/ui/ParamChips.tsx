"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

/**
 * Fila de filtros que activan/desactivan un parámetro de la URL (un valor por parámetro).
 * Son enlaces: se comparten y funcionan en export estático.
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
    `h-9 shrink-0 rounded-xs border px-3 text-[13px] leading-9 transition-colors ${
      active ? "border-espresso bg-espresso text-cream" : "border-sand text-espresso hover:border-espresso"
    } ${muted ? "opacity-40" : ""}`;

  return (
    <div>
      {label && <p className="label mb-2 text-cocoa">{label}</p>}
      <div className="scroll-row -mx-5 px-5 sm:mx-0 sm:flex-wrap sm:px-0">
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
