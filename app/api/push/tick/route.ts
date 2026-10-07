import { NextRequest, NextResponse } from "next/server";

import { fetchTodayHourly } from "@/lib/api/today";
import {
  adminClient,
  openTasksByUser,
  recipientsFor,
  type Recipient,
} from "@/lib/push/audience";
import { sendPush, type PushMessage } from "@/lib/push/expo";
import { windowAlert } from "@/lib/push/messages";
import { stockholmDateKey } from "@/lib/streak";
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
 *                    to start, so an hourly schedule stays quiet until it is. For
 *                    someone who also turned on "Påminnelser" the same alert
 *                    names a task they still have open, so the two switches
 *                    never produce two notifications about one window.
 *   first morning run  digest: today's cheapest window, and how many tasks are
 *                    still waiting. Not "the 07:00 run": the scheduler promises
 *                    hour precision at best, and a digest that silently depends on
 *                    landing inside one specific hour is a digest that silently
 *                    does not arrive. It is claimed once per day instead.
 *   first Sunday run  weekly summary of completed tasks and savings
 *
 * Both the daily and the weekly message claim a slot in `push_state` before they
 * send, which is what bounds them when the schedule is coarse — or when an hourly
 * scheduler is pointed at this same URL later. Every run also writes what it did
 * to `push_state` under `last_run`, so a silent morning can be told apart from a
 * schedule that never fired.
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

/**
 * How a one-shot claim turned out.
 *
 *   claimed  this run took the slot, so it is the one that sends
 *   taken    another run already took it; stay quiet
 *   no-guard the claim could not be made at all — see below
 */
type Claim = "claimed" | "taken" | "no-guard";

/**
 * Claims a one-shot slot.
 *
 * The insert is the claim: `push_state.key` is the primary key, so a duplicate-key
 * error means another invocation already sent this. That is what makes "the first
 * run in the morning" mean at most one digest per day even though the platform
 * decides *when* that run happens, and it also absorbs a retried invocation.
 *
 * A missing table (Postgres 42P01 — the migration has not been applied) returns
 * `no-guard` and the caller sends anyway. Degrading to the daily schedule, which
 * already runs once, still produces one digest a day; staying silent would make a
 * forgotten migration look exactly like a scheduler that never fired, which is
 * the bug this whole change exists to remove. The caller labels the outcome so it
 * shows up in `actions` and in the `last_run` row.
 */
async function claimOnce(key: string, value: string): Promise<Claim> {
  const admin = adminClient();
  if (!admin) return "no-guard";

  const { error } = await admin.from("push_state").insert({ key, value });
  if (!error) return "claimed";
  if (error.code === "23505") return "taken";

  console.error(`[push] could not claim ${key}: ${error.code} ${error.message}`);
  return "no-guard";
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
  // "Morning", not "the 07 hour". The scheduler only promises hour precision, so
  // testing for an exact hour turns a late invocation into a silent no-op —
  // indistinguishable from "there was nothing to send". claimOnce below is what
  // keeps the digest to one a day.
  const isMorning = hour >= 5 && hour < 12;

  const recipients = await recipientsFor("notify_tips", "notify_tasks");
  if (recipients.length > 0) {
    // Only the users who asked for reminders need their task list read.
    const openTasks = await openTasksByUser(
      recipients
        .filter((recipient) => recipient.prefs.notify_tasks)
        .map((recipient) => recipient.userId)
    );

    const byZone = new Map<ZoneCode, Recipient[]>();
    for (const recipient of recipients) {
      byZone.set(recipient.zone, [
        ...(byZone.get(recipient.zone) ?? []),
        recipient,
      ]);
    }

    // Split rather than one list: they are sent under different rules. "The window
    // starts next hour" is only true right now, so it goes out immediately; the
    // digest is claimed once per day first.
    const timelyMessages: PushMessage[] = [];
    const digestMessages: PushMessage[] = [];

    for (const zone of ZONES) {
      const zoneRecipients = byZone.get(zone);
      if (!zoneRecipients || zoneRecipients.length === 0) continue;

      const hours = await fetchTodayHourly(zone);
      if (!hours || hours.length === 0) continue;

      // Only the hours still ahead. The feed carries the whole of today, past
      // included, so searching all of it can name a window that has already
      // run — and because the day's cheapest window is often an early-morning
      // one, `startingSoon` below would rarely have anything left to match.
      const ahead = hours.filter((point) => point.hour >= hourLabel(hour));
      const window = bestContiguousWindow(ahead, WINDOW_HOURS);
      if (!window) continue;

      // On an hourly schedule this only fires when the window is next; on the
      // daily schedule it fires once in the morning and stays quiet otherwise.
      const timely = window.start === startingSoon;
      if (!timely && !isMorning) continue;
      const target = timely ? timelyMessages : digestMessages;

      for (const recipient of zoneRecipients) {
        const copy = windowAlert({
          timely,
          start: window.start,
          end: window.end,
          avg: window.avg,
          wantsPrice: recipient.prefs.notify_tips,
          openTasks: openTasks.get(recipient.userId) ?? [],
        });
        // Null for someone who only wants reminders and has nothing left to do.
        if (!copy) continue;

        for (const token of recipient.tokens) {
          target.push({
            to: token,
            title: copy.title,
            body: copy.body,
            channelId: CHANNEL_ID,
            data: {
              kind: recipient.prefs.notify_tips ? "price-window" : "task-reminder",
              zone,
              start: window.start,
              end: window.end,
            },
          });
        }
      }
    }

    if (timelyMessages.length > 0) {
      const outcome = await sendPush(timelyMessages);
      actions.push(`window: sent ${outcome.sent}, failed ${outcome.failed}`);
    }

    if (digestMessages.length > 0) {
      const claim = await claimOnce("morning_digest", stockholmDateKey(now));
      if (claim === "taken") {
        actions.push("digest: already sent today, skipped");
      } else {
        const outcome = await sendPush(digestMessages);
        actions.push(
          `digest: sent ${outcome.sent}, failed ${outcome.failed}` +
            (claim === "no-guard" ? " (unguarded — apply the push_state migration)" : "")
        );
      }
    }
  }

  // ── weekly summary, Sunday ────────────────────────────────────────────────
  //
  // This used to require `hour === 18`, which the daily 05:00 UTC schedule can
  // never satisfy — so it never ran at all. It now goes out with the first Sunday
  // run, and the claim keeps it to one a week if an hourly scheduler is added.
  if (weekday === "Sun") {
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
        const claim = await claimOnce("weekly_summary", stockholmDateKey(now));
        if (claim === "taken") {
          actions.push("weekly: already sent this week, skipped");
        } else {
          const outcome = await sendPush(messages);
          actions.push(
            `weekly: sent ${outcome.sent}, failed ${outcome.failed}` +
              (claim === "no-guard" ? " (unguarded — apply the push_state migration)" : "")
          );
        }
      }
    }
  }

  const summary = {
    ok: true,
    stockholm: `${weekday} ${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`,
    // Counts, so a manual run says whether the audience was found at all
    // rather than leaving an empty `actions` to be interpreted.
    audience: {
      recipients: recipients.length,
      devices: recipients.reduce(
        (total, recipient) => total + recipient.tokens.length,
        0
      ),
    },
    actions,
  };

  // A record of the last run, kept in the app's own database so that "did the
  // scheduler even fire?" is one SQL query instead of a trip to the dashboard's
  // log viewer — the question this endpoint just cost a morning to answer.
  // Writing it is best-effort: a missing table or a failed write never fails a run
  // that has already sent, or should have.
  const recorder = adminClient();
  if (recorder) {
    const stamp = `${stockholmDateKey(now)} ${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
    await recorder
      .from("push_state")
      .upsert(
        { key: "last_run", value: `${stamp} | ${actions.join(" | ") || "no action"}` },
        { onConflict: "key" }
      );
  }

  return NextResponse.json(summary);
}
