# Estado del proyecto

## Fases
1. **Fundación + UX (en curso)** — repo, sistema de diseño, todas las páginas con datos
   semilla, mobile-first. Objetivo: validar la experiencia con las fundadoras.
2. **Backend** — Supabase (auth, schema, RLS), Recurrente (membresías/trial), Vimeo privado,
   favoritos y continuar viendo reales.
3. **Admin/CMS** — panel para subir videos, crear clases/cursos/eventos, destacados,
   textos e imágenes, usuarios y membresías.
4. **Lanzamiento** — dominio, SEO, analytics, emails transaccionales, PWA.

## Prototipo público
- https://ianz98-lab.github.io/TheFlareClub/ (GitHub Pages, se actualiza con cada push a main).
- Recoger ideas de Mariana y Sofi sobre este prototipo antes de la Fase 2.
- 28-sep: rediseño editorial (Bodoni + Instrument Sans, sin huella de generador) y logo transparente.
- Podcast: link real de Spotify y descripción cargados (podcast por Mariana Wer).
- 28-sep (noche): buscador por categoría (tabs + filtros + orden, una sola grilla), constructor de
  rutinas con transición automática y recomendaciones al final, motion moderno (Lenis, reveals,
  parallax). Ver docs/05-buscador-y-rutinas.md.
- 30-sep: cambios del documento de las fundadoras ("CAMBIOS PAGINA WEB.docx"): menú nuevo (Arma tu rutina dentro de
  Movement, "Sobre nosotras"), textos nuevos en todas las secciones, Cursos "Próximamente" con lista de espera, Charlas
  en vivo con avisos por correo, un solo workbook real descargable, podcast con los 16 episodios reales de Spotify,
  Eventos con los 6 eventos anteriores (flyer + galería) y la Night Edition con link de Recurrente, Corporativo para
  empresas y marcas, Membresía USD 15 / 165 con los mismos beneficios. Fotos nuevas ordenadas por sección y evento, y
  fotos viejas re-exportadas en alta (docs/04-marca.md). Cuentas de usuaria + portal "Mi cuenta" (docs/06).

## Dónde quedó el trabajo (1-oct)
- Ian eligió en "Decisiones visuales Flare" (30-sep): Tipografía A (Gloock + Hanken Grotesk), Color C (neutro +
  terracota), Botones B (minúscula 15 px, radio 6 px), Ícono B ("F"). Está aplicado en todo el sitio: tokens por rol,
  escala display, sin bandas pastel ni clases viejas (`cream`/`rose-soft`/`terracotta`…) y Gloock sin `italic`.
  `npm run lint` lo vigila (`scripts/check-tokens.mjs`). Sistema y reglas: docs/04-marca.md.
- 1-oct: auditoría final del prototipo, 15/20 ("bueno"; la primera, del 30-sep, dio 10/20). Sus 47 correcciones sin
  decisión pendiente están aplicadas. Verificado: tsc, lint + check-tokens, build normal y de Pages, y las 18 rutas
  principales en 390 y 1440 px sin errores de consola, sin recursos rotos y sin scroll horizontal.
- Desde el 1-oct se trabaja directo en GitHub: cada cambio se sube a `main` y se publica en Pages (ver CLAUDE.md).
- **Pendiente técnico (Ian, desde github.com):** ajuste a `.github/workflows/pages.yml`, que no se puede subir desde
  la compu. Debajo de `workflow_dispatch:` va la publicación diaria (6:00 GT), que pasa sola los eventos vencidos a
  "Eventos anteriores":
  ```yaml
    schedule:
      - cron: "0 12 * * *"
  ```
  Y en el paso `npm run build`, debajo de `GITHUB_PAGES: "true"`, la URL para las vistas previas al compartir links
  y las variables de Supabase (vacías = modo demo):
  ```yaml
            NEXT_PUBLIC_SITE_URL: https://ianz98-lab.github.io/TheFlareClub
            NEXT_PUBLIC_SUPABASE_URL: ${{ vars.NEXT_PUBLIC_SUPABASE_URL }}
            NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ vars.NEXT_PUBLIC_SUPABASE_ANON_KEY }}
  ```
- **Esperan decisión de Ian o de las fundadoras:** contacto (D5), contenido de muestra (D6), foto de Mariana (D7),
  flyers con "the flow club" (D8), fecha de Legado (D9), bio de Sofi (D10), idioma de las zonas (D11), FAQ y aviso
  de privacidad (D12), Corporativo (D13), orden de Inicio y Movement (D14), reanudar membresía (D15) y cabeceras de
  página propias para Movement, Meditaciones y Eventos (D16).

## Decisiones
- 28-sep-2026: Next.js + Supabase + Recurrente + Vimeo. Repo `ianz98-lab/TheFlareClub`.
- 28-sep-2026: pagos con **Recurrente** (procesador guatemalteco; Stripe no opera en GT).
- 28-sep-2026: reutilizar un proyecto Supabase existente si no está en uso; no crear uno nuevo.
- Video nunca se aloja en el servidor: solo ids de proveedor.
- Podcast: redirección a Spotify, sin reproductor propio.
- Datos semilla en `src/content/` hasta conectar el CMS. Textos de las páginas en `src/content/site.ts` (Inicio los reusa).
- 30-sep-2026: membresía USD 15/mes y USD 165/año, mismos beneficios, 7 días gratis; cursos y eventos se compran aparte.
- 30-sep-2026: cuentas con Supabase Auth en el cliente (el sitio es estático) + Edge Functions para Recurrente
  (`crear-checkout`, `recurrente-webhook`, `cancelar-membresia`). Contenido referenciado con claves de texto.

## Dominio y correo (pausado hasta nuevo aviso)
- `theflare.club` registrado en GoDaddy el 29-sep-2026 (UTC). Correo: Google Workspace
  (verificación TXT + MX en GoDaddy). Web: apuntar a Vercel en Fase 4.

## Pendientes que necesitan a Ian / fundadoras (al 30-sep)
- **Bloqueo general (30-sep, Ian):** Supabase, Vimeo y Recurrente esperan a que exista el **Gmail de la empresa**
  para registrar todo con esa cuenta. Hasta entonces se sigue puliendo el prototipo en modo demo.
- **Activar cuentas reales**: autorizar usar el proyecto Supabase vacío "ianz98-lab's Project" y seguir el checklist de
  `docs/06-cuentas-y-pagos.md` (migración, Site URL/Redirect URLs, plantillas de correo, SMTP, variables del repo).
  Mientras tanto el prototipo corre en **modo demo** (cuentas y actividad solo en el navegador).
- **Recurrente**: llaves (van por el link seguro de Albert, nunca por chat), cuenta verificada (sin verificar hay tope
  acumulado de Q500), Sandbox para probar la prueba gratis, y el `prod_…` del link de la Night Edition.
- **Fecha del save the date**: el documento dice "sábado 22 de noviembre", pero el 22-nov-2026 es domingo. Hoy se muestra
  "22 de noviembre" sin día de la semana.
- **Bio de Sofi** (el documento dice "PENDIENTES LOS CAMBIOS DE SOFI") y confirmar quién aparece sola en
  `nosotras/02.jpg` y `nosotras/03.jpg`.
- **Términos y Aviso de privacidad**: no existen; hacen falta antes de abrir cuentas reales (se quitaron los links "#").
- **Instagram**: falta el @ oficial (se quitó el link genérico del footer).
- **Correo de contacto**: ya no se publica hola@theflare.club (no existe todavía). `CONTACT_EMAIL = null` en
  `src/components/account/copy.ts`; al tener el buzón (o Instagram/WhatsApp, decisión D5) se pone ahí y vuelve en todo el sitio.
  Mientras sea `null`, Mi cuenta oculta los textos de contacto (`hasContact` en `src/components/account/portal-ui.tsx`):
  "¿Quieres cambiar de plan? Escríbenos…" y las colas "escríbenos…" de los avisos de pago fallido, de pago lento y del
  error al cancelar (el pago fallido dice solo "No pudimos procesar tu último pago."). Al poner el correo reaparecen
  con su `mailto`, sin tocar código.
- Flyers de Journaling y Vision Board dicen "the flow club" (nombre anterior): confirmar que se pueden mostrar.
- Fotos de Breathwork llegaron en baja resolución (tipo WhatsApp): pedir originales. Logos de patrocinadores: pedir
  archivos vectoriales si se quieren logos en vez de la lista de nombres.
- Cuenta de Vimeo (Plus o superior) para cargar los videos reales (hoy son de muestra).
