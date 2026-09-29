"use client";

import type { ReactNode } from "react";

/** Filtro tipográfico: texto pequeño con subrayado al activarse. */
export function Chip({ active, onClick, children, className = "" }: { active?: boolean; onClick?: () => void; children: ReactNode; className?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`h-9 shrink-0 rounded-xs border px-3 text-[13px] transition-colors ${
        active ? "border-espresso bg-espresso text-cream" : "border-sand text-espresso hover:border-espresso"
      } ${className}`}
    >
      {children}
    </button>
  );
}
