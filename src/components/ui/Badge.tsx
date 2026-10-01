import type { ReactNode } from "react";
import { ACCESS_LABEL } from "@/lib/format";

/**
 * "neutral": meta normal (tinta secundaria). "accent": lo único que pide atención (Nuevo, Pago,
 * Próximamente), en el terracota para texto chico. Un solo acento (D2-C): nada de colores por módulo.
 */
type Tone = "neutral" | "accent";

const tones: Record<Tone, string> = {
  neutral: "text-ink-muted",
  accent: "text-accent-ink",
};

/** Etiqueta tipográfica: meta en versalitas, sin fondo. */
export function Badge({ tone = "neutral", children, className = "" }: { tone?: Tone; children: ReactNode; className?: string }) {
  return <span className={`label inline-flex items-center gap-1 ${tones[tone]} ${className}`}>{children}</span>;
}

/**
 * Acceso de un contenido, con los mismos textos que el detalle (ACCESS_LABEL).
 * "Membresía" no se marca: es lo normal dentro del club.
 */
export function AccessBadge({ access }: { access: string }) {
  if (access === "public" || access === "free") return <Badge>{ACCESS_LABEL[access]}</Badge>;
  if (access === "paid") return <Badge tone="accent">{ACCESS_LABEL.paid}</Badge>;
  return null;
}
