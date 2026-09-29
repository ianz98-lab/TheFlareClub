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
create type subscription_status as enum ('trialing', 'active', 'past_due', 'canceled', 'incomplete');

-- ---------- perfiles ----------
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  email text,
  role text not null default 'member' check (role in ('member', 'admin')),
  created_at timestamptz not null default now()
);

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

-- ---------- Planes y membresías (cobro con Recurrente) ----------
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

create table subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  plan_id uuid references plans(id),
  status subscription_status not null,
  recurrente_customer_id text,
  recurrente_subscription_id text unique,
  current_period_end timestamptz,
  cancel_at_period_end boolean not null default false,
  created_at timestamptz not null default now()
);
create index on subscriptions (user_id);

-- Compras individuales (cursos, workbooks, eventos)
create table purchases (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  content_type text not null,
  content_id uuid not null,
  recurrente_checkout_id text,
  amount_cents int,
  created_at timestamptz not null default now(),
  unique (user_id, content_type, content_id)
);

-- ---------- Actividad de usuaria ----------
create table favorites (
  user_id uuid not null references profiles(id) on delete cascade,
  content_type text not null,
  content_id uuid not null,
  created_at timestamptz not null default now(),
  primary key (user_id, content_type, content_id)
);

create table watch_progress (
  user_id uuid not null references profiles(id) on delete cascade,
  video_id uuid not null references videos(id) on delete cascade,
  content_key text not null,                       -- "class:<id>" | "lesson:<course>:<lesson>" ...
  position_sec int not null default 0,
  completed boolean not null default false,
  updated_at timestamptz not null default now(),
  primary key (user_id, content_key)
);

create table course_progress (
  user_id uuid not null references profiles(id) on delete cascade,
  lesson_id uuid not null references course_lessons(id) on delete cascade,
  completed_at timestamptz not null default now(),
  primary key (user_id, lesson_id)
);

-- ---------- Corporativo ----------
create table corporate_leads (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  company text not null,
  position text,
  email text not null,
  phone text,
  headcount int,
  experience_type text,
  approx_date date,
  message text,
  status text not null default 'new',
  created_at timestamptz not null default now()
);

-- ---------- Textos e imágenes editables sin código ----------
create table site_settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);

-- ---------- RLS (base) ----------
alter table profiles enable row level security;
alter table favorites enable row level security;
alter table watch_progress enable row level security;
alter table course_progress enable row level security;
alter table subscriptions enable row level security;
alter table purchases enable row level security;
alter table corporate_leads enable row level security;

create policy "own profile" on profiles for all using (auth.uid() = id);
create policy "own favorites" on favorites for all using (auth.uid() = user_id);
create policy "own progress" on watch_progress for all using (auth.uid() = user_id);
create policy "own course progress" on course_progress for all using (auth.uid() = user_id);
create policy "own subscriptions" on subscriptions for select using (auth.uid() = user_id);
create policy "own purchases" on purchases for select using (auth.uid() = user_id);
create policy "anyone can create lead" on corporate_leads for insert with check (true);

-- Contenido: lectura pública de metadatos; el gating de video se hace en el servidor
-- (el provider_id de Vimeo solo se entrega si la usuaria tiene acceso).
