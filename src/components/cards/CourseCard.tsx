import Image from "next/image";
import Link from "next/link";
import type { Course } from "@/content/types";
import { courseStats } from "@/content/courses";
import { instructorById } from "@/content/instructors";
import { AccessBadge } from "@/components/ui/Badge";
import { formatPrice } from "@/lib/format";

/** Ancho real de la portada: fila de 280–320 px en móvil y grilla de Row desde md (tope de .container-x). */
const SIZES = {
  grid: "(min-width: 1408px) 420px, (min-width: 1024px) 31vw, (min-width: 640px) 46vw, 90vw",
  row: "(min-width: 1408px) 420px, (min-width: 1024px) 31vw, (min-width: 768px) 46vw, 320px",
} as const;

export function CourseCard({ c, size = "grid" }: { c: Course; size?: "grid" | "row" }) {
  const s = courseStats(c);
  const inst = instructorById(c.instructorId);
  return (
    <Link href={`/cursos/${c.slug}`} className={`group block ${size === "row" ? "w-[280px] sm:w-[320px] md:w-full" : "w-full"}`}>
      <div className="card-media relative aspect-[16/11] overflow-hidden rounded-media bg-surface-alt">
        <Image src={c.cover} alt="" fill sizes={SIZES[size]} className="object-cover" />
      </div>
      <div className="rule-soft mt-4 pt-3">
        <div className="flex items-center justify-between gap-3 text-ink-muted">
          <p className="label">
            {s.modules} módulos · {s.minutes} min
          </p>
          {/* El precio es el dato clave de la card: en el acento */}
          {c.access === "paid" && c.price ? (
            <span className="text-sm font-medium tabular-nums text-accent-ink">{formatPrice(c.price)}</span>
          ) : (
            <AccessBadge access={c.access} />
          )}
        </div>
        {/* Mismo título que MediaCard: las dos conviven en las filas de Inicio */}
        <h3 className="mt-1.5 font-display text-display-sm">{c.title}</h3>
        <p className="mt-1.5 line-clamp-2 text-sm text-ink-muted">{c.tagline}</p>
        <p className="mt-2 text-sm text-ink-muted">Con {inst.name}</p>
      </div>
    </Link>
  );
}
