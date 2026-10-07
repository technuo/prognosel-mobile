/** The one-shot notifications that claim a slot before they send. */
export type ClaimJob = "morning_digest" | "weekly_summary";

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
 * Whether a digest whose claim could not be made may still be sent at `hour`.
 *
 * The unguarded path exists so that an unreadable `push_state` cannot silence the
 * digest — that silence is the bug all of this was written to remove. But it has
 * no memory, so the moment the scheduler runs hourly it would send once an hour
 * for the whole morning: seven notifications where the user expected one.
 *
 * Restricting it to the morning's first hour fixes that without bringing the
 * silence back, because any schedule that can reach the morning at all reaches
 * its first hour. Exactly one digest still goes out, and `actions` still reports
 * that it went unguarded.
 *
 * The trade-off is explicit: a missing `push_state` *and* no run inside the first
 * morning hour means no digest, which is why the hourly caller matters.
 */
export function maySendUnguardedDigest(
  hour: number,
  morningStart: number
): boolean {
  return hour === morningStart;
}
