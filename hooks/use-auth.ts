"use client";

import { useCallback } from "react";
import { supabase } from "@/lib/supabase/client";

export function useAuth() {
  const signInWithGoogle = useCallback(async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/dashboard/`,
      },
    });
  }, []);

  const signInWithGitHub = useCallback(async () => {
    await supabase.auth.signInWithOAuth({
      provider: "github",
      options: {
        redirectTo: `${window.location.origin}/dashboard/`,
      },
    });
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    window.location.href = "/login/";
  }, []);

  return { signInWithGoogle, signInWithGitHub, signOut };
}
