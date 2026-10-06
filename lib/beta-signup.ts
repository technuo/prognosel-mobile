/**
 * The one piece of the beta signup that is worth testing on its own.
 *
 * Kept out of the route so the rules are plain functions: what counts as an
 * address, and how it is canonicalised before it hits the unique constraint.
 * Getting the canonical form wrong would let the same person be added twice, or
 * hide a duplicate behind a difference in capitalisation.
 */

/** Longest address the RFCs allow, and what the database should never exceed. */
const MAX_EMAIL_LENGTH = 254;

/**
 * Deliberately permissive: a stricter pattern rejects valid addresses, and the
 * only real check that matters is whether the invitation reaches them. It does
 * require one @ with something either side and no whitespace.
 */
const EMAIL_PATTERN = /^[^\s@]+@[^\s@.]+(\.[^\s@.]+)+$/;

/** Lower-cased, trimmed form, or null when this is not an address. */
export function normaliseEmail(input: unknown): string | null {
  if (typeof input !== "string") return null;
  const email = input.trim().toLowerCase();
  if (email.length === 0 || email.length > MAX_EMAIL_LENGTH) return null;
  return EMAIL_PATTERN.test(email) ? email : null;
}

/**
 * A field a person never fills in and a script usually does.
 *
 * Returns true when the submission should be treated as spam. The caller must
 * answer exactly as it would for a success — telling a bot that it was caught
 * only teaches the next one.
 */
export function looksLikeSpam(honeypot: unknown): boolean {
  return typeof honeypot === "string" && honeypot.trim().length > 0;
}
