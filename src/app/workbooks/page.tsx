import { Reveal } from "@/components/motion/Reveal";
import { WorkbookFeature } from "@/components/cards/WorkbookFeature";
import { WORKBOOK_COVER } from "@/content/media";
import { workbooks } from "@/content/workbooks";
import { WORKBOOKS } from "@/content/site";
import { assetUrl } from "@/lib/asset";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({ title: WORKBOOKS.eyebrow, description: WORKBOOKS.description, path: "/workbooks", image: WORKBOOK_COVER });

/**
 * Por ahora hay un solo workbook: se muestra directo, con la descarga como CTA principal.
 * Sin filtros ni contador (pedido de las fundadoras); se activan cuando haya suficientes.
 * El hero y el primer workbook son primer pantallazo: llegan visibles desde el servidor (sin Reveal).
 */
export default function WorkbooksPage() {
  // Con uno solo, en celular y tablet la descarga queda lejos (portada de por medio): atajo en el hero.
  const only = workbooks.length === 1 ? workbooks[0] : undefined;

  return (
    <>
      {/*
        Sin banda de color (D2-C): el titular va sobre la superficie neutra y la imagen protagonista es la
        portada del workbook, justo debajo. Desktop: título a la izquierda y texto a la derecha, para que
        el workbook entre en la primera pantalla.
      */}
      <section className="container-x pb-10 pt-8 sm:pb-12 sm:pt-12 lg:grid lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:items-end lg:gap-16 lg:pb-14 lg:pt-16">
        <div>
          <p className="label text-ink-muted">{WORKBOOKS.eyebrow}</p>
          <h1 className="mt-3 max-w-[16ch] font-display text-display-xl">{WORKBOOKS.title}</h1>
        </div>
        <div>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-pretty text-ink-muted sm:text-lead lg:mt-0">{WORKBOOKS.description}</p>
          {/* El atajo va junto a la entradilla (es la acción); el aviso de lo que viene, después */}
          {only && (
            <a href={assetUrl(only.fileUrl)} download type="application/pdf" className="link-action mt-2 text-ink lg:hidden">
              {WORKBOOKS.cta}
              <span aria-hidden="true">↓</span>
              <span className="sr-only"> (PDF)</span>
            </a>
          )}
          <p className="rule-soft mt-4 max-w-xl pt-4 font-display text-display-sm lg:mt-6">{WORKBOOKS.comingSoon}</p>
        </div>
      </section>

      <section className="container-x pb-16 sm:pb-24">
        <div className="rule space-y-16 pt-10 sm:space-y-24 sm:pt-14 lg:pt-16">
          {workbooks.map((w, i) =>
            i === 0 ? (
              <WorkbookFeature key={w.id} w={w} preload />
            ) : (
              <Reveal key={w.id} className="rule pt-10 sm:pt-14">
                <WorkbookFeature w={w} />
              </Reveal>
            ),
          )}
        </div>
      </section>
    </>
  );
}
