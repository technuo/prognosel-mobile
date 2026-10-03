-- PrognosEL – task reminder preference (2026-10-03)
-- Apply in the Supabase SQL Editor, same as the earlier migrations.
--
-- Settings has always shown a "Påminnelser" row; it was disabled because
-- nothing could be sent for it. This column is what that switch writes, and
-- what the push scheduler reads to decide who should be reminded about the
-- tasks they have left when the cheapest hours are about to start.
--
-- Default true: a user who never touched a notification switch never
-- registered a device either, so the scheduler drops them before sending
-- anything. The default only decides where the switch sits the first time it
-- is seen — it cannot cause a notification on its own.

alter table public.profiles
  add column if not exists notify_tasks boolean not null default true;

-- Verification after applying:
--   select column_name, data_type, column_default, is_nullable
--     from information_schema.columns
--    where table_schema = 'public'
--      and table_name = 'profiles'
--      and column_name = 'notify_tasks';
--   -- expect one row: notify_tasks | boolean | true | NO
