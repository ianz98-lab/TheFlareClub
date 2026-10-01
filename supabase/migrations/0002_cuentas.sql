-- The Flare Club · 0002 · Cuentas de usuaria, actividad, membresías, compras y formularios
--
-- Capa de usuarias que la web usa YA (Fase 2), mientras el contenido sigue en src/content.
-- Por eso el contenido se referencia con claves de texto ("class:<id>", "course:<slug>",
-- "event:<slug>") en vez de uuid. Cuando el contenido pase a tablas (0001 / Fase 3) las
-- claves siguen sirviendo.
--
-- Cobros: Recurrente. Su webhook (supabase/functions/recurrente-webhook) escribe con la
-- service role en subscriptions / purchases / billing_events. Las usuarias solo leen lo suyo;
-- cancelar la membresía también pasa por una función (cancelar-membresia), nunca por la API.

-- ---------- perfiles ----------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text,
  role text not null default 'member' check (role in ('member', 'admin')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------- actividad ----------
create table if not exists public.favorites (
  user_id uuid not null references auth.users(id) on delete cascade,
  item_key text not null check (char_length(item_key) <= 200),
  created_at timestamptz not null default now(),
  primary key (user_id, item_key)
);

create table if not exists public.watch_history (
  user_id uuid not null references auth.users(id) on delete cascade,
  item_key text not null check (char_length(item_key) <= 200),
  pct smallint not null default 0 check (pct between 0 and 100),
  started_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  completed_at timestamptz,
  primary key (user_id, item_key)
);
create index if not exists watch_history_recent on public.watch_history (user_id, updated_at desc);

-- ---------- membresías y compras (las escribe el webhook de Recurrente) ----------
create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  email text not null,
  plan_slug text not null,                          -- flare-mensual | flare-anual
  status text not null check (status in ('trialing', 'active', 'past_due', 'canceled', 'incomplete')),
  recurrente_subscription_id text unique,
  trial_ends_at timestamptz,
  -- Fin del periodo pagado. Al cancelar queda la fecha hasta la que conserva el acceso
  -- (si canceló en la prueba, el fin de la prueba): acceso = status in ('trialing','active',
  -- 'past_due') o (status = 'canceled' and current_period_end > now()).
  current_period_end timestamptz,
  canceled_at timestamptz,                          -- cuándo se canceló (Mi cuenta, Recurrente o cobros fallidos)
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists subscriptions_user on public.subscriptions (user_id);
create index if not exists subscriptions_email on public.subscriptions (lower(email));

create table if not exists public.purchases (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  email text not null,
  item_key text not null,                           -- course:<slug> | event:<slug> | workbook:<slug>
  recurrente_checkout_id text unique,
  amount_cents int,
  currency text,
  created_at timestamptz not null default now()
);
create index if not exists purchases_user on public.purchases (user_id);
create index if not exists purchases_email on public.purchases (lower(email));

-- Qué es cada producto de Recurrente (lo llena el equipo al crear el producto/link de pago).
create table if not exists public.recurrente_products (
  product_id text primary key,                      -- id del producto en Recurrente
  item_key text,                                    -- course:<slug> | event:<slug> | workbook:<slug>
  plan_slug text,                                   -- flare-mensual | flare-anual (si es membresía)
  note text,
  check ((item_key is null) <> (plan_slug is null))
);

-- Bitácora e idempotencia del webhook.
create table if not exists public.billing_events (
  id text primary key,                              -- id del evento (svix-id)
  type text not null,
  payload jsonb not null,
  received_at timestamptz not null default now(),
  processed_at timestamptz,
  error text
);

-- ---------- formularios públicos ----------
create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  kind text not null check (kind in ('corporativo', 'lista-espera-cursos', 'notificaciones-charlas', 'lista-espera-evento')),
  email text not null check (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$' and char_length(email) <= 254),
  name text check (char_length(name) <= 200),
  company text check (char_length(company) <= 200),
  phone text check (char_length(phone) <= 40),
  message text check (char_length(message) <= 5000),
  source text check (char_length(source) <= 200),
  status text not null default 'nuevo',
  created_at timestamptz not null default now()
);
create index if not exists leads_kind on public.leads (kind, created_at desc);

-- ---------- funciones ----------
-- Compras y membresías llegan del webhook por correo; se enlazan a la cuenta cuando el
-- correo está confirmado (así nadie reclama compras ajenas registrándose con otro correo).
create or replace function public.link_billing_to_user(p_user uuid, p_email text)
returns void
language sql
security definer
set search_path = ''
as $$
  update public.purchases set user_id = p_user where user_id is null and lower(email) = lower(p_email);
  update public.subscriptions set user_id = p_user where user_id is null and lower(email) = lower(p_email);
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data ->> 'full_name', ''))
  on conflict (id) do nothing;
  if new.email_confirmed_at is not null then
    perform public.link_billing_to_user(new.id, new.email);
  end if;
  return new;
end;
$$;

create or replace function public.handle_user_confirmed()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.email_confirmed_at is not null and old.email_confirmed_at is null then
    perform public.link_billing_to_user(new.id, new.email);
  end if;
  if new.email is distinct from old.email then
    update public.profiles set email = new.email, updated_at = now() where id = new.id;
  end if;
  return new;
end;
$$;

-- Nadie puede llamarlas por la API (evita reclamar compras ajenas por RPC).
revoke execute on function public.link_billing_to_user(uuid, text) from public, anon, authenticated;
revoke execute on function public.handle_new_user() from public, anon, authenticated;
revoke execute on function public.handle_user_confirmed() from public, anon, authenticated;

-- ---------- triggers (después de crear las tablas que tocan) ----------
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

drop trigger if exists on_auth_user_updated on auth.users;
create trigger on_auth_user_updated
  after update of email_confirmed_at, email on auth.users
  for each row execute function public.handle_user_confirmed();

-- ---------- RLS ----------
alter table public.profiles enable row level security;
alter table public.favorites enable row level security;
alter table public.watch_history enable row level security;
alter table public.subscriptions enable row level security;
alter table public.purchases enable row level security;
alter table public.recurrente_products enable row level security;
alter table public.billing_events enable row level security;
alter table public.leads enable row level security;

create policy "perfil propio: leer" on public.profiles
  for select to authenticated using ((select auth.uid()) = id);
create policy "perfil propio: editar" on public.profiles
  for update to authenticated using ((select auth.uid()) = id) with check ((select auth.uid()) = id);
-- La usuaria solo puede cambiar su nombre (no su rol ni su correo).
revoke update on public.profiles from anon, authenticated;
grant update (full_name, updated_at) on public.profiles to authenticated;

create policy "favoritos propios" on public.favorites
  for all to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

create policy "historial propio" on public.watch_history
  for all to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

create policy "membresía propia" on public.subscriptions
  for select to authenticated using ((select auth.uid()) = user_id);

create policy "compras propias" on public.purchases
  for select to authenticated using ((select auth.uid()) = user_id);

-- recurrente_products y billing_events: sin políticas → solo service role.

-- Anti-spam: honeypot en los formularios de la web (campo oculto `website`) y largos topados
-- por los CHECK de arriba. Mejora pendiente: Turnstile + límite por IP (docs/06, sección 4.1).
create policy "cualquiera puede dejar sus datos" on public.leads
  for insert to anon, authenticated with check (status = 'nuevo');
revoke select, update, delete on public.leads from anon, authenticated;

-- ---------- permisos explícitos ----------
-- Hay proyectos que no exponen las tablas nuevas a la API por defecto: sin estos grants la web
-- no podría ni leer lo suyo. Si el proyecto ya los da, no cambia nada. RLS sigue decidiendo
-- QUÉ filas; esto solo decide qué operaciones existen.
grant usage on schema public to anon, authenticated, service_role;
grant select on public.profiles to authenticated;
grant select, insert, update, delete on public.favorites to authenticated;
grant select, insert, update, delete on public.watch_history to authenticated;
grant select on public.subscriptions, public.purchases to authenticated;
grant insert on public.leads to anon, authenticated;
grant all on public.profiles, public.favorites, public.watch_history, public.subscriptions, public.purchases,
  public.recurrente_products, public.billing_events, public.leads to service_role;
-- Solo service role: ni la llave pública ni una sesión tocan cobros ni la bitácora.
revoke all on public.recurrente_products, public.billing_events from anon, authenticated;
revoke insert, update, delete on public.subscriptions, public.purchases from anon, authenticated;
