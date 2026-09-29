import type { ReactNode } from "react";

type Tone = "neutral" | "rose" | "sage" | "sky" | "terracotta" | "dark" | "light";

const tones: Record<Tone, string> = {
  neutral: "bg-cream-deep text-cocoa",
  rose: "bg-rose-soft text-mauve",
  sage: "bg-sage-soft text-[#4f6249]",
  sky: "bg-sky-soft text-[#475a6e]",
  terracotta: "bg-terracotta text-cream",
  dark: "bg-espresso text-cream",
  light: "bg-cream/90 text-espresso backdrop-blur",
};

export function Badge({
  tone = "neutral",
  children,
  className = "",
}: {
  tone?: Tone;
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium tracking-wide ${tones[tone]} ${className}`}
    >
      {children}
    </span>
  );
}

export function AccessBadge({ access }: { access: string }) {
  if (access === "public" || access === "free")
    return <Badge tone="sage">Gratis</Badge>;
  if (access === "paid") return <Badge tone="terracotta">Compra</Badge>;
  return null;
}
