"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/lib/supabase/client";

const CHAT_STORAGE_KEY = "prognosel-chat-messages";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
}

function loadLocalMessages(): ChatMessage[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(CHAT_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalMessages(messages: ChatMessage[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(messages));
}

function removeLocalMessages() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(CHAT_STORAGE_KEY);
}

export function useChatHistory() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const sessionIdRef = useRef<string | null>(null);

  const ensureSession = useCallback(
    async (explicitUserId?: string) => {
      const uid = explicitUserId ?? userId;
      if (!uid) return null;
      if (sessionIdRef.current) return sessionIdRef.current;

      const { data, error } = await supabase
        .from("chat_sessions")
        .insert({
          user_id: uid,
          title: "Sparky Chat",
          is_active: true,
        })
        .select("id")
        .single();

      if (error) {
        console.error("Failed to create chat session:", error);
        return null;
      }

      sessionIdRef.current = data.id;
      return data.id;
    },
    [userId]
  );

  // Load on mount
  useEffect(() => {
    let cancelled = false;

    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      const uid = user?.id ?? null;
      setUserId(uid);

      if (uid) {
        // Find most recent active session
        const { data: sessions } = await supabase
          .from("chat_sessions")
          .select("id")
          .eq("user_id", uid)
          .eq("is_active", true)
          .order("updated_at", { ascending: false })
          .limit(1);

        if (sessions && sessions.length > 0) {
          const sid = sessions[0].id;
          sessionIdRef.current = sid;

          const { data: msgs } = await supabase
            .from("chat_messages")
            .select("id, role, content, created_at")
            .eq("session_id", sid)
            .order("created_at", { ascending: true })
            .limit(50);

          const serverMessages = (msgs ?? []).map((m) => ({
            id: m.id,
            role: m.role as "user" | "assistant",
            content: m.content,
          }));

          if (serverMessages.length === 0) {
            // One-time migration: chat that only ever existed in localStorage
            // (before signing in) is imported into the account, then cleared.
            const local = loadLocalMessages();
            if (local.length > 0) {
              await supabase.from("chat_messages").insert(
                local.map((m) => ({
                  session_id: sid,
                  role: m.role,
                  content: m.content,
                  source: "sparky",
                }))
              );
              removeLocalMessages();
              if (!cancelled) setMessages(local);
            }
          } else if (!cancelled) {
            setMessages(serverMessages);
          }
        } else {
          // No active session yet — import any local history, else stay empty
          sessionIdRef.current = null;
          const local = loadLocalMessages();
          if (local.length > 0) {
            const sid = await ensureSession(uid);
            if (sid) {
              await supabase.from("chat_messages").insert(
                local.map((m) => ({
                  session_id: sid,
                  role: m.role,
                  content: m.content,
                  source: "sparky",
                }))
              );
              removeLocalMessages();
              if (!cancelled) setMessages(local);
            }
          }
        }
      } else {
        // Not signed in: localStorage only
        setMessages(loadLocalMessages());
      }

      if (!cancelled) setLoaded(true);
    }

    load();
    return () => { cancelled = true; };
  }, [ensureSession]);

  const appendMessage = useCallback(
    async (msg: ChatMessage) => {
      setMessages((prev) => [...prev, msg]);

      if (userId) {
        const sid = await ensureSession();
        if (sid) {
          await supabase.from("chat_messages").insert({
            session_id: sid,
            role: msg.role,
            content: msg.content,
            source: "sparky",
          });
        }
      } else {
        const updated = [...messages, msg];
        saveLocalMessages(updated);
      }
    },
    [userId, messages, ensureSession]
  );

  const clearHistory = useCallback(async () => {
    setMessages([]);

    if (userId) {
      const sid = sessionIdRef.current;
      if (sid) {
        await supabase.from("chat_sessions").update({ is_active: false }).eq("id", sid);
        sessionIdRef.current = null;
      }
    }

    if (typeof window !== "undefined") {
      localStorage.removeItem(CHAT_STORAGE_KEY);
    }
  }, [userId]);

  return { messages, loaded, appendMessage, clearHistory, setMessages };
}
