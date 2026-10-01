-- The Flare Club · schema inicial (Fase 2)
-- Espejo del modelo en src/content/types.ts y docs/02-modelo-de-contenido.md.
-- Principio: el video es un asset compartido; clases, lecciones, charlas y warm-ups lo referencian.

create extension if not exists "pgcrypto";

-- ---------- enums ----------
create type access_level as enum ('public', 'free', 'member', 'paid');
create type video_provider as enum ('vimeo', 'mux', 'youtube');
create type video_kind as enum ('class', 'warmup', 'meditation', 'lesson', 'talk');
create type class_type as enum ('pilates', 'barre', 'warmup', 'stretching');
create type class_style as enum ('pilates-flow', 'pilates-strength', 'barre', 'warmup', 'stretching');
create type meditation_moment as enum ('morning', 'night', 'stress', 'abundance', 'other');
create type event_status as enum ('upcoming', 'past', 'soldout');
create type plan_kind as enum ('personal', 'corporate');

-- ---------- assets ----------
create table videos (
  id uuid primary key default gen_random_uuid(),
  provider video_provider not null default 'vimeo',
  provider_id text not null,
  duration_sec int not null default 0,
  thumbnail text,
  kind video_kind not null default 'class',
  created_at timestamptz not null default now(),
  unique (provider, provider_id)
);

create table instructors (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  role text,
  photo text,
  bio text,
  founder boolean not null default false
);

-- ---------- tags (multi-categoría) ----------
create table tags (
  id uuid primary key default gen_random_uuid(),
  "group" text not null,           -- duration | type | style | focus | moment | feeling | talk-category | ...
  slug text not null,
  label text not null,
  sort int not null default 0,
  unique ("group", slug)
);

create table content_tags (
  content_type text not null,      -- class | meditation | course | talk | workbook | episode | event
  content_id uuid not null,
  tag_id uuid not null references tags(id) on delete cascade,
  primary key (content_type, content_id, tag_id)
);
create index on content_tags (tag_id);

-- ---------- Movement ----------
create table classes (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  description text,
  video_id uuid not null references videos(id),
  warmup_video_id uuid references videos(id),     -- short de calentamiento compartido
  instructor_id uuid references instructors(id),
  type class_type not null,
  style class_style not null,
  duration_min int not null,
  focus text[] not null default '{}',
  level text not null default 'todos',
  equipment text[] not null default '{Mat}',
  access access_level not null default 'member',
  featured boolean not null default false,
  is_new boolean not null default false,
  published_at timestamptz,
  created_at timestamptz not null default now()
);

-- ---------- Meditaciones ----------
create table meditations (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  description text,
  video_id uuid not null references videos(id),
  instructor_id uuid references instructors(id),
  moment meditation_moment not null,
  feelings text[] not null default '{}',
  duration_min int not null,
  access access_level not null default 'member',
  featured boolean not null default false,
  published_at timestamptz,
  created_at timestamptz not null default now()
);

-- ---------- Cursos ----------
create table courses (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  tagline text,
  description text,
  cover text,
  instructor_id uuid references instructors(id),
  access access_level not null default 'member',
  price_cents int,
  featured boolean not null default false,
  published_at timestamptz,
  created_at timestamptz not null default now()
);

create table course_modules (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references courses(id) on delete cascade,
  title text not null,
  description text,
  sort int not null default 0
);

create table course_lessons (
  id uuid primary key default gen_random_uuid(),
  module_id uuid not null references course_modules(id) on delete cascade,
  title text not null,
  video_id uuid references videos(id),           -- una lección puede reutilizar un video de Movement
  duration_min int not null default 0,
  resources jsonb not null default '[]',          -- [{title,url,kind}]
  sort int not null default 0
);

create table course_workbooks (
  course_id uuid references courses(id) on delete cascade,
  workbook_id uuid,
  primary key (course_id, workbook_id)
);

-- ---------- Charlas ----------
create table talks (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  description text,
  expert_id uuid references instructors(id),
  specialty text,
  category text not null,
  video_id uuid not null references videos(id),
  duration_min int not null default 0,
  access access_level not null default 'member',
  featured boolean not null default false,
  is_new boolean not null default false,
  published_at timestamptz,
  created_at timestamptz not null default now()
);

-- ---------- Workbooks ----------
create table workbooks (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  description text,
  cover text,
  file_path text,                                  -- Supabase Storage (bucket privado "workbooks")
  pages int,
  access access_level not null default 'member',
  price_cents int,
  featured boolean not null default false,
  created_at timestamptz not null default now()
);
alter table course_workbooks add constraint course_workbooks_workbook_fk
  foreign key (workbook_id) references workbooks(id) on delete cascade;

-- ---------- Podcast (solo enlaces a Spotify) ----------
create table podcast_episodes (
  id uuid primary key default gen_random_uuid(),
  number int,
  title text not null,
  description text,
  image text,
  duration_min int,
  spotify_url text not null,
  category text,
  published_at timestamptz
);

-- ---------- Eventos ----------
create table events (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  image text,
  starts_at timestamptz not null,
  ends_at timestamptz,
  location text,
  description text,
  price_cents int not null default 0,
  currency text not null default 'USD',
  includes text[] not null default '{}',
  category text not null,
  status event_status not null default 'upcoming',
  gallery text[] not null default '{}',
  ticket_url text,
  recurrente_product_id text
);

-- ---------- Planes (cobro con Recurrente; membresías y compras en 0002) ----------
create table plans (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  kind plan_kind not null default 'personal',
  price_cents int,
  currency text default 'USD',
  period text,                                     -- mes | año
  tagline text,
  features text[] not null default '{}',
  highlight boolean not null default false,
  recurrente_product_id text,
  active boolean not null default true
);

-- ---------- Textos e imágenes editables sin código ----------
create table site_settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);

-- Cuentas, favoritos, historial, membresías, compras y formularios: ver 0002_cuentas.sql
-- (claves de contenido en texto mientras el contenido vive en src/content).

-- Contenido: lectura pública de metadatos; el gating de video se hace en el servidor
-- (el provider_id de Vimeo solo se entrega si la usuaria tiene acceso).

-- RLS: sin esto la API pública podría escribir en el catálogo. Lectura pública, escritura
-- solo con service role (panel admin de la Fase 3). El grant es explícito porque hay
-- proyectos que no exponen las tablas nuevas a la API por defecto (si ya lo hacen, no cambia nada).
do $$
declare t text;
begin
  foreach t in array array['videos','instructors','tags','content_tags','classes','meditations','courses',
    'course_modules','course_lessons','course_workbooks','talks','workbooks','podcast_episodes','events',
    'plans','site_settings']
  loop
    execute format('alter table public.%I enable row level security', t);
    execute format('create policy "lectura pública" on public.%I for select to anon, authenticated using (true)', t);
    execute format('grant select on public.%I to anon, authenticated', t);
    execute format('grant all on public.%I to service_role', t);
  end loop;
end $$;

-- Columnas que NO salen por la API pública: el id de Vimeo (videos.provider_id) y los recursos
-- de las lecciones (course_lessons.resources) son la llave del contenido para miembros o de
-- pago. La política deja leer las filas, pero solo estas columnas; los datos protegidos los
-- entrega una Edge Function que valida membresía o compra. Ojo: las consultas públicas tienen
-- que listar columnas (`select=*` responde "permission denied").
revoke select on public.videos from anon, authenticated;
grant select (id, provider, duration_sec, thumbnail, kind, created_at) on public.videos to anon, authenticated;
revoke select on public.course_lessons from anon, authenticated;
grant select (id, module_id, title, video_id, duration_min, sort) on public.course_lessons to anon, authenticated;
