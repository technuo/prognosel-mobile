-- PrognosEL – one-shot guards for scheduled notifications (2026-10-07)
-- Apply in the Supabase SQL Editor, same as the earlier migrations.
--
-- Why this exists: Vercel's free plan schedules cron jobs with hour precision
-- (±59 minutes), so a job asked to run at 05:00 UTC can fire anywhere inside the
-- 06:00–08:00 Stockholm window. The morning digest was gated on the run landing in
-- the 07 hour specifically, so an early or late invocation sent nothing at all —
-- silently, because "nothing to do" and "the schedule missed" look identical.
--
-- The digest is now defined as "the first run in the morning", and this table is
-- what keeps it to at most one per day: the insert *is* the claim, and a duplicate
-- key means another run already took it. The same mechanism keeps the weekly
-- summary to one per week if an hourly scheduler is added later.
--
-- The route also keeps a `last_run` row here, overwritten on every invocation with
-- that run's Stockholm time and what it decided. Without it, "the digest did not
-- arrive" and "the scheduler never fired" are the same observation.
--
-- Without this table the route still sends — it just has no once-a-day guard, and
-- says so in `actions` and in `last_run`.

create table if not exists public.push_state (
  key text primary key,
  value text not null,
  updated_at timestamptz not null default now()
);

-- Same reasoning as beta_signups: the table is written and read only by the
-- server route with the service role, so RLS stays on with no policies.
alter table public.push_state enable row level security;

-- Verification after applying:
--   select key, value, updated_at from public.push_state order by updated_at desc;
--   -- after the first morning run: one row, key = 'morning_digest',
--   -- value = that day's date in Stockholm (YYYY-MM-DD)
--   -- and one row, key = 'last_run', value = '<date> HH:MM | digest: sent 1, failed 0'
