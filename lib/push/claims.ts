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
