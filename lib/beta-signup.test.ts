import test from "node:test";
import assert from "node:assert/strict";

import { looksLikeSpam, normaliseEmail } from "./beta-signup.ts";

test("addresses are trimmed and lower-cased, so one person is one row", () => {
  assert.equal(normaliseEmail("  Nuo.Jin@Example.COM "), "nuo.jin@example.com");
  assert.equal(normaliseEmail("a@b.se"), "a@b.se");
});

test("obvious non-addresses are rejected", () => {
  for (const input of [
    "",
    "   ",
    "nuo",
    "nuo@",
    "@example.com",
    "nuo@example",
    "nuo jin@example.com",
    "nuo@example .com",
    null,
    undefined,
    42,
    ["a@b.se"],
  ]) {
    assert.equal(normaliseEmail(input), null, `should reject ${JSON.stringify(input)}`);
  }
});

test("an address longer than the RFC limit is rejected", () => {
  const long = `${"a".repeat(250)}@example.com`;
  assert.equal(normaliseEmail(long), null);
});

test("a filled honeypot is spam, an untouched one is not", () => {
  assert.equal(looksLikeSpam(""), false);
  assert.equal(looksLikeSpam("   "), false);
  assert.equal(looksLikeSpam(undefined), false);
  assert.equal(looksLikeSpam("http://cheap-pills.example"), true);
});
