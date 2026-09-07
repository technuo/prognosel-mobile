-- PrognosEL – product analytics events table (2026-08-27)
-- Apply in the Supabase SQL Editor (same as the RLS migration).
-- Only authenticated users are tracked (client helper skips anonymous),
-- so user_id is expected to be set; NULL is allowed as a safety net.

create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id) on delete cascade,
  event text not null,
  meta jsonb,
  created_at timestamptz not null default now()
);

create index if not exists events_user_created_idx
  on public.events (user_id, created_at desc);
create index if not exists events_event_created_idx
  on public.events (event, created_at desc);

alter table public.events enable row level security;

-- Users may only insert their own events (or anonymous safety-net rows)…
drop policy if exists "events_insert_own" on public.events;
create policy "events_insert_own" on public.events
  for insert with check (user_id is null or user_id = auth.uid());

-- …and read back only their own events (useful for debugging, not exposed in UI).
drop policy if exists "events_select_own" on public.events;
create policy "events_select_own" on public.events
  for select using (user_id = auth.uid());

-- No update / delete policies: events are append-only.

-- Verification after applying:
--   set local role anon;          insert → rejected (user_id null allowed by policy — use a
--                                  signed-in client to insert real events)
--   Authenticated client events: check with
--     select event, count(*) from public.events group by 1 order by 2 desc;
