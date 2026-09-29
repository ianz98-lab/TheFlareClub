# Modelo de contenido

Principio central: **el video es un asset compartido**. Una clase, una lección de curso,
una charla o un warm-up son *usos* de un video. Así un mismo warm-up se reutiliza en
decenas de clases de Barre sin duplicar nada, y cambiar el archivo en Vimeo actualiza
todos los lugares donde aparece.

## Jerarquía

```
Módulo (sección del menú)   Movement · Meditaciones · Cursos · Charlas · Workbooks · Podcast · Eventos
  └─ Colección / Capítulo   ej. "Pilates Mat", "Barre", "Warm Ups", "Stretching"; en cursos = módulo del curso
       └─ Item de contenido ej. Clase, Meditación, Lección, Charla
            └─ Video asset  (Vimeo id) — reutilizable entre items
```

## Entidades

| Entidad | Campos clave | Notas |
|---|---|---|
| `videos` | provider, provider_id, duration_sec, thumbnail | Nunca se sube el archivo; solo el id de Vimeo/Mux. |
| `instructors` | name, slug, photo, bio | Mariana, Sofi y expertos invitados. |
| `classes` (Movement) | title, slug, video_id, warmup_video_id, class_type, duration_bucket, focus[], style, level, access, featured | `warmup_video_id` apunta a un video tipo warm-up compartido. |
| `meditations` | title, slug, video_id, moment, feelings[], duration_bucket, access | moment = morning/night/stress/abundance/other. |
| `courses` | title, slug, cover, description, instructor_id, access | |
| `course_modules` | course_id, title, order | "capítulos" del curso. |
| `course_lessons` | module_id, title, video_id, order, resources[] | Una lección puede reutilizar un video de Movement. |
| `talks` | title, slug, expert_id, specialty, category, video_id, access | |
| `workbooks` | title, slug, cover, description, file_url, access, price | access: free / member / paid. |
| `podcast_episodes` | title, image, description, duration, spotify_url, category | Solo enlace externo. |
| `events` | title, slug, image, starts_at, ends_at, location, description, price, includes[], category, status, gallery[] | status: upcoming / past. |
| `tags` + `content_tags` | tag (slug, group) ↔ (content_type, content_id) | Multi-categoría real: un video puede tener N tags. |
| `plans` | name, kind (personal/corporate), price, period, features[], recurrente_product_id | |
| `subscriptions` | user_id, plan_id, status, current_period_end, recurrente_subscription_id | Activada por webhook de Recurrente. |
| `favorites` | user_id, content_type, content_id | |
| `watch_progress` | user_id, video_id, position_sec, completed | "Continuar viendo". |
| `course_progress` | user_id, lesson_id, completed_at | |
| `corporate_leads` | formulario de cotización | |
| `site_settings` | key/value (hero, textos, destacados) | Textos e imágenes editables sin código. |

## Grupos de tags (filtros)
- **duration**: 5 · 10 · 15 · 20 · 30 · 40
- **type**: pilates · barre · warmup · stretching
- **style**: pilates-flow · pilates-strength
- **focus**: full-body · upper-body · lower-body · arms · abs · glutes · back · legs ·
  inner-thighs · biceps · shoulders · triceps · hamstrings · quads
- **moment** (meditaciones): morning · night · stress · abundance · other
- **feeling** (meditaciones): estres · ansiedad · volver-a-ti · soltar · claridad ·
  gratitud · abundancia · confianza · amor-propio
- **talk-category**, **podcast-category**, **event-category**

## Niveles de acceso
`public` (se ve sin cuenta) · `free` (requiere cuenta gratuita) · `member` (membresía
activa) · `paid` (compra individual: workbooks, eventos, algunos cursos).

## Fase actual
Los datos viven en `src/content/*.ts` (semilla tipada) para poder diseñar y validar UX
sin backend. El schema SQL equivalente está en `supabase/migrations/0001_schema.sql` y
el admin/CMS se conecta en la Fase 2 (ver `docs/ESTADO.md`).
