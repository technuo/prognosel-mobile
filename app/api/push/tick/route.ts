import { NextRequest, NextResponse } from "next/server";

import { fetchTodayHourly } from "@/lib/api/today";
import { adminClient, recipientsFor } from "@/lib/push/audience";
import { sendPush, type PushMessage } from "@/lib/push/expo";
import { bestContiguousWindow, hourLabel } from "@/lib/windows";
import type { ZoneCode } from "@/types";

/**
 * The push scheduler.
 *
 * One endpoint rather than three, because what should be sent depends on when
 * it runs — and keeping that decision here means the schedule can change
 * without touching the sending logic.
 *
 *   every run        cheapest-window alert, but only when that window is about
 *                    to start (so it stays silent on an hourly schedule)
 *   07:00 Stockholm  morning digest: today's cheapest window
 *   Sun 18:00        weekly summary of completed tasks and savings
 *
 * Vercel's free plan allows only a daily cron, so the default schedule is the
 * morning digest. Pointing an hourly scheduler (Supabase pg_cron, or a GitHub
 * Actions workflow) at the same URL turns on the timely alerts as well; the
 * route already handles them.
 */

const ZONES: ZoneCode[] = ["SE1", "SE2", "SE3", "SE4"];
const WINDOW_HOURS = 3;
/** Matches the channel the app creates, or Android shows nothing. */
const CHANNEL_ID = "prognosel-alerts";

function stockholm(date: Date) {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/Stockholm",
    hour: "2-digit",
    minute: "2-digit",
    weekday: "short",
  }).formatToParts(date);

  const read = (type: string) =>
    parts.find((part) => part.type === type)?.value ?? "";

  return {
    hour: Number(read("hour")),
    minute: Number(read("minute")),
    weekday: read("weekday"),
  };
}

export async function GET(request: NextRequest) {
  // Vercel adds this header automatically when CRON_SECRET is set.
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return NextResponse.json(
      { error: "CRON_SECRET is not configured" },
      { status: 503 }
    );
  }
  if (request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!adminClient()) {
    return NextResponse.json(
      { error: "SUPABASE_SERVICE_ROLE_KEY is not configured" },
      { status: 503 }
    );
  }

  const now = new Date();
  const { hour, minute, weekday } = stockholm(now);
  const actions: string[] = [];

  // ── cheapest window, either "starting soon" or the morning digest ─────────
  const startingSoon = hourLabel((hour + 1) % 24);
  const isMorningDigest = hour === 7 && minute < 60;

  const recipients = await recipientsFor("notify_tips");
  if (recipients.length > 0) {
    const byZone = new Map<ZoneCode, string[]>();
    for (const recipient of recipients) {
      byZone.set(recipient.zone, [
        ...(byZone.get(recipient.zone) ?? []),
        ...recipient.tokens,
      ]);
    }

    const messages: PushMessage[] = [];

    for (const zone of ZONES) {
      const tokens = byZone.get(zone);
      if (!tokens || tokens.length === 0) continue;

      const hours = await fetchTodayHourly(zone);
      if (!hours || hours.length === 0) continue;

      const window = bestContiguousWindow(hours, WINDOW_HOURS);
      if (!window) continue;

      // On an hourly schedule this only fires when the window is next; on the
      // daily schedule it fires once in the morning and stays quiet otherwise.
      const timely = window.start === startingSoon;
      if (!timely && !isMorningDigest) continue;

      const body = timely
        ? `Elen är som billigast ${window.start}–${window.end} (snitt ${window.avg.toFixed(0)} öre/kWh). Bra läge för diskmaskinen eller laddning.`
        : `Idag är elen billigast ${window.start}–${window.end}, snitt ${window.avg.toFixed(0)} öre/kWh.`;

      for (const token of tokens) {
        messages.push({
          to: token,
          title: timely ? "Billigaste timmarna börjar snart" : "Dagens billigaste timmar",
          body,
          channelId: CHANNEL_ID,
          data: { kind: "price-window", zone, start: window.start, end: window.end },
        });
      }
    }

    if (messages.length > 0) {
      const outcome = await sendPush(messages);
      actions.push(`price: sent ${outcome.sent}, failed ${outcome.failed}`);
    }
  }

  // ── weekly summary, Sunday evening in Stockholm ───────────────────────────
  if (weekday === "Sun" && hour === 18) {
    const weekly = await recipientsFor("notify_weekly");
    if (weekly.length > 0) {
      const admin = adminClient()!;
      const since = new Date(now.getTime() - 7 * 86_400_000).toISOString();
      const messages: PushMessage[] = [];

      for (const recipient of weekly) {
        const { data: tasks } = await admin
          .from("tasks")
          .select("estimated_savings")
          .eq("user_id", recipient.userId)
          .eq("status", "completed")
          .gte("completed_at", since);

        const completed = tasks?.length ?? 0;
        if (completed === 0) continue;

        const saved = (tasks ?? []).reduce(
          (sum, task) => sum + (task.estimated_savings ?? 0),
          0
        );

        for (const token of recipient.tokens) {
          messages.push({
            to: token,
            title: "Din vecka i PrognosEL",
            body: `Du klarade ${completed} ${completed === 1 ? "uppgift" : "uppgifter"} och sparade cirka ${saved.toFixed(0)} kr.`,
            channelId: CHANNEL_ID,
            data: { kind: "weekly-summary" },
          });
        }
      }

      if (messages.length > 0) {
        const outcome = await sendPush(messages);
        actions.push(`weekly: sent ${outcome.sent}, failed ${outcome.failed}`);
      }
    }
  }

  return NextResponse.json({
    ok: true,
    stockholm: `${weekday} ${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`,
    actions,
  });
}
