import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import type { ZoneCode } from "@/types";

/**
 * Who should receive a notification.
 *
 * Reading across users requires the service role, which bypasses RLS — the
 * same key the account-deletion route uses. It never leaves the server.
 */

export type Preference = "notify_tips" | "notify_weekly";

export interface Recipient {
  userId: string;
  zone: ZoneCode;
  tokens: string[];
}

export function adminClient(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

/**
 * Users with `preference` switched on, each with every device they registered.
 * A user with no registered device is dropped: there is nothing to send to, and
 * counting them would make the logs lie about reach.
 */
export async function recipientsFor(
  preference: Preference
): Promise<Recipient[]> {
  const admin = adminClient();
  if (!admin) return [];

  const { data: profiles, error } = await admin
    .from("profiles")
    .select("id, selected_zone")
    .eq(preference, true);

  if (error) {
    console.error(`[push] could not read profiles for ${preference}:`, error.message);
    return [];
  }
  if (!profiles || profiles.length === 0) return [];

  const ids = profiles.map((p) => p.id);
  const { data: devices, error: deviceError } = await admin
    .from("device_tokens")
    .select("user_id, token")
    .in("user_id", ids);

  if (deviceError) {
    console.error("[push] could not read device tokens:", deviceError.message);
    return [];
  }

  const byUser = new Map<string, string[]>();
  for (const device of devices ?? []) {
    const list = byUser.get(device.user_id) ?? [];
    list.push(device.token);
    byUser.set(device.user_id, list);
  }

  return profiles
    .map((profile) => ({
      userId: profile.id as string,
      zone: profile.selected_zone as ZoneCode,
      tokens: byUser.get(profile.id) ?? [],
    }))
    .filter((recipient) => recipient.tokens.length > 0);
}
