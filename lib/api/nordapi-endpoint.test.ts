import test from "node:test";
import assert from "node:assert/strict";
import { nordapiUrl, NORDAPI_BASE } from "./nordapi-endpoint.ts";

const ZONES = ["SE1", "SE2", "SE3", "SE4"] as const;

test("server hits NordAPI directly for every zone", () => {
  for (const zone of ZONES) {
    assert.equal(
      nordapiUrl("current", zone, {}, true),
      `${NORDAPI_BASE}/electricity/current/${zone}`
    );
    assert.equal(
      nordapiUrl("today", zone, {}, true),
      `${NORDAPI_BASE}/electricity/today/${zone}`
    );
  }
});

// This is the regression that took the landing page down: the server built its
// "own" proxy URL on NEXT_PUBLIC_API_URL, which is the FastAPI backend and has
// no /api/nordapi route, so the primary price source 404'd on every request.
test("server URL never points at the backend or localhost", () => {
  const url = nordapiUrl("current", "SE1", {}, true);
  assert.doesNotMatch(url, /onrender\.com/);
  assert.doesNotMatch(url, /localhost/);
  assert.doesNotMatch(url, /prognosel-api/);
});

test("browser uses the same-origin proxy, with trailing slash to avoid a 308 hop", () => {
  assert.equal(
    nordapiUrl("current", "SE3", {}, false),
    "/api/nordapi/?endpoint=current&zone=SE3"
  );
  assert.equal(
    nordapiUrl("today", "SE4", {}, false),
    "/api/nordapi/?endpoint=today&zone=SE4"
  );
});

test("history carries the date range in both modes", () => {
  const range = { startDate: "2026-09-21", endDate: "2026-09-27" };

  assert.equal(
    nordapiUrl("history", "SE4", range, true),
    `${NORDAPI_BASE}/electricity/history/SE4?start_date=2026-09-21&end_date=2026-09-27`
  );
  assert.equal(
    nordapiUrl("history", "SE4", range, false),
    "/api/nordapi/?endpoint=history&zone=SE4&start_date=2026-09-21&end_date=2026-09-27"
  );
});

test("history omits the query string when no range is given", () => {
  assert.equal(
    nordapiUrl("history", "SE1", {}, true),
    `${NORDAPI_BASE}/electricity/history/SE1`
  );
});
