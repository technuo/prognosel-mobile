-- PrognosEL – repair the device_tokens table (2026-10-06)
-- Apply in the Supabase SQL Editor, same as the earlier migrations.
--
-- The live table is missing `updated_at`, which 20261002170000_create_device_tokens.sql
-- declares. `register_device_token` upserts with
-- `on conflict (token) do update set ... updated_at = now()`, so every call failed
-- with 42703 `column "updated_at" of relation "device_tokens" does not exist` and
-- no device was ever stored — the notification switches in the Android app flipped
-- back off with a generic "couldn't enable notifications" message.
--
-- A plpgsql body is not checked when the function is created, so the function was
-- created happily and only failed at runtime. That is why this went unnoticed until
-- the app was installed from Google Play and a switch was tapped for real.
--
-- `if not exists` makes this a no-op on any database where the original migration
-- did create the column.

alter table public.device_tokens
  add column if not exists updated_at timestamptz not null default now();

-- Verification after applying:
--   select column_name, data_type, is_nullable
--     from information_schema.columns
--    where table_schema = 'public'
--      and table_name = 'device_tokens'
--    order by ordinal_position;
--   -- expect: id, user_id, token, platform, created_at, updated_at
