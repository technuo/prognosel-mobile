import test from "node:test";
import assert from "node:assert/strict";

import { claimKey } from "./claims.ts";

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
