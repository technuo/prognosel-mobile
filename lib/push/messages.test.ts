import test from "node:test";
import assert from "node:assert/strict";

import { windowAlert } from "./messages.ts";

const window = { start: "01:00", end: "04:00", avg: 51.4 };

test("a price-only user gets the copy this alert has always sent", () => {
  assert.deepEqual(
    windowAlert({ ...window, timely: true, wantsPrice: true, openTasks: [] }),
    {
      title: "Billigaste timmarna börjar snart",
      body:
        "Elen är som billigast 01:00–04:00 (snitt 51 öre/kWh)." +
        " Bra läge för diskmaskinen eller laddning.",
    }
  );

  assert.deepEqual(
    windowAlert({ ...window, timely: false, wantsPrice: true, openTasks: [] }),
    {
      title: "Dagens billigaste timmar",
      body: "Idag är elen billigast 01:00–04:00, snitt 51 öre/kWh.",
    }
  );
});

test("a task reminder names a task instead of the generic nudge", () => {
  const alert = windowAlert({
    ...window,
    timely: true,
    wantsPrice: true,
    openTasks: ["Kör diskmaskinen", "Ladda bilen"],
  });

  assert.equal(
    alert?.body,
    "Elen är som billigast 01:00–04:00 (snitt 51 öre/kWh)." +
      ' Du har 2 öppna uppgifter kvar – till exempel "Kör diskmaskinen".'
  );
  // One message per window, however many switches are on.
  assert.doesNotMatch(alert!.body, /diskmaskinen eller laddning/);
});

test("Swedish singular: one task reads as en öppen uppgift", () => {
  const alert = windowAlert({
    ...window,
    timely: true,
    wantsPrice: false,
    openTasks: ["Kör diskmaskinen"],
  });

  assert.equal(alert?.title, "Dags för uppgifterna");
  assert.equal(
    alert?.body,
    'Du har 1 öppen uppgift kvar – till exempel "Kör diskmaskinen".'
  );
});

test("the morning digest counts tasks without naming one", () => {
  const alert = windowAlert({
    ...window,
    timely: false,
    wantsPrice: true,
    openTasks: ["Kör diskmaskinen", "Ladda bilen", "Tvätta"],
  });

  assert.equal(
    alert?.body,
    "Idag är elen billigast 01:00–04:00, snitt 51 öre/kWh." +
      " 3 öppna uppgifter väntar på dig i listan."
  );
});

// The reason this function returns null: switching "Påminnelser" on must not
// quietly re-subscribe someone to the price alerts they never asked for.
test("nothing to remind about means no notification at all", () => {
  assert.equal(
    windowAlert({ ...window, timely: true, wantsPrice: false, openTasks: [] }),
    null
  );
  assert.equal(
    windowAlert({ ...window, timely: false, wantsPrice: false, openTasks: [] }),
    null
  );
});
