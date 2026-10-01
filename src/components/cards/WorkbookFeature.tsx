import Image from "next/image";
import type { Workbook } from "@/content/types";
import { ButtonAnchor } from "@/components/ui/Button";
import { WORKBOOK_COVER } from "@/content/media";
import { WORKBOOKS } from "@/content/site";
import { assetUrl } from "@/lib/asset";
import { formatPrice } from "@/lib/format";

/** Proporción real de la portada si la conocemos; si no, A4 (los workbooks son PDF para imprimir). */
function coverOf(w: Workbook) {
  if (w.cover === WORKBOOK_COVER.src) return WORKBOOK_COVER;
  return { src: w.cover, width: 210, height: 297, alt: `Portada del workbook ${w.title}` };
}

/**
 * Workbook destacado: portada limpia (sin texto encima), título, descripción, meta y descarga.
 * - normal: página /workbooks (portada grande a la izquierda en desktop).
 * - compact: Inicio y Mi cuenta (horizontal en desktop, apilado en móvil).
 * `preload`: cuando la portada está en el primer pantallazo (es el LCP de /workbooks).
 * Sin hooks: sirve igual en componentes de servidor y de cliente.
 */
export function WorkbookFeature({ w, compact = false, preload = false }: { w: Workbook; compact?: boolean; preload?: boolean }) {
  const cover = coverOf(w);
  const Title = compact ? "h3" : "h2";
  const paid = w.access === "paid" && w.checkoutUrl;
  const button = { size: compact ? "md" : "xl", className: "w-full sm:w-auto" } as const;

  return (
    <article
      className={
        compact
          ? "grid grid-cols-[minmax(0,1fr)] gap-6 md:grid-cols-[180px_minmax(0,1fr)] md:items-center md:gap-10 lg:grid-cols-[220px_minmax(0,1fr)]"
          : // Texto arriba (no centrado junto a la portada) para que la descarga se vea sin bajar en desktop.
            "grid grid-cols-[minmax(0,1fr)] gap-8 md:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] md:items-start md:gap-14 lg:gap-20"
      }
    >
      <div
        className={`relative max-w-full overflow-hidden rounded-media bg-surface-alt ring-1 ring-line ${compact ? "w-40 sm:w-44 md:w-full" : "w-full sm:max-w-sm md:max-w-md"}`}
        style={{ aspectRatio: `${cover.width} / ${cover.height}` }}
      >
        <Image
          src={cover.src}
          alt={cover.alt ?? ""}
          fill
          preload={preload}
          sizes={compact ? "(min-width: 1024px) 220px, 180px" : "(min-width: 768px) 448px, (min-width: 640px) 384px, 100vw"}
          className="object-cover"
        />
      </div>

      <div className="min-w-0">
        {/* h2 en /workbooks (display-lg) · h3 en Inicio y Mi cuenta (display-md) */}
        <Title className={`font-display ${compact ? "text-display-md" : "text-display-lg"}`}>{w.title}</Title>
        <p className={`mt-4 max-w-md leading-relaxed text-pretty text-ink-muted ${compact ? "text-body-sm" : "text-base sm:text-lead"}`}>{w.description}</p>
        <p className="label rule-soft mt-6 max-w-md pt-3 text-ink-muted">{w.pages} páginas · PDF para imprimir</p>

        <div className="mt-6">
          {paid ? (
            <ButtonAnchor href={w.checkoutUrl} external {...button}>
              Comprar · {formatPrice(w.price ?? 0)}
            </ButtonAnchor>
          ) : (
            <ButtonAnchor href={assetUrl(w.fileUrl)} download type="application/pdf" {...button}>
              {WORKBOOKS.cta}
              <span className="sr-only"> {w.title} (PDF)</span>
            </ButtonAnchor>
          )}
        </div>
      </div>
    </article>
  );
}
