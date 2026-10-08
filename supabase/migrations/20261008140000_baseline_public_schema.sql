-- PrognosEL – baseline for the public schema (2026-10-08)
-- Apply in the Supabase SQL Editor, same as the earlier migrations.
--
-- Why this exists: `profiles`, `tasks`, `forecasts`, `chat_sessions`,
-- `chat_messages`, `appliance_catalog`, `user_appliances` and
-- `daily_forecast_summary` were all created by hand in the Supabase dashboard
-- and were never written down. Nothing in this repository could rebuild the
-- database, and code and schema had drifted apart without anything noticing —
-- the app wrote `status = 'completed'` for weeks while `task_status` did not
-- accept that value, and the only symptom was a sync banner on one screen.
--
-- This file captures those objects as they exist today. It is written so that
-- running it against the live database changes nothing: every table is
-- `if not exists`, every index is `if not exists`, and every policy and trigger
-- is created only when it is absent. A fresh database gets the same shape.
--
-- NOT captured here:
--   * row data (see the note on appliance_catalog below)
--   * grants — Supabase's default privileges already cover new tables; see
--     `20261007090000_push_state.sql` for why that stops being true for tables
--     created after 2026-10-30
--   * the four tables that already have their own migrations: `device_tokens`,
--     `events`, `beta_signups`, `push_state`
--
-- Deliberate differences from the live database are in
-- `20261008140100_baseline_corrections.sql`, not here.

-- ── extensions ────────────────────────────────────────────────────────────────
-- uuid_generate_v4() is the default on several id columns below.
create extension if not exists "uuid-ossp";
-- gen_random_uuid(), used by the tables that have their own migrations.
create extension if not exists "pgcrypto";

-- ── task_status ───────────────────────────────────────────────────────────────
-- `done` and `dismissed` are dead: no code writes them and no row uses them. They
-- are kept because dropping a value means recreating the type, and because the
-- costs of that outweigh the tidiness.
do $p$ begin
  if not exists (select 1 from pg_type where typname = 'task_status' and typnamespace = 'public'::regnamespace) then
    create type public.task_status as enum ('pending', 'done', 'dismissed', 'completed');
  end if;
end $p$;

-- ── tables ────────────────────────────────────────────────────────────────────
-- Order matters: `tasks` and `user_appliances` reference `appliance_catalog`, and
-- `tasks`, `chat_sessions` and `device_tokens` reference `profiles`.

-- A shared catalogue, not user data. Nothing in the app reads it today — it exists
-- as the foreign key target for `tasks.appliance_id` and
-- `user_appliances.appliance_id`. Its rows are NOT reproduced here; if it is ever
-- used, its contents will need to come from somewhere.
create table if not exists public.appliance_catalog (
  id text primary key,
  name text not null,
  name_sv text,
  kwh numeric not null,
  icon_name text default 'bolt',
  sort_order integer default 0,
  created_at timestamptz default now()
);

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  selected_zone text not null default 'SE3'
    check (selected_zone in ('SE1', 'SE2', 'SE3', 'SE4')),
  display_name text,
  avatar_url text,
  currency text default 'SEK',
  price_unit text default 'kWh',
  notify_tips boolean default true,
  notify_weekly boolean default true,
  notify_tasks boolean not null default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.tasks (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  appliance_id text references public.appliance_catalog (id),
  title text not null,
  description text,
  status public.task_status default 'pending',
  estimated_savings numeric default 0,
  actual_savings numeric,
  zone text not null default 'SE3',
  source text default 'ai_tip',
  scheduled_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz default now()
);

create table if not exists public.forecasts (
  id uuid primary key default uuid_generate_v4(),
  zone text not null check (zone in ('SE1', 'SE2', 'SE3', 'SE4')),
  horizon_hours integer not null check (horizon_hours in (1, 24, 168)),
  "timestamp" timestamptz not null,
  predicted_price numeric not null,
  confidence_lower numeric,
  confidence_upper numeric,
  model_version text default 'w9_enhanced',
  generated_at timestamptz default now(),
  unique (zone, horizon_hours, "timestamp")
);

create table if not exists public.chat_sessions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  title text,
  context_snapshot jsonb,
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.chat_messages (
  id uuid primary key default uuid_generate_v4(),
  session_id uuid not null references public.chat_sessions (id) on delete cascade,
  role text not null check (role in ('user', 'assistant', 'system')),
  content text not null,
  source text,
  meta jsonb,
  created_at timestamptz default now()
);

create table if not exists public.user_appliances (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  appliance_id text not null references public.appliance_catalog (id) on delete cascade,
  custom_kwh numeric,
  is_active boolean default true,
  created_at timestamptz default now(),
  unique (user_id, appliance_id)
);

-- ── indexes ───────────────────────────────────────────────────────────────────
-- Primary key and unique-constraint indexes come from the table definitions above;
-- these are the extra ones.
create index if not exists idx_tasks_user_status
  on public.tasks (user_id, status, scheduled_at);
create index if not exists idx_tasks_user_zone
  on public.tasks (user_id, zone, created_at desc);
create index if not exists idx_chat_messages_session
  on public.chat_messages (session_id, created_at);

-- ── row level security ────────────────────────────────────────────────────────
-- Deliberately absent: `appliance_catalog`. See the corrections migration.
alter table public.profiles enable row level security;
alter table public.tasks enable row level security;
alter table public.forecasts enable row level security;
alter table public.chat_sessions enable row level security;
alter table public.chat_messages enable row level security;
alter table public.user_appliances enable row level security;

-- ── policies ──────────────────────────────────────────────────────────────────
-- Each one is created only if a policy with that name is missing, so this file
-- never rewrites an existing rule.

do $p$ begin if not exists (select 1 from pg_policies where schemaname='public' and tablename='profiles' and policyname='profiles_select_own') then
  create policy profiles_select_own on public.profiles for select to public using (auth.uid() = id); end if; end $p$;
do $p$ begin if not exists (select 1 from pg_policies where schemaname='public' and tablename='profiles' and policyname='profiles_insert_own') then
  create policy profiles_insert_own on public.profiles for insert to public with check (auth.uid() = id); end if; end $p$;
do $p$ begin if not exists (select 1 from pg_policies where schemaname='public' and tablename='profiles' and policyname='profiles_update_own') then
  create policy profiles_update_own on public.profiles for update to public using (auth.uid() = id) with check (auth.uid() = id); end if; end $p$;

do $p$ begin if not exists (select 1 from pg_policies where schemaname='public' and tablename='tasks' and policyname='tasks_select_own') then
  create policy tasks_select_own on public.tasks for select to public using (auth.uid() = user_id); end if; end $p$;
do $p$ begin if not exists (select 1 from pg_policies where schemaname='public' and tablename='tasks' and policyname='tasks_insert_own') then
  create policy tasks_insert_own on public.tasks for insert to public with check (auth.uid() = user_id); end if; end $p$;
do $p$ begin if not exists (select 1 from pg_policies where schemaname='public' and tablename='tasks' and policyname='tasks_update_own') then
  create policy tasks_update_own on public.tasks for update to public using (auth.uid() = user_id) with check (auth.uid() = user_id); end if; end $p$;
do $p$ begin if not exists (select 1 from pg_policies where schemaname='public' and tablename='tasks' and policyname='tasks_delete_own') then
  create policy tasks_delete_own on public.tasks for delete to public using (auth.uid() = user_id); end if; end $p$;

do $p$ begin if not exists (select 1 from pg_policies where schemaname='public' and tablename='chat_sessions' and policyname='chat_sessions_select_own') then
  create policy chat_sessions_select_own on public.chat_sessions for select to public using (auth.uid() = user_id); end if; end $p$;
do $p$ begin if not exists (select 1 from pg_policies where schemaname='public' and tablename='chat_sessions' and policyname='chat_sessions_insert_own') then
  create policy chat_sessions_insert_own on public.chat_sessions for insert to public with check (auth.uid() = user_id); end if; end $p$;
do $p$ begin if not exists (select 1 from pg_policies where schemaname='public' and tablename='chat_sessions' and policyname='chat_sessions_update_own') then
  create policy chat_sessions_update_own on public.chat_sessions for update to public using (auth.uid() = user_id) with check (auth.uid() = user_id); end if; end $p$;

do $p$ begin if not exists (select 1 from pg_policies where schemaname='public' and tablename='chat_messages' and policyname='chat_messages_select_own') then
  create policy chat_messages_select_own on public.chat_messages for select to public using (
    exists (select 1 from public.chat_sessions s where s.id = chat_messages.session_id and s.user_id = auth.uid())); end if; end $p$;
do $p$ begin if not exists (select 1 from pg_policies where schemaname='public' and tablename='chat_messages' and policyname='chat_messages_insert_own') then
  create policy chat_messages_insert_own on public.chat_messages for insert to public with check (
    exists (select 1 from public.chat_sessions s where s.id = chat_messages.session_id and s.user_id = auth.uid())); end if; end $p$;
do $p$ begin if not exists (select 1 from pg_policies where schemaname='public' and tablename='chat_messages' and policyname='chat_messages_update_own') then
  create policy chat_messages_update_own on public.chat_messages for update to public using (
    exists (select 1 from public.chat_sessions s where s.id = chat_messages.session_id and s.user_id = auth.uid()))
  with check (
    exists (select 1 from public.chat_sessions s where s.id = chat_messages.session_id and s.user_id = auth.uid())); end if; end $p$;

do $p$ begin if not exists (select 1 from pg_policies where schemaname='public' and tablename='user_appliances' and policyname='user_appliances_select_own') then
  create policy user_appliances_select_own on public.user_appliances for select to public using (auth.uid() = user_id); end if; end $p$;
do $p$ begin if not exists (select 1 from pg_policies where schemaname='public' and tablename='user_appliances' and policyname='user_appliances_insert_own') then
  create policy user_appliances_insert_own on public.user_appliances for insert to public with check (auth.uid() = user_id); end if; end $p$;
do $p$ begin if not exists (select 1 from pg_policies where schemaname='public' and tablename='user_appliances' and policyname='user_appliances_update_own') then
  create policy user_appliances_update_own on public.user_appliances for update to public using (auth.uid() = user_id) with check (auth.uid() = user_id); end if; end $p$;
do $p$ begin if not exists (select 1 from pg_policies where schemaname='public' and tablename='user_appliances' and policyname='user_appliances_delete_own') then
  create policy user_appliances_delete_own on public.user_appliances for delete to public using (auth.uid() = user_id); end if; end $p$;

-- Price forecasts are public data, so anon may read them. Writes happen with the
-- service role, which bypasses RLS.
do $p$ begin if not exists (select 1 from pg_policies where schemaname='public' and tablename='forecasts' and policyname='forecasts_public_read') then
  create policy forecasts_public_read on public.forecasts for select to anon, authenticated using (true); end if; end $p$;

-- The catalogue is public data too. Its policy is inert until RLS is enabled on the
-- table — see the corrections migration.
--
-- The name is the awkward one it already has, rather than a tidy new one, so that
-- running this file against the live database really is a no-op. A policy under a
-- different name would be a second, duplicate rule.
do $p$ begin if not exists (select 1 from pg_policies where schemaname='public' and tablename='appliance_catalog' and policyname='Appliance catalog is public read-only') then
  create policy "Appliance catalog is public read-only" on public.appliance_catalog for select to anon, authenticated using (true); end if; end $p$;

-- ── functions ─────────────────────────────────────────────────────────────────

-- Bumps `updated_at` on UPDATE. Used by the triggers below.
create or replace function public.trigger_set_timestamp()
returns trigger
language plpgsql
as $function$
begin
  new.updated_at = now();
  return new;
end;
$function$;

-- Gives every new account a profile row. The app never inserts one itself, so
-- without this trigger a new user has no `profiles` row and every screen that
-- reads it fails. Attached to `auth.users`, which is why it was easy to miss.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
as $function$
begin
  insert into public.profiles (id, email, selected_zone)
  values (new.id, new.email, 'SE3');
  return new;
end;
$function$;

-- Counts a user's completed tasks and savings.
--
-- WARNING: this filters on `status = 'done'`, a value nothing writes. As written it
-- always reports zero completed tasks. Nothing calls it today. Left exactly as it
-- is here so the baseline is faithful; the corrections migration fixes it.
create or replace function public.get_user_savings_summary(user_uuid uuid)
returns table(total_tasks bigint, completed_tasks bigint, total_estimated_savings numeric, total_actual_savings numeric)
language plpgsql
security definer
as $function$
begin
  return query
  select
    count(*)::bigint,
    count(*) filter (where status = 'done')::bigint,
    coalesce(sum(estimated_savings) filter (where status = 'done'), 0),
    coalesce(sum(actual_savings) filter (where status = 'done'), 0)
  from public.tasks
  where tasks.user_id = user_uuid;
end;
$function$;

-- ── triggers ──────────────────────────────────────────────────────────────────
do $p$ begin if not exists (select 1 from pg_trigger where tgname = 'set_profiles_timestamp' and tgrelid = 'public.profiles'::regclass) then
  create trigger set_profiles_timestamp before update on public.profiles
    for each row execute function public.trigger_set_timestamp(); end if; end $p$;

do $p$ begin if not exists (select 1 from pg_trigger where tgname = 'set_chat_sessions_timestamp' and tgrelid = 'public.chat_sessions'::regclass) then
  create trigger set_chat_sessions_timestamp before update on public.chat_sessions
    for each row execute function public.trigger_set_timestamp(); end if; end $p$;

do $p$ begin if not exists (select 1 from pg_trigger where tgname = 'on_auth_user_created' and tgrelid = 'auth.users'::regclass) then
  create trigger on_auth_user_created after insert on auth.users
    for each row execute function public.handle_new_user(); end if; end $p$;

-- ── daily_forecast_summary (materialized view) ────────────────────────────────
-- Nothing reads it today; it is kept because it exists and is reachable. Note that
-- RLS cannot be enabled on a materialized view, so anything granted access to it
-- sees every row.
create materialized view if not exists public.daily_forecast_summary as
with daily_stats as (
  select forecasts.zone,
         forecasts.horizon_hours,
         date(forecasts."timestamp") as forecast_date,
         min(forecasts.predicted_price) as min_price,
         max(forecasts.predicted_price) as max_price,
         avg(forecasts.predicted_price) as avg_price
    from forecasts
   group by forecasts.zone, forecasts.horizon_hours, (date(forecasts."timestamp"))
), ranked_hours as (
  select f.zone,
         f.horizon_hours,
         date(f."timestamp") as forecast_date,
         f."timestamp" as cheapest_hour,
         row_number() over (
           partition by f.zone, f.horizon_hours, (date(f."timestamp"))
           order by f.predicted_price, f."timestamp"
         ) as rn
    from forecasts f
)
select ds.zone,
       ds.horizon_hours,
       ds.forecast_date,
       ds.min_price,
       ds.max_price,
       ds.avg_price,
       rh.cheapest_hour
  from daily_stats ds
  left join ranked_hours rh
    on ds.zone = rh.zone
   and ds.horizon_hours = rh.horizon_hours
   and ds.forecast_date = rh.forecast_date
   and rh.rn = 1;

create unique index if not exists idx_daily_forecast_summary_pk
  on public.daily_forecast_summary (zone, horizon_hours, forecast_date);

-- ── verification ──────────────────────────────────────────────────────────────
-- Both queries should return one row per expected object, and running this file a
-- second time should change nothing.
--
--   select table_name from information_schema.tables
--    where table_schema = 'public' and table_type = 'BASE TABLE'
--    order by table_name;
--   -- expect 11: appliance_catalog, beta_signups, chat_messages, chat_sessions,
--   -- device_tokens, events, forecasts, profiles, push_state, tasks,
--   -- user_appliances
--
--   select tablename, count(*) from pg_policies
--    where schemaname = 'public' group by tablename order by tablename;
