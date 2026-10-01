# The Flare Club — guía para Claude

Plataforma web de bienestar (Pilates Mat, Barre, meditaciones, cursos, charlas, workbooks,
podcast, eventos, corporativo). Cliente: Mariana y Sofi Wer (fundadoras); Ian coordina.

## Cómo trabajar aquí
- Stack: Next.js 16 App Router (`src/`), TypeScript estricto, Tailwind v4 con tokens en
  `src/app/globals.css`. Supabase + Recurrente + Vimeo se conectan en Fase 2 (cuentas y pagos: `docs/06`).
- Textos de las páginas en `src/content/site.ts`; fotos en `public/images` + `src/content/media.ts`
  (cómo agregar: `scripts/fotos/README.md`).
- **Mobile first, siempre.** Las usuarias entrenan con el celular apoyado en el piso: botones
  grandes, player a pantalla completa, nada crítico escondido en hover.
- Idioma de la UI: español LatAm, tuteo. Nombres de clases en inglés (Pilates Flow, Barre,
  Full Body) como los usa la marca.
- Marca: paleta, tipografía y LENGUAJE VISUAL en `docs/04-marca.md`. Ian pidió que el sitio no
  parezca hecho por IA y el 30-sep eligió: **Gloock + Hanken Grotesk**, **neutro + terracota como
  único acento** (sin colores por módulo), **botones en minúscula 15 px**, **un solo radio de 6 px** e
  ícono = la "F" del logo. Sin degradados sobre fotos, sin pastillas/badges con fondo, sin iconos
  decorativos. Motion fino (reveals, parallax solo en heros) porque lo estático le pareció "de periódico".
- Contenido: tipos en `src/content/types.ts`; datos semilla en `src/content/*.ts`. Todo
  lo que hoy está en semilla mañana viene de Supabase con la misma forma.
- Antes de agregar una sección nueva, revisar `docs/01-spec-estructura-web.md`.
- Commits en español, imperativo corto ("Agrega filtros a Movement").
- Verificar con `npm run build` antes de hacer push.

## Repo: se trabaja directo en GitHub
`https://github.com/ianz98-lab/TheFlareClub` (rama `main`). **GitHub es la única fuente de verdad** (Ian, 1-oct):
Ian también edita desde el celular y no usa la copia local.
- Al empezar: `git pull` en `main` antes de tocar nada.
- Cada cambio terminado se commitea **y se sube** (`git push origin main`) en el mismo paso, sin preguntar. Nunca
  dejar commits locales sin subir. El push publica el prototipo en GitHub Pages.
- Credenciales ya guardadas en Windows; no hace falta pedir token. Esas credenciales NO pueden tocar
  `.github/workflows/` (GitHub rechaza el push sin el permiso `workflow`): no commitear cambios ahí; pasárselos a
  Ian para que edite el archivo en github.com.

## Estado para Albert
- **Estado:** Fase 1 (fundación + UX) en curso.
- **Hitos:** 28-sep-2026 repo conectado, estructura, docs y primera versión del web app. 30-sep-2026 cambios del
  documento de las fundadoras, fotos nuevas, podcast real y cuentas de usuaria (modo demo hasta activar Supabase).
- **Pendientes:** ver `docs/ESTADO.md` (activar Supabase/Recurrente, fecha del 22-nov, bio de Sofi, textos legales,
  Instagram, Vimeo).
- **Decisiones:** Next.js + Supabase + Recurrente (pagos GT) + Vimeo; podcast solo redirige a Spotify. Albert: no espejar por ahora (Ian, 28-sep).
