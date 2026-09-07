"use client";

import { supabase } from "./supabase/client";

type TrackProps = Record<string, unknown>;

/**
 * Fire-and-forget product event tracking into the local Supabase `events`
 * table. Only authenticated events are recorded (no third-party trackers,
 * no anonymous tracking — GDPR consent friendly).
 *
 * Usage: `void track("task_completed", { zone: "SE3", task: "..." })`
 */
export async function track(event: string, props: TrackProps = {}): Promise<void> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.from("events").insert({
      event,
      user_id: user.id,
      meta: props as Record<string, unknown> | null,
    });
  } catch (error) {
    // Analytics must never break the user journey.
    console.warn("[track] failed to record event:", event, error);
  }
}
