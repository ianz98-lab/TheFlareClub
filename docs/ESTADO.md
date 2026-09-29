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

## Decisiones
- 28-sep-2026: Next.js + Supabase + Recurrente + Vimeo. Repo `ianz98-lab/TheFlareClub`.
- 28-sep-2026: pagos con **Recurrente** (procesador guatemalteco; Stripe no opera en GT).
- 28-sep-2026: reutilizar un proyecto Supabase existente si no está en uso; no crear uno nuevo.
- Video nunca se aloja en el servidor: solo ids de proveedor.
- Podcast: redirección a Spotify, sin reproductor propio.
- Datos semilla en `src/content/` hasta conectar el CMS.

## Dominio y correo (pausado hasta nuevo aviso)
- `theflare.club` registrado en GoDaddy el 29-sep-2026 (UTC). Correo: Google Workspace
  (verificación TXT + MX en GoDaddy). Web: apuntar a Vercel en Fase 4.

## Pendientes que necesitan a Ian / fundadoras
- Precios definitivos de planes personales y moneda.
- Confirmar quién es quién en las fotos (bios ya recibidas 28-sep).
- Cuenta de Vimeo (Plus o superior para privacidad por dominio) y cuenta de Recurrente.
- Textos de "Nosotras" (historia, qué significa Flare).
- Link real del podcast en Spotify (Ian lo pasa después).
