/**
 * Genera las variantes livianas de cada foto de public/images. El sitio estático de GitHub
 * Pages no tiene optimizador de imágenes: el loader (src/lib/image-loader.ts) pide estas
 * variantes según el ancho. Corre solo antes de cada build (`prebuild`) y únicamente crea las
 * que faltan o están desactualizadas. Las variantes no se suben a git (ver .gitignore).
 *
 * - WebP (lo que sirve el loader): `.w480.webp` … `.w2400.webp`.
 * - JPEG de respaldo hasta 1600 (og:image, descargas): `.w480.jpg` … `.w1600.jpg`.
 * Mismos anchos que src/lib/image-variants.ts y next.config.ts (deviceSizes).
 *
 * Antes, los recortes de CROPS: fotos derivadas a mano (p. ej. la versión vertical del hero
 * para celular). Esas sí se suben a git y pasan por las variantes como cualquier otra.
 */
import { copyFile, readdir, stat } from "node:fs/promises";
import { join } from "node:path";

// sharp viene con Next; si en algún entorno no carga, se copian las originales para no romper el sitio.
const sharp = await import("sharp").then((m) => m.default).catch(() => null);
if (!sharp) console.warn("[fotos] sharp no disponible: las variantes serán copias de la original");

const ROOT = new URL("../../public/images/", import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1");

const WEBP = { widths: [480, 640, 960, 1200, 1600, 2400], quality: 75 };
const JPEG = { widths: [480, 640, 960, 1200, 1600], quality: 78 };

/**
 * Recortes fijos (rutas relativas a public/images). `extract` en px de la original.
 * fundadoras-…-movil: 4:5 con las dos caras centradas, para el hero de Inicio bajo 640 px.
 */
const CROPS = [
  {
    from: "fundadoras-mariana-sofi-estudio.jpg",
    to: "fundadoras-mariana-sofi-estudio-movil.jpg",
    extract: { left: 639, top: 0, width: 1133, height: 1416 },
  },
];

const isVariant = (f) => /\.w\d+\.(jpg|webp)$/.test(f);

async function* jpgs(dir) {
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) yield* jpgs(p);
    else if (e.name.endsWith(".jpg") && !isVariant(e.name)) yield p;
  }
}

const newer = async (a, b) => {
  try {
    return (await stat(a)).mtimeMs > (await stat(b)).mtimeMs;
  } catch {
    return true; // b no existe
  }
};

let crops = 0;
if (sharp) {
  for (const { from, to, extract } of CROPS) {
    const src = join(ROOT, from);
    const out = join(ROOT, to);
    if (!(await newer(src, out))) continue;
    await sharp(src).extract(extract).jpeg({ quality: 82, progressive: true, mozjpeg: true }).toFile(out);
    crops++;
  }
}

/** Una tarea por archivo que falta; se procesan de a pocas para no saturar la memoria. */
const jobs = [];
for await (const src of jpgs(ROOT)) {
  const base = src.slice(0, -4);
  for (const w of WEBP.widths) jobs.push({ src, out: `${base}.w${w}.webp`, w, format: "webp" });
  for (const w of JPEG.widths) jobs.push({ src, out: `${base}.w${w}.jpg`, w, format: "jpg" });
}

async function make({ src, out, w, format }) {
  if (!(await newer(src, out))) return 0;
  if (!sharp) {
    // Sin sharp se copia la original con el nombre de la variante (también la .webp: el navegador
    // reconoce la imagen por su contenido). Más pesada, pero el sitio no queda con fotos rotas.
    await copyFile(src, out);
    return 1;
  }
  const img = sharp(src).resize({ width: w, withoutEnlargement: true });
  if (format === "webp") await img.webp({ quality: WEBP.quality, effort: 5 }).toFile(out);
  else await img.jpeg({ quality: JPEG.quality, progressive: true, mozjpeg: true }).toFile(out);
  return 1;
}

let made = 0;
const CONCURRENCY = 4;
for (let i = 0; i < jobs.length; i += CONCURRENCY) {
  const done = await Promise.all(jobs.slice(i, i + CONCURRENCY).map(make));
  made += done.reduce((a, b) => a + b, 0);
}
console.log(`[fotos] recortes: ${crops} nuevos · variantes: ${made} nuevas`);
