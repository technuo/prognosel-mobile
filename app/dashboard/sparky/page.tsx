"use client";

import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import NavHeader from "@/components/layout/nav-header";
import { useLanguage } from "@/hooks/use-language";
import { useZone } from "@/hooks/use-zone";
import { useCurrentPrice } from "@/hooks/use-current-price";
import { useChatHistory } from "@/hooks/use-chat-history";
import { useTasks } from "@/hooks/use-tasks";
import { track } from "@/lib/analytics";
import { Send } from "lucide-react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

interface Suggestion {
  kind?: string;
  title: string;
  window?: string;
  savings: number;
}

/** Short affirmations that confirm a pending suggestion without calling the AI. */
const AFFIRM =
  /^(ja|japp|ja tack|ja, tack|yes|yep|yeah|ok|okej|visst|absolut|gärna|lägg till|add it|add|sure|tack)[!.\s]*$/i;

// Greeting & quick questions are localized inside the component (see below).

export default function SparkyPage() {
  const { t, lang } = useLanguage();
  const { zone } = useZone();
  const { price: currentPrice, loading: priceLoading } = useCurrentPrice(zone);
  const { messages: historyMessages, loaded: historyLoaded, appendMessage } = useChatHistory();
  const { addTask } = useTasks(zone);

  const [pending, setPending] = useState<Suggestion | null>(null);

  const greeting = useMemo<Message>(
    () => ({ id: "greeting", role: "assistant", content: t.sparkyGreeting }),
    [t]
  );
  const quickQuestions = [t.qWasher, t.qEvTonight, t.qPriceSpike, t.qWeeklySavings];

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Combine greeting + persisted history
  const messages = useMemo(
    () => (historyLoaded && historyMessages.length > 0 ? historyMessages : [greeting]),
    [historyLoaded, historyMessages, greeting]
  );

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const confirmSuggestion = useCallback(
    async (s: Suggestion) => {
      addTask(s.title, s.savings);
      setPending(null);
      void track("suggestion_added_to_tasks", {
        zone,
        title: s.title,
        savings: s.savings,
      });
      await appendMessage({
        id: `${Date.now()}-confirmed`,
        role: "assistant",
        content:
          lang === "sv"
            ? `Klart! Jag har lagt till "${s.title}" i dina uppgifter ✅`
            : `Done! I added "${s.title}" to your tasks ✅`,
      });
    },
    [addTask, appendMessage, lang, zone]
  );

  const dismissSuggestion = useCallback(() => {
    setPending(null);
    void track("suggestion_dismissed", { zone });
  }, [zone]);

  const handleSend = async (text: string) => {
    if (!text.trim() || loading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: text,
    };

    // A short "ja/yes" confirms the pending suggestion — no AI round-trip.
    if (pending && AFFIRM.test(text.trim())) {
      await appendMessage(userMsg);
      setInput("");
      await confirmSuggestion(pending);
      return;
    }

    await appendMessage(userMsg);
    setInput("");
    setPending(null);
    setLoading(true);
    void track("sparky_ask", { zone });

    try {
      const res = await fetch("/api/chat/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          zone,
          lang,
          currentPrice: currentPrice ?? undefined,
        }),
      });

      const data = await res.json();

      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.response || t.sparkyFail,
      };

      await appendMessage(aiMsg);

      if (data.suggestion) {
        setPending(data.suggestion as Suggestion);
        void track("suggestion_shown", { zone, kind: data.suggestion.kind });
      }
    } catch (e) {
      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: t.sparkyErr,
      };
      await appendMessage(aiMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col animate-fade-in">
      <NavHeader title="Sparky" zone={zone} />

      {/* Messages */}
      <div className="flex-1 overflow-auto px-5 pt-2 pb-4">
        <div className="flex flex-col gap-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                  msg.role === "user"
                    ? "bg-accent text-white rounded-br-md"
                    : "bg-card border border-line text-ink-2 rounded-bl-md"
                }`}
              >
                <p className="text-sm leading-relaxed whitespace-pre-line">{msg.content}</p>
              </div>
            </div>
          ))}
          {pending && !loading && (
            <div className="flex justify-start">
              <div className="max-w-[85%] bg-accent-soft/40 border border-accent/30 rounded-2xl px-4 py-3">
                <p className="text-[13px] text-ink font-medium mb-1">
                  {lang === "sv"
                    ? "Vill du att jag lägger till detta i dina uppgifter?"
                    : "Should I add this to your tasks?"}
                </p>
                <p className="text-xs text-muted mb-2.5">
                  {pending.title}
                  {pending.savings > 0 ? ` · ~${pending.savings} kr` : ""}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => void confirmSuggestion(pending)}
                    className="px-3 py-1.5 rounded-full bg-accent text-white text-xs font-semibold cursor-pointer"
                  >
                    {lang === "sv" ? "Ja, lägg till" : "Yes, add it"}
                  </button>
                  <button
                    onClick={dismissSuggestion}
                    className="px-3 py-1.5 rounded-full bg-paper-2 border border-line text-xs text-ink-2 font-medium cursor-pointer"
                  >
                    {lang === "sv" ? "Nej tack" : "No thanks"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {loading && (
            <div className="flex justify-start">
              <div className="bg-card border border-line rounded-2xl rounded-bl-md px-4 py-3">
                <div className="flex gap-1">
                  <div className="w-2 h-2 rounded-full bg-muted animate-bounce" style={{ animationDelay: "0ms" }} />
                  <div className="w-2 h-2 rounded-full bg-muted animate-bounce" style={{ animationDelay: "150ms" }} />
                  <div className="w-2 h-2 rounded-full bg-muted animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Quick Questions */}
      {messages.length <= 2 && (
        <div className="px-5 pb-3">
          <p className="text-[11px] font-mono text-muted uppercase tracking-wider mb-2">
            {t.quickQuestions}
          </p>
          <div className="flex flex-wrap gap-2">
            {quickQuestions.map((q, i) => (
              <button
                key={i}
                onClick={() => handleSend(q)}
                className="px-3 py-1.5 rounded-full bg-paper-2 border border-line text-xs text-ink-2 font-medium hover:border-line-hi transition-colors"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="px-4 py-3 bg-white/80 backdrop-blur-xl border-t border-line">
        <div className="flex items-center gap-2 bg-paper rounded-full px-4 py-2 border border-line">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend(input)}
            placeholder={t.askSparky}
            className="flex-1 bg-transparent text-sm text-ink outline-none placeholder:text-faint"
          />
          <button
            onClick={() => handleSend(input)}
            disabled={loading || !input.trim() || priceLoading}
            className="w-8 h-8 rounded-full bg-accent flex items-center justify-center text-white disabled:opacity-40 transition-opacity"
          >
            <Send size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
