"""Exporta fotos originales a public/images con la configuración de la marca.

Uso (desde la raíz del repo; requiere Pillow):
    python scripts/fotos/exportar.py <carpeta-origen> <subcarpeta-destino> [archivo1 archivo2 ...]

- Si se pasan archivos, se exportan en ese orden (el primero = portada / mejor foto); si no, todos.
- Salida: public/images/<subcarpeta-destino>/01.jpg, 02.jpg… (JPEG progresivo, lado largo máx. 2400 px,
  calidad 82, sin EXIF ni GPS, nunca se amplía).
- Imprime las líneas `Photo` para pegar en src/content/media.ts (completa `alt` y, si hace falta, `focal`).
- Las variantes livianas (.w960 / .w1600) las crea `npm run build` solo (scripts/fotos/variantes.mjs).
"""
import os
import sys

from PIL import Image, ImageOps

MAX, QUALITY = 2400, 82


def main():
    if len(sys.argv) < 3:
        print(__doc__)
        sys.exit(1)
    src_dir, dest = sys.argv[1], sys.argv[2].strip("/")
    files = sys.argv[3:] or sorted(f for f in os.listdir(src_dir) if f.lower().endswith((".jpg", ".jpeg", ".png", ".heic")))
    out_dir = os.path.join("public", "images", dest)
    os.makedirs(out_dir, exist_ok=True)
    for i, name in enumerate(files, 1):
        im = ImageOps.exif_transpose(Image.open(os.path.join(src_dir, name))).convert("RGB")
        s = min(1.0, MAX / max(im.size))
        if s < 1:
            im = im.resize((round(im.width * s), round(im.height * s)), Image.LANCZOS)
        out = os.path.join(out_dir, f"{i:02d}.jpg")
        im.save(out, "JPEG", quality=QUALITY, progressive=True, optimize=True)
        print(f'  {{ src: "/images/{dest}/{i:02d}.jpg", width: {im.width}, height: {im.height}, alt: "" }},  // {name}')


if __name__ == "__main__":
    main()
