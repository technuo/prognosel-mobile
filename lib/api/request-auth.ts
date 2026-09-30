import { type User } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";
import type { NextRequest } from "next/server";

/**
 * Identify the caller of an API route.
 *
 * Two transports have to work:
 *   - the web dashboard, which authenticates with a session cookie;
 *   - the Android app, which has no cookie jar and sends the access token as
 *     `Authorization: Bearer <token>` instead.
 *
 * The client is read-only on purpose: no route in this project writes cookies,
 * and letting them attempt it would only produce noise in Server Components.
 */

function createClientFromRequest(request: NextRequest) {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder",
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: () => {
          // No session writes happen in these routes.
        },
      },
    }
  );
}

/** Access token from an `Authorization: Bearer <token>` header, if present. */
export function bearerToken(request: NextRequest): string | null {
  const header = request.headers.get("authorization");
  if (!header) return null;
  const [scheme, token] = header.split(" ");
  if (!token || scheme.toLowerCase() !== "bearer") return null;
  return token.trim() || null;
}

export interface RequestUser {
  user: User | null;
  /** Populated when Supabase rejected the credential (as opposed to none given). */
  error: string | null;
}

export async function userFromRequest(
  request: NextRequest
): Promise<RequestUser> {
  const supabase = createClientFromRequest(request);
  const token = bearerToken(request);

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser(token ?? undefined);

  return { user, error: error?.message ?? null };
}
