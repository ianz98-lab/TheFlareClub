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
  ...(isPages
    ? {
        output: "export",
        basePath,
        trailingSlash: true,
        images: { loader: "custom", loaderFile: "./src/lib/image-loader.ts" },
      }
    : {}),
  env: { NEXT_PUBLIC_BASE_PATH: basePath },
};

export default nextConfig;
