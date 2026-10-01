import type { Workbook } from "./types";
import { WORKBOOK_COVER } from "./media";

/**
 * Workbooks publicados. Por ahora hay uno solo (pedido de las fundadoras, 30-sep-2026):
 * sin filtros ni contador; cuando haya suficientes se activan categorías.
 */
export const workbooks: Workbook[] = [
  {
    id: "wb-autoconociendome",
    slug: "autoconociendome-para-decidir-de-nuevo",
    title: "Autoconociéndome para decidir de nuevo",
    description: "Un workbook para hacer una pausa, conocerte mejor y observar desde dónde estás tomando tus decisiones.",
    cover: WORKBOOK_COVER.src,
    fileUrl: "/workbooks/autoconociendome-para-decidir-de-nuevo.pdf",
    pages: 59,
    access: "free",
    featured: true,
  },
];

export const workbookById = (id: string) => workbooks.find((w) => w.id === id);
