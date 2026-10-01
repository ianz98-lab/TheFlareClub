/**
 * Sirve el export estático (`out/`) como lo haría GitHub Pages: bajo /TheFlareClub, con
 * index.html por carpeta y 404.html para rutas que no existen.
 * Uso: `GITHUB_PAGES=true npm run build` y luego `npm run preview:pages` → http://localhost:4173/TheFlareClub/
 */
import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import { createServer } from "node:http";
import { extname, join, resolve, sep } from "node:path";

const OUT = new URL("../out/", import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1");
const BASE = "/TheFlareClub";
const PORT = Number(process.env.PORT ?? 4173);
const TYPES = {
  ".html": "text/html; charset=utf-8", ".txt": "text/plain; charset=utf-8", ".js": "text/javascript", ".css": "text/css",
  ".json": "application/json", ".jpg": "image/jpeg", ".png": "image/png", ".svg": "image/svg+xml", ".ico": "image/x-icon",
  ".pdf": "application/pdf", ".woff2": "font/woff2", ".webp": "image/webp",
};

const isFile = (p) => stat(p).then((s) => s.isFile(), () => false);

createServer(async (req, res) => {
  const url = new URL(req.url ?? "/", "http://localhost");
  if (url.pathname === "/" || url.pathname === BASE) {
    res.writeHead(302, { Location: `${BASE}/` }).end();
    return;
  }
  if (!url.pathname.startsWith(`${BASE}/`)) {
    res.writeHead(404).end("Fuera del sitio");
    return;
  }
  const root = resolve(OUT);
  let file = resolve(root, `.${decodeURIComponent(url.pathname.slice(BASE.length))}`);
  if (file !== root && !file.startsWith(root + sep)) {
    res.writeHead(403).end();
    return;
  }
  if (!(await isFile(file))) file = join(file, "index.html");
  const found = await isFile(file);
  if (!found) file = join(OUT, "404.html");
  res.writeHead(found ? 200 : 404, { "Content-Type": TYPES[extname(file)] ?? "application/octet-stream" });
  createReadStream(file).pipe(res);
}).listen(PORT, () => console.log(`Sitio estático en http://localhost:${PORT}${BASE}/`));
