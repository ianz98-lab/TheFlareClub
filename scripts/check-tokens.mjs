/**
 * Guardia de tokens de la marca (corre con `npm run lint`, después de eslint). Falla si el código se
 * salta el sistema de docs/04-marca.md:
 * - tamaños de letra en px (`text-[15px]`): todo en rem, para que crezca con la letra del navegador;
 * - colores hex fuera de las fuentes de verdad (@theme de globals.css y src/components/ui/tokens.ts);
 * - nombres de la paleta vieja (cream, terracotta, sage, rose, sky, mauve, sand) en clases;
 * - z-index con números (`z-10`): usar las capas `z-(--z-header)`…;
 * - `italic` junto a `font-display`: Gloock no tiene itálica y el navegador la inventaría;
 * - radios viejos `rounded-xs…3xl` (también por lado, `rounded-t-md`): ya no existen en el tema y no
 *   generarían nada. Usar `rounded-control` (botones, chips, campos) o `rounded-media` (fotos, miniaturas).
 *
 * Uso: node scripts/check-tokens.mjs
 */
import { readdirSync, readFileSync } from "node:fs";
import { join, relative, sep } from "node:path";

const ROOT = join(import.meta.dirname, "..");
const SRC = join(ROOT, "src");
const EXTENSIONS = [".ts", ".tsx", ".css"];

/** Archivos donde los hex son la fuente de verdad. En globals.css, solo dentro de @theme. */
const HEX_SOURCES = new Set(["src/components/ui/tokens.ts"]);

const OLD_PALETTE = "cream|terracotta|sage|rose|sky|mauve|sand";
const COLOR_PREFIX = "bg|text|border|from|via|to|ring|fill|stroke|outline|decoration|divide|placeholder|accent|caret|shadow";

const RULES = [
  { name: "tamaño de letra en px (usar rem: text-sm, text-body-sm…)", re: /\btext-\[\d+(\.\d+)?px\]/g },
  { name: "color de la paleta vieja (usar el rol: ink, surface, accent…)", re: new RegExp(`\\b(?:${COLOR_PREFIX})-(?:${OLD_PALETTE})(?:-[\\w/]+)?\\b`, "g") },
  { name: "z-index con número (usar z-(--z-header), z-(--z-sheet)…)", re: /(?<![\w-])-?z-\[?\d[\w\]]*/g },
];
/** #rgb, #rgba, #rrggbb o #rrggbbaa (no entidades HTML como &#039;). */
const HEX = /(?<!&)#(?:[0-9a-fA-F]{3,4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})\b/g;
const LEGACY_RADIUS = /\brounded-(?:[setblr]{1,2}-)?(?:xs|sm|md|lg|xl|2xl|3xl)\b/g;

function* walk(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) yield* walk(path);
    else if (EXTENSIONS.some((ext) => entry.name.endsWith(ext))) yield path;
  }
}

/** Rango de líneas (1-based, inclusivo) del bloque `@theme … { … }` de un CSS. */
function themeLines(lines) {
  const start = lines.findIndex((l) => /^@theme\b/.test(l));
  if (start === -1) return [0, -1];
  let depth = 0;
  for (let i = start; i < lines.length; i++) {
    depth += (lines[i].match(/{/g) ?? []).length - (lines[i].match(/}/g) ?? []).length;
    if (depth === 0 && i > start) return [start + 1, i + 1];
  }
  return [start + 1, lines.length];
}

const errors = [];

for (const file of walk(SRC)) {
  const rel = relative(ROOT, file).split(sep).join("/");
  const lines = readFileSync(file, "utf8").split(/\r?\n/);
  const [themeStart, themeEnd] = rel.endsWith(".css") ? themeLines(lines) : [0, -1];

  lines.forEach((line, i) => {
    const n = i + 1;
    // Las líneas de comentario pueden nombrar lo prohibido para explicarlo
    if (/^\s*(\*|\/\/|\/\*)/.test(line)) return;
    const report = (list, what, match) => list.push(`${rel}:${n}  ${what}: ${match}`);

    for (const rule of RULES) for (const m of line.matchAll(rule.re)) report(errors, rule.name, m[0]);

    const inTheme = n >= themeStart && n <= themeEnd;
    if (!HEX_SOURCES.has(rel) && !inTheme) {
      for (const m of line.matchAll(HEX)) report(errors, "color hex fuera de los tokens (usar una clase o var(--color-…))", m[0]);
    }

    if (/\bfont-display\b/.test(line) && /(?<![\w-])italic(?![\w-])/.test(line)) {
      report(errors, "italic con font-display (Gloock no tiene itálica)", "italic");
    }

    for (const m of line.matchAll(LEGACY_RADIUS)) report(errors, "radio viejo (usar rounded-control o rounded-media)", m[0]);
  });
}

if (errors.length) {
  console.error(`check-tokens: ${errors.length} error(es). Ver docs/04-marca.md (Sistema: tokens).`);
  for (const e of errors) console.error(`  ${e}`);
  process.exit(1);
}
console.log("check-tokens: sin errores.");
