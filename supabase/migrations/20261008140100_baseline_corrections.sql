-- PrognosEL – corrections found while writing the baseline (2026-10-08)
-- Apply in the Supabase SQL Editor, same as the earlier migrations.
--
-- The baseline next to this file records what the database looks like today. This
-- file changes four things that writing it down made visible. Each one is
-- independent; none of them touch row data.

-- ── 1. `appliance_catalog` has row level security switched off ────────────────
--
-- It is in the `public` schema with the same grants as every other table, so with
-- RLS off anyone holding the publishable key can insert, update or delete the
-- catalogue — not just read it. The read-only policy that was written for it has
-- been inert the whole time, because a policy without RLS does nothing.
--
-- Nothing writes this table (the app never reads it either; it exists as a foreign
-- key target), so enabling RLS with only that read policy takes nothing away from
-- working code.
alter table public.appliance_catalog enable row level security;

-- ── 2. Duplicate policies, and UPDATE rules missing WITH CHECK ───────────────
--
-- Permissive policies are OR-ed, so where a table has both a strict and a loose
-- UPDATE policy the loose one wins. Without WITH CHECK, USING is only evaluated
-- against the existing row: a user can update their own row and set `user_id` (or
-- `id`) to somebody else's. On `tasks` that means writing into another user's list.
--
-- The duplicates came from running the setup more than once. Dropping the loose
-- copies leaves the strict ones, which allow everything the app actually does —
-- it never reassigns rows — so this cannot break a working screen.
--
-- Every drop below is checked against the policy list first: a command is only
-- dropped when another policy on the same table already covers it. `device_tokens`
-- is the exception — its INSERT and UPDATE rules exist under one name only, so
-- they are replaced rather than dropped (see below).
drop policy if exists "Users can update own profile" on public.profiles;
drop policy if exists "Users can update own tasks" on public.tasks;
drop policy if exists "Users can update own chat sessions" on public.chat_sessions;

-- The read/insert/delete duplicates are harmless — identical rules — but they make
-- it harder to answer "what does this table allow?". Removed for the same reason.
drop policy if exists "Users can read own profile" on public.profiles;
drop policy if exists "Users can read own tasks" on public.tasks;
drop policy if exists "Users can insert own tasks" on public.tasks;
drop policy if exists "Users can delete own tasks" on public.tasks;
drop policy if exists "Users can read own chat sessions" on public.chat_sessions;
drop policy if exists "Users can insert own chat sessions" on public.chat_sessions;
drop policy if exists "Users can read own messages" on public.chat_messages;
drop policy if exists "Users can insert own messages" on public.chat_messages;
drop policy if exists "Users can read own tokens" on public.device_tokens;
drop policy if exists "Users can delete own tokens" on public.device_tokens;
drop policy if exists "Forecasts are public read-only" on public.forecasts;

-- `device_tokens` INSERT and UPDATE have no second copy, so they are replaced in
-- place rather than removed — deleting them would leave the table with no rule for
-- either command. The INSERT rule is already correct; only UPDATE is missing its
-- check, so only UPDATE is rewritten.
drop policy if exists "Users can update own tokens" on public.device_tokens;
create policy "Users can update own tokens" on public.device_tokens
  for update to public
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ── 3. A savings summary that always reports zero ────────────────────────────
--
-- `status = 'done'` is a value no code writes and no row uses. The app writes
-- 'completed'. Left as it was, this function answers "0 completed, 0 kr saved" no
-- matter what the user has done. Nothing calls it yet, which is why nobody noticed.
create or replace function public.get_user_savings_summary(user_uuid uuid)
returns table(total_tasks bigint, completed_tasks bigint, total_estimated_savings numeric, total_actual_savings numeric)
language plpgsql
security definer
as $function$
begin
  return query
  select
    count(*)::bigint,
    count(*) filter (where status = 'completed')::bigint,
    coalesce(sum(estimated_savings) filter (where status = 'completed'), 0),
    coalesce(sum(actual_savings) filter (where status = 'completed'), 0)
  from public.tasks
  where tasks.user_id = user_uuid;
end;
$function$;

-- ── 4. A duplicate index on `forecasts` ──────────────────────────────────────
--
-- `idx_forecasts_zone_horizon_time` and `idx_forecasts_zone_horizon_timestamp` are
-- the same index on the same columns with the same order. Keeping both costs write
-- time on a table the forecast job rewrites regularly.
drop index if exists public.idx_forecasts_zone_horizon_time;

-- ── verification ──────────────────────────────────────────────────────────────
--
--   select relname, relrowsecurity from pg_class
--    where relnamespace = 'public'::regnamespace and relkind = 'r'
--    order by relname;
--   -- every row should now say true
--
--   select tablename, policyname, cmd from pg_policies
--    where schemaname = 'public' and tablename in ('tasks','profiles')
--    order by tablename, cmd;
--   -- expect one policy per command, four per table, each UPDATE with a check
--
--   select indexname from pg_indexes
--    where schemaname = 'public' and tablename = 'forecasts' order by indexname;
