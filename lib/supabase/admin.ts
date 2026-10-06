import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Service-role client, for server routes that have to act across users.
 *
 * It bypasses row-level security, so this module must never be imported into
 * anything that reaches the browser: the key comes from a non-public environment
 * variable and is only ever read on the server.
 *
 * Returns null when the key is missing, so a route can answer 503 instead of
 * throwing — the same shape the push sender and the deletion route already use.
 */
export function serviceRoleClient(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;

  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
