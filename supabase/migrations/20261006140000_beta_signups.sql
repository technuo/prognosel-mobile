-- PrognosEL – e-mail signups for the closed test (2026-10-06)
-- Apply in the Supabase SQL Editor, same as the earlier migrations.
--
-- The landing page collects an address from people who want to test the Android
-- app. Google Play's closed testing needs the tester's Google account to be on
-- our tester list before they can opt in, so this table is simply the queue of
-- addresses to add there.
--
-- No RLS policies are created on purpose: the table is written and read only by
-- the server route with the service role, so nobody can list the addresses
-- through the public API. The address is also the natural primary key for
-- idempotency — submitting twice must not create two rows.

create table if not exists public.beta_signups (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  source text,
  created_at timestamptz not null default now(),
  constraint beta_signups_email_key unique (email)
);

alter table public.beta_signups enable row level security;

-- Verification after applying:
--   select column_name, data_type, is_nullable
--     from information_schema.columns
--    where table_schema = 'public'
--      and table_name = 'beta_signups'
--    order by ordinal_position;
--   -- expect: id, email, source, created_at
--
--   select relrowsecurity from pg_class where oid = 'public.beta_signups'::regclass;
--   -- expect: true, with no policies listed under Authentication > Policies
