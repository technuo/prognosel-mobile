import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import type { ZoneCode } from "@/types";

/**
 * Who should receive a notification.
 *
 * Reading across users requires the service role, which bypasses RLS — the
 * same key the account-deletion route uses. It never leaves the server.
 */

export type Preference = "notify_tips" | "notify_weekly" | "notify_tasks";

export interface Recipient {
  userId: string;
  zone: ZoneCode;
  tokens: string[];
  /**
   * Every alert this user has switched on, not only the one they matched on.
   * The cheapest-window alert is built from both notify_tips and notify_tasks,
   * so it has to know which of them applies before it can decide what to say.
   */
  prefs: Record<Preference, boolean>;
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
 * Users with any of `preferences` switched on, each with every device they
 * registered. A user with no registered device is dropped: there is nothing to
 * send to, and counting them would make the logs lie about reach.
 */
export async function recipientsFor(
  ...preferences: Preference[]
): Promise<Recipient[]> {
  const admin = adminClient();
  if (!admin || preferences.length === 0) return [];

  const { data: profiles, error } = await admin
    .from("profiles")
    .select("id, selected_zone, notify_tips, notify_weekly, notify_tasks")
    .or(preferences.map((preference) => `${preference}.eq.true`).join(","));

  if (error) {
    console.error(
      `[push] could not read profiles for ${preferences.join(", ")}:`,
      error.message
    );
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
      prefs: {
        notify_tips: profile.notify_tips === true,
        notify_weekly: profile.notify_weekly === true,
        notify_tasks: profile.notify_tasks === true,
      },
    }))
    .filter((recipient) => recipient.tokens.length > 0);
}

/**
 * The unfinished tasks of `userIds`, oldest first, keyed by user.
 *
 * Titles only: a reminder names one, and this runs on every tick for every
 * user with task reminders on, so it stays as small as it can be.
 *
 * On a failed read the map comes back empty rather than throwing. The alert
 * then drops to the price wording, which is a quieter failure than sending
 * nothing at all to someone whose prices they asked about still moved.
 */
export async function openTasksByUser(
  userIds: string[]
): Promise<Map<string, string[]>> {
  const byUser = new Map<string, string[]>();
  const admin = adminClient();
  if (!admin || userIds.length === 0) return byUser;

  const { data, error } = await admin
    .from("tasks")
    .select("user_id, title")
    .in("user_id", userIds)
    .neq("status", "completed")
    .order("created_at", { ascending: true });

  if (error) {
    console.error("[push] could not read open tasks:", error.message);
    return byUser;
  }

  for (const task of data ?? []) {
    const titles = byUser.get(task.user_id) ?? [];
    titles.push(task.title);
    byUser.set(task.user_id, titles);
  }

  return byUser;
}
