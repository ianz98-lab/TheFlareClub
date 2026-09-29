# Estado del proyecto

## Fases
1. **Fundación + UX (en curso)** — repo, sistema de diseño, todas las páginas con datos
   semilla, mobile-first. Objetivo: validar la experiencia con las fundadoras.
2. **Backend** — Supabase (auth, schema, RLS), Stripe (membresías/trial), Vimeo privado,
   favoritos y continuar viendo reales.
3. **Admin/CMS** — panel para subir videos, crear clases/cursos/eventos, destacados,
   textos e imágenes, usuarios y membresías.
4. **Lanzamiento** — dominio, SEO, analytics, emails transaccionales, PWA.

## Decisiones
- 28-sep-2026: Next.js + Supabase + Stripe + Vimeo. Repo `ianz98-lab/TheFlareClub`.
- Video nunca se aloja en el servidor: solo ids de proveedor.
- Podcast: redirección a Spotify, sin reproductor propio.
- Datos semilla en `src/content/` hasta conectar el CMS.

## Dominio y correo
- `theflare.club` registrado en GoDaddy el 29-sep-2026 (UTC). Correo: Google Workspace
  (verificación TXT + MX en GoDaddy). Web: apuntar a Vercel en Fase 4.

## Pendientes que necesitan a Ian / fundadoras
- Precios definitivos de planes personales y moneda.
- Bios de Mariana y Sofi + confirmar quién es quién en las fotos.
- Cuenta de Vimeo (Plus o superior para privacidad por dominio) y cuenta de Stripe.
- Textos de "Nosotras" (historia, qué significa Flare).
- Link real del podcast en Spotify.
