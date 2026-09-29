"use client";

import type { ReactNode } from "react";

export function Chip({
  active,
  onClick,
  children,
  className = "",
}: {
  active?: boolean;
  onClick?: () => void;
  children: ReactNode;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`h-9 shrink-0 rounded-full border px-3.5 text-[13px] font-medium transition-colors ${
        active
          ? "border-espresso bg-espresso text-cream"
          : "border-sand bg-cream text-espresso hover:bg-cream-deep"
      } ${className}`}
    >
      {children}
    </button>
  );
}
