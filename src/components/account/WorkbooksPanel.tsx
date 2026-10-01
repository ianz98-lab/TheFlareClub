import Image from "next/image";
import { NewTabHint } from "@/components/ui/NewTabHint";
import { WORKBOOK_COVER } from "@/content/media";
import { WORKBOOKS } from "@/content/site";
import type { Workbook } from "@/content/types";
import { workbooks } from "@/content/workbooks";
import { assetUrl } from "@/lib/asset";
import { formatPrice } from "@/lib/format";
import type { Purchase } from "@/lib/user-data";
import { PortalSection } from "./portal-ui";

/** Proporción real de la portada si la conocemos; si no, A4 (los workbooks son PDF para imprimir). */
const ratioOf = (w: Workbook) => (w.cover === WORKBOOK_COVER.src ? `${WORKBOOK_COVER.width} / ${WORKBOOK_COVER.height}` : "210 / 297");

/**
 * Workbooks en Mi cuenta: una fila por workbook con su descarga (A079), no el bloque destacado de
 * /workbooks. Los de pago se descargan si los compró ("workbook:<slug>"); si no, se compran en Recurrente.
 */
export function WorkbooksPanel({ purchases }: { purchases: Purchase[] }) {
  if (!workbooks.length) return null;
  return (
    <PortalSection id="workbooks" title="Workbooks" href="/workbooks" linkLabel="Ver workbooks">
      <ul className="border-t border-line">
        {workbooks.map((w) => {
          const owned = purchases.some((p) => p.itemKey === `workbook:${w.slug}`);
          const buy = w.access === "paid" && w.checkoutUrl && !owned ? w.checkoutUrl : null;
          return (
            <li key={w.id} className="flex items-center gap-4 border-b border-line py-4 sm:gap-6">
              {/* Bajo 360 px la portada sale: al lado, el título en Gloock se partía a media palabra */}
              <div className="relative w-12 shrink-0 overflow-hidden rounded-media bg-surface-alt ring-1 ring-line narrow:hidden sm:w-14" style={{ aspectRatio: ratioOf(w) }}>
                <Image src={w.cover} alt="" fill sizes="56px" className="object-cover" />
              </div>
              <div className="flex min-w-0 flex-1 flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-8">
                <div className="min-w-0">
                  <p className="font-display text-display-sm">{w.title}</p>
                  <p className="mt-1 text-sm text-ink-muted">{w.pages} páginas · PDF para imprimir</p>
                </div>
                {buy ? (
                  <a href={buy} target="_blank" rel="noopener noreferrer" className="link-action -my-2 shrink-0 sm:my-0">
                    Comprar · {formatPrice(w.price ?? 0)}
                    <NewTabHint />
                  </a>
                ) : (
                  <a href={assetUrl(w.fileUrl)} download type="application/pdf" className="link-action -my-2 shrink-0 sm:my-0">
                    {WORKBOOKS.cta}
                    <span className="sr-only">: {w.title} (PDF)</span>
                  </a>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </PortalSection>
  );
}
