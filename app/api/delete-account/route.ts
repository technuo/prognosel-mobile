import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { userFromRequest } from "@/lib/api/request-auth";

/**
 * Account deletion.
 *
 * Google Play requires an app that can create an account to also offer a way to
 * delete it — reachable both from inside the app and from a public web page.
 * This route is what both paths call.
 *
 * Two design decisions worth keeping:
 *
 * 1. Dependent rows are deleted explicitly, in foreign-key order, rather than
 *    relying on `on delete cascade`. The tables were created in the Supabase
 *    dashboard, not by a migration in this repo, so their constraints are not
 *    visible here — and a missing cascade would make the whole operation fail
 *    with a foreign-key error at the last step.
 *
 * 2. If any table delete fails, the auth user is NOT deleted. The account is
 *    then still usable and the request can simply be retried, instead of
 *    leaving an account that exists but has lost half its data with no way back.
 *
 * Requires SUPABASE_SERVICE_ROLE_KEY. It is server-only and must never be
 * exposed as NEXT_PUBLIC_*.
 */

const CONFIRMATION_WORDS = new Set(["DELETE", "RADERA"]);

function serviceRoleClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;

  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

export async function POST(request: NextRequest) {
  // ── who is asking ──────────────────────────────────────────────────────────
  const { user, error: authError } = await userFromRequest(request);
  if (!user) {
    if (authError) console.warn("[delete-account] auth rejected:", authError);
    return NextResponse.json(
      { error: "Authentication required" },
      { status: 401 }
    );
  }

  // ── explicit confirmation ──────────────────────────────────────────────────
  // This endpoint is irreversible, so it refuses to act on a request that does
  // not carry the confirmation word. That makes an accidental replay from a
  // stale client or a mis-wired button a no-op instead of data loss.
  let body: { confirm?: unknown } = {};
  try {
    body = await request.json();
  } catch {
    // handled by the check below
  }

  const confirm = typeof body.confirm === "string" ? body.confirm.trim().toUpperCase() : "";
  if (!CONFIRMATION_WORDS.has(confirm)) {
    return NextResponse.json(
      { error: 'Confirmation required. Send {"confirm":"DELETE"}.' },
      { status: 400 }
    );
  }

  const admin = serviceRoleClient();
  if (!admin) {
    console.error(
      "[delete-account] SUPABASE_SERVICE_ROLE_KEY is not configured on the server"
    );
    return NextResponse.json(
      {
        error:
          "Account deletion is not configured on the server. Contact support.",
      },
      { status: 503 }
    );
  }

  const userId = user.id;
  const fail = (step: string, message: string) => {
    console.error(`[delete-account] ${step} failed for ${userId}:`, message);
    return NextResponse.json(
      { error: `Could not delete your data (${step}). Please try again.` },
      { status: 502 }
    );
  };

  try {
    // ── chat: messages hang off sessions, so collect the ids first ───────────
    const { data: sessions, error: sessionReadError } = await admin
      .from("chat_sessions")
      .select("id")
      .eq("user_id", userId);

    if (sessionReadError) return fail("chat sessions", sessionReadError.message);

    const sessionIds = (sessions ?? []).map((s) => s.id);
    if (sessionIds.length > 0) {
      const { error } = await admin
        .from("chat_messages")
        .delete()
        .in("session_id", sessionIds);
      if (error) return fail("chat messages", error.message);
    }

    // ── everything else owned directly by the user ───────────────────────────
    const ownedTables = [
      { table: "chat_sessions", column: "user_id", label: "chat sessions" },
      { table: "tasks", column: "user_id", label: "tasks" },
      { table: "events", column: "user_id", label: "events" },
      { table: "profiles", column: "id", label: "profile" },
    ] as const;

    for (const { table, column, label } of ownedTables) {
      const { error } = await admin.from(table).delete().eq(column, userId);
      if (error) return fail(label, error.message);
    }

    // ── finally the account itself ───────────────────────────────────────────
    const { error: deleteUserError } = await admin.auth.admin.deleteUser(userId);
    if (deleteUserError) {
      return fail("account", deleteUserError.message);
    }

    console.info(`[delete-account] deleted account ${userId}`);
    return NextResponse.json({ deleted: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`[delete-account] unexpected error for ${userId}:`, message);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
