/** The notifications that claim a slot before they send. */
export type ClaimJob = "morning_digest" | "weekly_summary" | "window_alert";

/**
 * The key a one-shot notification claims before it sends.
 *
 * `push_state.key` is the primary key and the insert is the claim, so the key has
 * to name the *period* being claimed — `morning_digest:2026-10-07`, not
 * `morning_digest`. A key that names only the job is claimed on the first run and
 * collides forever after, which is a digest that arrives exactly once and then
 * never again: the failure looks identical to the outage it was meant to fix.
 *
 * Kept as a function rather than written inline at each call site because getting
 * it wrong is silent, and a test is the only place that shows up before the
 * morning it matters.
 */
export function claimKey(job: ClaimJob, stockholmDate: string): string {
  return `${job}:${stockholmDate}`;
}

/**
 * How many minutes into an hour an unguarded send is still allowed.
 *
 * Five, because the tightest schedule seen in practice runs every five minutes:
 * the first run of the hour is the only one inside the window. A tighter bound
 * (minute 0 alone) would break a schedule that fires at :50; this one is the
 * loosest bound that still cannot fire more than once for any schedule with
 * five-minute granularity or coarser.
 */
export const UNGUARDED_MINUTES = 5;

/**
 * Whether a message whose claim could not be made may still be sent.
 *
 * The unguarded path exists so that an unreadable `push_state` cannot silence a
 * notification — that silence is the bug all of this was written to remove. But
 * it has no memory, and every notification here is true for a whole span of
 * time rather than an instant: the morning digest for every run all morning,
 * the "window starts soon" alert for every run in the hour before the window.
 * On a five-minute schedule that is twelve sends where the user expects one.
 *
 * So an unguarded send is confined to the first `UNGUARDED_MINUTES` of the hour
 * it is allowed in. Any schedule that can reach that hour at all reaches the
 * start of it, so one message still goes out and `actions` still reports that it
 * went unguarded.
 *
 * The trade-off is explicit: a missing `push_state` *and* no run in those first
 * minutes means no message at all — which is why the claim is the real fix and
 * this is only the floor under it.
 */
export function maySendUnguarded(
  hour: number,
  minute: number,
  allowedHour: number
): boolean {
  return hour === allowedHour && minute < UNGUARDED_MINUTES;
}
