"""Genera los íconos de la "F" (decisión D4-B de Ian) y el logo para fondos oscuros.

Uso (desde la raíz del repo; requiere Pillow y numpy):
    python scripts/marca/iconos.py

- La "F" sale de brand/logo/logo-transparente.png. Ese PNG se recortó de un fondo crema y conserva un
  halo claro en los bordes; por eso la cobertura de cada píxel se calcula por su oscuridad sobre ese
  crema (no por el alfa solo) y se dibuja limpia, en espresso sobre `surface` plano.
- Salida en public/: favicon.ico (16/32/48), icon.png (512), icon-192.png, icon-maskable.png (512, con la
  zona segura del 80 %) y apple-icon.png (180). PNG indexados: pocas tintas entre surface y espresso.
- public/images/logo-on-dark.png: el logo web (public/images/logo.png) en una sola tinta `surface`, con el
  mismo alfa, para el footer espresso.
- Los colores son los de src/components/ui/tokens.ts (BRAND_COLORS); si cambian allá, cambiarlos aquí.
"""
import os

import numpy as np
from PIL import Image, ImageFilter

SURFACE = (0xF6, 0xF5, 0xF3)
ESPRESSO = (0x2F, 0x28, 0x23)
# Fondo del que se recortó el logo: sirve para leer la cobertura de los bordes
CREAM = (0xF4, 0xED, 0xE5)

SOURCE = os.path.join("brand", "logo", "logo-transparente.png")
# Caja de la "F" de FLARE dentro del logo (1854×782), con un poco de aire para no cortar el antialias
F_BOX = (168, 223, 389, 540)
# Luminancia sobre crema: más oscuro que BLACK es tinta llena; más claro que WHITE, fondo (halo incluido)
BLACK, WHITE = 60.0, 226.0
LEVELS = 24  # tintas del PNG indexado: de sobra para el antialias entre dos colores

OUT = "public"


def luminance(rgb):
    return 0.2126 * rgb[..., 0] + 0.7152 * rgb[..., 1] + 0.0722 * rgb[..., 2]


def glyph_coverage():
    """Cobertura 0–1 de la F, recortada a su caja real."""
    im = np.asarray(Image.open(SOURCE).convert("RGBA").crop(F_BOX), dtype=np.float64)
    alpha = im[..., 3:4] / 255.0
    over_cream = im[..., :3] * alpha + np.array(CREAM, dtype=np.float64) * (1 - alpha)
    cov = np.clip((WHITE - luminance(over_cream)) / (WHITE - BLACK), 0.0, 1.0)
    ys, xs = np.nonzero(cov > 0.02)
    return cov[ys.min() : ys.max() + 1, xs.min() : xs.max() + 1]


def render(cov, size, glyph_height, lift=0.01, bold=0):
    """
    La F centrada ópticamente en un cuadrado `size`, con `glyph_height` (fracción del lado) de alto.
    `bold` engrosa los trazos (px de la fuente) para los tamaños de favicon, donde el filete fino se perdería.
    """
    h = round(size * glyph_height)
    w = round(cov.shape[1] * h / cov.shape[0])
    mask = Image.fromarray((cov * 255).astype(np.uint8), "L")
    if bold:
        mask = mask.filter(ImageFilter.MaxFilter(bold))
    mask = mask.resize((w, h), Image.LANCZOS)
    m = np.asarray(mask, dtype=np.float64) / 255.0
    # Centro óptico: a medio camino entre el centro de la caja y el centro de masa (la F carga a la izquierda)
    cx_mass = (m.sum(axis=0) * np.arange(w)).sum() / m.sum()
    left = round(size / 2 - (w / 2 + cx_mass) / 2)
    top = round((size - h) / 2 - size * lift)
    canvas = np.zeros((size, size), dtype=np.float64)
    canvas[top : top + h, left : left + w] = m
    # Cuantizar la cobertura a LEVELS tintas exactas entre surface y espresso
    idx = np.rint(canvas * (LEVELS - 1)).astype(np.uint8)
    palette = []
    for i in range(LEVELS):
        t = i / (LEVELS - 1)
        palette += [round(s + (e - s) * t) for s, e in zip(SURFACE, ESPRESSO)]
    out = Image.fromarray(idx, "P")
    out.putpalette(palette)
    return out


def save_png(img, name):
    path = os.path.join(OUT, name)
    img.save(path, optimize=True)
    print(f"{path}: {img.size[0]}×{img.size[1]}, {os.path.getsize(path) / 1024:.1f} KB")


def logo_on_dark():
    """Logo web en una sola tinta surface: índice de paleta = alfa (256 niveles del mismo color)."""
    src = Image.open(os.path.join("public", "images", "logo.png")).convert("RGBA")
    alpha = np.asarray(src, dtype=np.uint8)[..., 3]
    out = Image.fromarray(alpha, "P")
    out.putpalette(list(SURFACE) * 256)
    path = os.path.join("public", "images", "logo-on-dark.png")
    out.save(path, optimize=True, transparency=bytes(range(256)))
    print(f"{path}: {out.size[0]}×{out.size[1]}, {os.path.getsize(path) / 1024:.1f} KB")


def main():
    cov = glyph_coverage()
    # "any": la F a 62 % del alto. Maskable: a 52 %, dentro del círculo seguro del 80 %.
    save_png(render(cov, 512, 0.62), "icon.png")
    save_png(render(cov, 192, 0.62), "icon-192.png")
    save_png(render(cov, 512, 0.52), "icon-maskable.png")
    save_png(render(cov, 180, 0.60), "apple-icon.png")
    # Favicon: la F más grande y algo más gruesa (se lee a 16 px); cada tamaño se dibuja aparte
    ico = [render(cov, s, 0.78, lift=0, bold=b).convert("RGB") for s, b in ((48, 3), (32, 5), (16, 9))]
    path = os.path.join(OUT, "favicon.ico")
    ico[0].save(path, format="ICO", sizes=[(48, 48), (32, 32), (16, 16)], append_images=ico[1:])
    print(f"{path}: 16/32/48, {os.path.getsize(path) / 1024:.1f} KB")
    logo_on_dark()


if __name__ == "__main__":
    main()
