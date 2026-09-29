import type { ReactNode } from "react";

type Tone = "neutral" | "rose" | "sage" | "sky" | "terracotta" | "dark" | "light";

const tones: Record<Tone, string> = {
  neutral: "text-cocoa",
  rose: "text-mauve",
  sage: "text-[#5b6d54]",
  sky: "text-[#4b5f74]",
  terracotta: "text-terracotta",
  dark: "text-espresso",
  light: "text-cream",
};

/** Etiqueta tipográfica: texto pequeño en versalitas, sin fondo. */
export function Badge({ tone = "neutral", children, className = "" }: { tone?: Tone; children: ReactNode; className?: string }) {
  return <span className={`label inline-flex items-center gap-1 ${tones[tone]} ${className}`}>{children}</span>;
}

export function AccessBadge({ access }: { access: string }) {
  if (access === "public" || access === "free") return <Badge tone="sage">Gratis</Badge>;
  if (access === "paid") return <Badge tone="terracotta">Compra</Badge>;
  return null;
}
