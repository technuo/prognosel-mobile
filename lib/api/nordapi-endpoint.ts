import type { ZoneCode } from "@/types";

export const NORDAPI_BASE = "https://nordapi.ee/api/v1";

export type NordapiEndpoint = "current" | "today" | "history";

export interface NordapiRange {
  startDate?: string;
  endDate?: string;
}

/**
 * Resolve where a NordAPI request goes.
 *
 * Browser: same-origin `/api/nordapi` proxy (upstream sends no CORS headers).
 * Server:  straight to NordAPI.
 *
 * The server branch used to be built from NEXT_PUBLIC_API_URL, which is the
 * FastAPI backend — it has no /api/nordapi route, so the self-proxy 404'd on
 * every request and the "primary, no cold start" price source never ran.
 * Falling back to VERCEL_URL wouldn't have worked either: deployment URLs sit
 * behind Vercel Authentication, so the function would fetch its own login page.
 * Server code calls NordAPI directly; no hop through our own HTTP surface.
 */
export function nordapiUrl(
  endpoint: NordapiEndpoint,
  zone: ZoneCode,
  range: NordapiRange = {},
  server: boolean = typeof window === "undefined"
): string {
  if (!server) {
    // Trailing slash matches next.config's `trailingSlash: true`, so the proxy
    // answers directly instead of 308-redirecting on every call.
    const params = new URLSearchParams({ endpoint, zone });
    if (range.startDate) params.set("start_date", range.startDate);
    if (range.endDate) params.set("end_date", range.endDate);
    return `/api/nordapi/?${params.toString()}`;
  }

  const url = `${NORDAPI_BASE}/electricity/${endpoint}/${zone}`;
  if (endpoint !== "history") return url;

  const params = new URLSearchParams();
  if (range.startDate) params.set("start_date", range.startDate);
  if (range.endDate) params.set("end_date", range.endDate);
  const query = params.toString();
  return query ? `${url}?${query}` : url;
}
