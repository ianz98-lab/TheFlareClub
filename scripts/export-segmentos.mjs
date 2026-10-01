/**
 * Solo para el export estático (GITHUB_PAGES=true). En Windows, `next build` escribe los
 * segmentos RSC en carpetas (`movement/__next.movement/__PAGE__.txt`), pero el prefetch del
 * navegador los pide con nombre plano (`movement/__next.movement.__PAGE__.txt`) y daría 404.
 * Este paso crea la copia plana. En Linux (GitHub Actions) ya salen planos y no hace nada.
 */
import { copyFile, readdir, stat } from "node:fs/promises";
import { join, relative, sep } from "node:path";

if (process.env.GITHUB_PAGES !== "true") process.exit(0);

const OUT = new URL("../out/", import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1");
const exists = (p) => stat(p).then(() => true, () => false);

let made = 0;
async function walk(dir) {
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (!e.isDirectory()) continue;
    if (e.name.startsWith("__next.")) await flatten(dir, p);
    else await walk(p);
  }
}

async function flatten(pageDir, segDir) {
  for (const e of await readdir(segDir, { withFileTypes: true, recursive: true })) {
    if (!e.isFile() || !e.name.endsWith(".txt")) continue;
    const file = join(e.parentPath ?? e.path, e.name);
    const flat = join(pageDir, relative(pageDir, file).split(sep).join("."));
    if (!(await exists(flat))) {
      await copyFile(file, flat);
      made++;
    }
  }
}

if (await exists(OUT)) {
  await walk(OUT);
  console.log(`[export] segmentos planos: ${made}`);
}
