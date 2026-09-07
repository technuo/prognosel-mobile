-- PrognosEL – Supabase RLS audit & hardening (2026-08-27)
-- How to apply:
--   option A: `supabase db push` (if linked) 
--   option B: paste into Supabase Dashboard → SQL Editor
--
-- Ownership model in the app:
--   profiles.id        = auth.uid()            (profiles.id references auth.users.id)
--   tasks.user_id      = auth.uid()
--   chat_sessions.user_id = auth.uid()
--   chat_messages      → owned through its parent chat_sessions.session_id
--   forecasts          → public read-only; writes only via service role (data pipeline)
--
-- NOTE: chat_messages has no user_id column, so its policies resolve the owner
-- through chat_sessions. chat_sessions has no delete path in the app (sessions
-- are closed with is_active = false), so only update is granted there.

alter table public.profiles enable row level security;
alter table public.tasks enable row level security;
alter table public.chat_sessions enable row level security;
alter table public.chat_messages enable row level security;
alter table public.forecasts enable row level security;

-- ── profiles ────────────────────────────────────────────────────────────────
drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id);

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own" on public.profiles
  for insert with check (auth.uid() = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);

-- ── tasks ───────────────────────────────────────────────────────────────────
drop policy if exists "tasks_select_own" on public.tasks;
create policy "tasks_select_own" on public.tasks
  for select using (auth.uid() = user_id);

drop policy if exists "tasks_insert_own" on public.tasks;
create policy "tasks_insert_own" on public.tasks
  for insert with check (auth.uid() = user_id);

drop policy if exists "tasks_update_own" on public.tasks;
create policy "tasks_update_own" on public.tasks
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "tasks_delete_own" on public.tasks;
create policy "tasks_delete_own" on public.tasks
  for delete using (auth.uid() = user_id);

-- ── chat_sessions ───────────────────────────────────────────────────────────
drop policy if exists "chat_sessions_select_own" on public.chat_sessions;
create policy "chat_sessions_select_own" on public.chat_sessions
  for select using (auth.uid() = user_id);

drop policy if exists "chat_sessions_insert_own" on public.chat_sessions;
create policy "chat_sessions_insert_own" on public.chat_sessions
  for insert with check (auth.uid() = user_id);

drop policy if exists "chat_sessions_update_own" on public.chat_sessions;
create policy "chat_sessions_update_own" on public.chat_sessions
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ── chat_messages (owner via session) ───────────────────────────────────────
drop policy if exists "chat_messages_select_own" on public.chat_messages;
create policy "chat_messages_select_own" on public.chat_messages
  for select using (
    exists (
      select 1 from public.chat_sessions s
      where s.id = chat_messages.session_id and s.user_id = auth.uid()
    )
  );

drop policy if exists "chat_messages_insert_own" on public.chat_messages;
create policy "chat_messages_insert_own" on public.chat_messages
  for insert with check (
    exists (
      select 1 from public.chat_sessions s
      where s.id = chat_messages.session_id and s.user_id = auth.uid()
    )
  );

drop policy if exists "chat_messages_update_own" on public.chat_messages;
create policy "chat_messages_update_own" on public.chat_messages
  for update using (
    exists (
      select 1 from public.chat_sessions s
      where s.id = chat_messages.session_id and s.user_id = auth.uid()
    )
  ) with check (
    exists (
      select 1 from public.chat_sessions s
      where s.id = chat_messages.session_id and s.user_id = auth.uid()
    )
  );

-- ── forecasts: public read, no anon writes ──────────────────────────────────
drop policy if exists "forecasts_public_read" on public.forecasts;
create policy "forecasts_public_read" on public.forecasts
  for select using (true);

-- Writes to forecasts come from the data pipeline and must use the service
-- role key, which bypasses RLS. Never grant INSERT/UPDATE/DELETE to anon or
-- authenticated here.

-- ── Post-apply verification (run as the postgres/service role) ──────────────
-- 1) Anonymous SELECT on public.forecasts ............ should return rows
-- 2) Anonymous INSERT into forecasts ................. should be rejected
-- 3) User A SELECT on user B's tasks ................. should return 0 rows
-- 4) User A INSERT chat_message into user B's session  should be rejected
