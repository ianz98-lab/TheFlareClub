# Fotos

- **Dónde viven:** `public/images/` (web) y el inventario tipado en `src/content/media.ts`
  (dimensiones, `alt`, punto focal). Las páginas usan siempre la ruta base `.jpg`.
- **Estructura:** `eventos/<slug>/portada.jpg` (flyer oficial) + `01.jpg…` (galería, mejores primero);
  `meditaciones/`, `corporativo/`, `nosotras/`, `workbooks/`.
- **Exportar originales:** `python scripts/fotos/exportar.py <carpeta> eventos/<slug> mejor.jpg segunda.jpg …`
  (lado largo 2400 px, calidad 82, sin EXIF/GPS, nunca amplía) y pegar las líneas que imprime en `media.ts`.
- **Variantes:** `scripts/fotos/variantes.mjs` crea WebP de 480 a 2400 px y JPEG de respaldo hasta 1600 px antes de
  cada `npm run build` (no se suben a git). El loader de GitHub Pages (`src/lib/image-loader.ts`) elige la más chica
  que cubre el ancho pedido. Los anchos están en `src/lib/image-variants.ts` (igual en `next.config.ts`).
- **Recortes fijos:** `CROPS` en `variantes.mjs` (p. ej. el hero vertical de Inicio para celular); esos sí van a git.
- **Probar el sitio publicado en local:** `GITHUB_PAGES=true npm run build` y `npm run preview:pages`.
- **Criterio:** fuera las borrosas, oscuras o de captura de pantalla; si solo hay versión de WhatsApp,
  pedir el original al fotógrafo. Los originales (zips) no se suben al repo.
