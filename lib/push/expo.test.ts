import test from "node:test";
import assert from "node:assert/strict";

import { expoPayload } from "./expo.ts";

const base = {
  to: "ExponentPushToken[example]",
  title: "Dagens billigaste timmar",
  body: "Elen är som billigast 01:00–04:00.",
};

test("priority is high by default, so a dozing phone is woken", () => {
  assert.equal(expoPayload(base).priority, "high");
});

test("an explicit priority still wins", () => {
  assert.equal(expoPayload({ ...base, priority: "normal" }).priority, "normal");
});

test("the channel travels with the message, or Android shows nothing", () => {
  const payload = expoPayload({ ...base, channelId: "prognosel-alerts" });

  assert.equal(payload.channelId, "prognosel-alerts");
});

test("absent optional fields are left out rather than sent as undefined", () => {
  const payload = expoPayload(base);

  assert.equal(payload.channelId, undefined);
  assert.equal(payload.data, undefined);
  assert.equal("channelId" in payload, false);
});
