import test from "node:test";
import assert from "node:assert/strict";

import { claimKey, maySendUnguardedDigest } from "./claims.ts";

test("a retried run on the same morning is the same claim, so only one sends", () => {
  assert.equal(
    claimKey("morning_digest", "2026-10-07"),
    claimKey("morning_digest", "2026-10-07")
  );
});

test("tomorrow is a claim of its own, so the digest is not spent once and for all", () => {
  assert.notEqual(
    claimKey("morning_digest", "2026-10-07"),
    claimKey("morning_digest", "2026-10-08")
  );
});

test("the daily and the weekly claim never collide on the same day", () => {
  assert.notEqual(
    claimKey("morning_digest", "2026-10-04"),
    claimKey("weekly_summary", "2026-10-04")
  );
});

// The unguarded path has no memory, so on an hourly schedule it would fire on
// every morning run unless something bounds it. These are the bounds.

test("an unguarded digest goes out in exactly one of the morning's hours", () => {
  const morningHours = [5, 6, 7, 8, 9, 10, 11];
  const allowed = morningHours.filter((hour) =>
    maySendUnguardedDigest(hour, 5)
  );

  assert.deepEqual(allowed, [5]);
});

test("an unguarded digest never goes out outside the morning", () => {
  for (const hour of [0, 4, 12, 13, 18, 23]) {
    assert.equal(maySendUnguardedDigest(hour, 5), false, `hour ${hour}`);
  }
});

test("the bound follows the start of the morning, not a hardcoded hour", () => {
  assert.equal(maySendUnguardedDigest(4, 4), true);
  assert.equal(maySendUnguardedDigest(5, 4), false);
});
