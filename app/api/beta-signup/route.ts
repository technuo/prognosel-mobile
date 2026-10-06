import { NextRequest, NextResponse } from "next/server";

import { looksLikeSpam, normaliseEmail } from "@/lib/beta-signup";
import { serviceRoleClient } from "@/lib/supabase/admin";

/**
 * Signup from the landing page for the Android closed test.
 *
 * Google Play only lets people join a closed test if their Google account is on
 * our tester list, so an address collected here is a request to be added to it —
 * not a subscription, and nothing is sent to it automatically. That is also why
 * this endpoint is tolerable without a rate limiter: the worst a script can do
 * is add junk rows to a table a human reads before acting.
 *
 * The reply is identical whether the address was new or already on the list.
 * Confirming "you were already signed up" would turn this into a way to check
 * whether a given address is on the list.
 */
export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid-body" }, { status: 400 });
  }

  const { email, company } = (body ?? {}) as {
    email?: unknown;
    company?: unknown;
  };

  // Answer a filled honeypot exactly like a real signup: telling a script it was
  // caught only teaches the next one.
  if (looksLikeSpam(company)) {
    return NextResponse.json({ ok: true });
  }

  const address = normaliseEmail(email);
  if (!address) {
    return NextResponse.json({ error: "invalid-email" }, { status: 400 });
  }

  const admin = serviceRoleClient();
  if (!admin) {
    console.error("[beta-signup] SUPABASE_SERVICE_ROLE_KEY is not configured");
    return NextResponse.json({ error: "unavailable" }, { status: 503 });
  }

  const { error } = await admin
    .from("beta_signups")
    .upsert(
      { email: address, source: "landing" },
      { onConflict: "email", ignoreDuplicates: true }
    );

  if (error) {
    console.error("[beta-signup] could not store the address:", error.message);
    return NextResponse.json({ error: "failed" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
