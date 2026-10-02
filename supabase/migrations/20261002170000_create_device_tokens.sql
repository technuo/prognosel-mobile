-- PrognosEL – push notification device tokens (2026-10-02)
-- Apply in the Supabase SQL Editor, same as the earlier migrations.
--
-- One row per device that has agreed to receive notifications. The token is
-- what the push service addresses, so it is unique across the whole table —
-- a phone that signs into a second account must move its token, not duplicate
-- it, or the previous account would keep receiving that device's notifications.
-- Moving it is what the register_device_token function below is for.

create table if not exists public.device_tokens (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  token text not null,
  platform text not null default 'android',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint device_tokens_token_key unique (token)
);

create index if not exists device_tokens_user_idx
  on public.device_tokens (user_id);

alter table public.device_tokens enable row level security;

-- A user may read and remove their own registrations. Insert and update go
-- through the function below instead, because reassigning a token from one
-- account to another has to bypass row-level security to be possible at all.
drop policy if exists "device_tokens_select_own" on public.device_tokens;
create policy "device_tokens_select_own" on public.device_tokens
  for select using (auth.uid() = user_id);

drop policy if exists "device_tokens_delete_own" on public.device_tokens;
create policy "device_tokens_delete_own" on public.device_tokens
  for delete using (auth.uid() = user_id);

-- Registering this device for the signed-in user.
--
-- SECURITY DEFINER so the upsert can take over a token that another account
-- registered earlier (a hand-me-down phone, or a tester switching accounts).
-- The body is careful: it refuses to run without a session and only ever writes
-- the caller's own user_id, so it cannot be used to register a device for
-- somebody else. search_path is pinned so a shadowed public schema cannot
-- hijack the function.
create or replace function public.register_device_token(
  p_token text,
  p_platform text default 'android'
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
begin
  if v_user is null then
    raise exception 'register_device_token requires an authenticated user';
  end if;

  if p_token is null or length(trim(p_token)) = 0 then
    raise exception 'register_device_token requires a token';
  end if;

  insert into public.device_tokens (user_id, token, platform)
  values (v_user, trim(p_token), coalesce(nullif(trim(p_platform), ''), 'android'))
  on conflict (token) do update
    set user_id = excluded.user_id,
        platform = excluded.platform,
        updated_at = now();
end;
$$;

revoke all on function public.register_device_token(text, text) from public;
grant execute on function public.register_device_token(text, text) to authenticated;

-- Verification after applying:
--   select count(*) from public.device_tokens;                       -- 0 before any device registers
--   -- as an authenticated user, calling the function twice with the same token
--   -- should leave exactly one row:
--   select user_id, token from public.device_tokens;
--   -- a different signed-in user calling it with that token should take it over,
--   -- still leaving one row, now owned by the second user.
