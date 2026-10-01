import type { NextConfig } from "next";

/**
 * Dos modos de build:
 * - Normal (Vercel / local): SSR completo.
 * - GITHUB_PAGES=true: export estático bajo /TheFlareClub para el prototipo público
 *   en https://ianz98-lab.github.io/TheFlareClub/ (ver .github/workflows/pages.yml).
 */
const isPages = process.env.GITHUB_PAGES === "true";
const basePath = isPages ? "/TheFlareClub" : "";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [{ protocol: "https", hostname: "i.scdn.co" }],
    // Mismos anchos que las variantes de las fotos (src/lib/image-variants.ts): cada ancho del
    // srcset cae justo en un archivo y 1440 px de pantalla piden la w1600, no la original.
    deviceSizes: [480, 640, 960, 1200, 1600, 2400],
    // Miniaturas de ancho fijo (64–384 px): el loader las sirve con la variante más chica.
    imageSizes: [64, 128, 256, 384],
    ...(isPages ? { loader: "custom" as const, loaderFile: "./src/lib/image-loader.ts" } : {}),
  },
  ...(isPages
    ? {
        output: "export",
        basePath,
        trailingSlash: true,
      }
    : {}),
  env: { NEXT_PUBLIC_BASE_PATH: basePath },
};

export default nextConfig;
