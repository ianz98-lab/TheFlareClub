import type { MetadataRoute } from "next";
import { THEME_COLOR } from "@/components/ui/tokens";

/** Export estático: el manifiesto se genera en el build. */
export const dynamic = "force-static";

/**
 * Manifiesto para "Agregar a inicio" en el celular. Ícono: la "F" del logo (decisión D4-B de Ian,
 * 30-sep), en public/ y generado con scripts/marca/iconos.py. El maskable deja la F dentro de la
 * zona segura (80 %) para que Android pueda recortarlo en círculo o gota.
 * Las rutas llevan el basePath de GitHub Pages (un manifiesto no lo agrega solo).
 */
export default function manifest(): MetadataRoute.Manifest {
  const base = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
  return {
    name: "The Flare Club",
    short_name: "Flare",
    description: "Movimiento, meditaciones, workbooks, charlas y eventos para volver a ti.",
    lang: "es",
    start_url: `${base}/`,
    scope: `${base}/`,
    display: "standalone",
    background_color: THEME_COLOR,
    theme_color: THEME_COLOR,
    icons: [
      { src: `${base}/icon-192.png`, sizes: "192x192", type: "image/png", purpose: "any" },
      { src: `${base}/icon.png`, sizes: "512x512", type: "image/png", purpose: "any" },
      { src: `${base}/icon-maskable.png`, sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
