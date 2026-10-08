import test from "node:test";
import assert from "node:assert/strict";

import { claimKey, maySendUnguarded } from "./claims.ts";

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

// The unguarded path has no memory, and every message here is true for a span of
// time rather than an instant. These are the bounds that keep it to one send.

test("a five-minute schedule sends an unguarded message exactly once an hour", () => {
  const everyFiveMinutes = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];
  const allowed = everyFiveMinutes.filter((minute) =>
    maySendUnguarded(13, minute, 13)
  );

  assert.deepEqual(allowed, [0]);
});

test("an unguarded message never goes out in an hour it is not allowed in", () => {
  for (const hour of [0, 4, 12, 14, 18, 23]) {
    assert.equal(maySendUnguarded(hour, 0, 5), false, `hour ${hour}`);
  }
});

test("the digest's unguarded fallback is confined to the morning's first hour", () => {
  const morningHours = [5, 6, 7, 8, 9, 10, 11];
  const allowed = morningHours.filter((hour) => maySendUnguarded(hour, 0, 5));

  assert.deepEqual(allowed, [5]);
});

test("the bound follows the hour it is allowed in, not a hardcoded one", () => {
  assert.equal(maySendUnguarded(4, 0, 4), true);
  assert.equal(maySendUnguarded(5, 0, 4), false);
});
