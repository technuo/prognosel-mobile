-- PrognosEL – second half of the device_tokens drift repair (2026-10-06)
-- Apply in the Supabase SQL Editor, after 20261006120000_device_tokens_updated_at.sql.
--
-- Once `updated_at` existed, registration moved on to the next missing piece:
--   42P10 there is no unique or exclusion constraint matching the ON CONFLICT specification
-- The live table also lacks the UNIQUE (token) constraint that
-- 20261002170000_create_device_tokens.sql declares, and `register_device_token`
-- upserts on that column.
--
-- Same root cause as the first half: the table that exists in the database was not
-- created by this migration file, so the column and the constraints both drifted.
-- This file is written to be safe to run more than once.

-- 1. Collapse duplicate tokens first — the constraint cannot be added over them.
--    No registration ever succeeded, so this should touch nothing; it is here so the
--    migration cannot fail on a database where something else inserted rows.
delete from public.device_tokens a
 using public.device_tokens b
 where a.token = b.token
   and a.ctid > b.ctid;

-- 2. `id` has to keep generating itself, because the insert does not supply one.
alter table public.device_tokens
  alter column id set default gen_random_uuid();

-- 3. The constraint the upsert needs.
do $$
begin
  if not exists (
    select 1
      from pg_constraint
     where conrelid = 'public.device_tokens'::regclass
       and conname = 'device_tokens_token_key'
  ) then
    alter table public.device_tokens
      add constraint device_tokens_token_key unique (token);
  end if;
end $$;

-- Verification after applying — this also shows whether the rest of the declared
-- shape survived:
--   select conname, pg_get_constraintdef(oid)
--     from pg_constraint
--    where conrelid = 'public.device_tokens'::regclass
--    order by conname;
--   -- expect at least: device_tokens_token_key UNIQUE (token)
--   -- ideally also a primary key on id, and a foreign key on user_id pointing at
--   -- auth.users(id) ON DELETE CASCADE (account deletion relies on that cascade).
