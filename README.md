# The Flare Club — plataforma web

Plataforma de bienestar on-demand: Pilates Mat, Barre, warm-ups, stretching,
meditaciones, cursos, charlas con expertos, workbooks, podcast y eventos.
Membresías personales con pricing claro y paquetes corporativos flexibles.

## Prototipo público
**https://ianz98-lab.github.io/TheFlareClub/** — se publica solo con cada push a `main`
(GitHub Actions → GitHub Pages, export estático). Para que las coaches exploren y comenten.

## Stack
- **Next.js 16** (App Router, `src/`) + **TypeScript** + **Tailwind CSS v4**
- **Supabase** — auth, Postgres, storage (schema en `supabase/migrations/`)
- **Recurrente** — pagos y suscripciones en Guatemala (membresías, eventos, workbooks de pago)
- **Vimeo (privado)** — hosting de video; el sitio solo embebe, nunca aloja archivos
- **Spotify** — el podcast redirige, no se aloja
- Deploy pensado para **Vercel**

## Correr en local
```bash
npm install
cp .env.example .env.local   # llenar claves cuando conectemos Supabase/Recurrente
npm run dev                  # http://localhost:3000
```

## Estructura del repo
```
brand/            logo, fotos originales, referencias (sitemap)
docs/             spec funcional, modelo de contenido, pricing, marca, estado
public/images/    fotos optimizadas para web
src/app/          rutas (App Router)
src/components/   UI compartida
src/content/      tipos + datos semilla (mientras no hay CMS conectado)
src/lib/          utilidades (filtros, formato, video providers)
supabase/         migraciones SQL del modelo de datos
```

Ver `docs/` para el detalle. `CLAUDE.md` tiene las convenciones de trabajo.
