"use client";

import { useState, useRef, useEffect } from "react";
import NavHeader from "@/components/layout/nav-header";
import { useLanguage } from "@/hooks/use-language";
import { useZone } from "@/hooks/use-zone";
import { useCurrentPrice } from "@/hooks/use-current-price";
import { useChatHistory } from "@/hooks/use-chat-history";
import { Send } from "lucide-react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

const QUICK_QUESTIONS = [
  "Best time to run washer?",
  "EV charging tonight?",
  "Price spike tomorrow?",
  "Weekly savings?",
];

const GREETING: Message = {
  id: "greeting",
  role: "assistant",
  content: "Hi! I'm Sparky. Ask me anything about electricity prices and savings.",
};

export default function SparkyPage() {
  const { t } = useLanguage();
  const { zone } = useZone();
  const { price: currentPrice, loading: priceLoading } = useCurrentPrice(zone);
  const { messages: historyMessages, loaded: historyLoaded, appendMessage } = useChatHistory();

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Combine greeting + persisted history
  const messages = historyLoaded && historyMessages.length > 0
    ? historyMessages
    : [GREETING];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = async (text: string) => {
    if (!text.trim() || loading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: text,
    };

    await appendMessage(userMsg);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          zone,
          currentPrice: currentPrice ?? undefined,
        }),
      });

      const data = await res.json();

      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.response || "I'm having trouble connecting right now. Please try again.",
      };

      await appendMessage(aiMsg);
    } catch (e) {
      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "Sorry, I couldn't process your request. Please check your connection and try again.",
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
                <p className="text-sm leading-relaxed">{msg.content}</p>
              </div>
            </div>
          ))}
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
            {QUICK_QUESTIONS.map((q, i) => (
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
