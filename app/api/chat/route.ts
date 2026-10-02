import { NextRequest, NextResponse } from "next/server";
import { fetchTodayHourly } from "@/lib/api/today";
import { userFromRequest } from "@/lib/api/request-auth";
import { bestContiguousWindow } from "@/lib/windows";

const ZONES = ["SE1", "SE2", "SE3", "SE4"] as const;
const DEFAULT_ZONE = "SE3";

const MAX_MESSAGE_LENGTH = 1000;
const GEMINI_TIMEOUT_MS = 15_000;
const GEMINI_MAX_OUTPUT_TOKENS = 1024;

// Per-instance guards. Sufficient for a free launch tier; revisit when usage grows.
const RATE_WINDOW_MS = 60_000;
const RATE_MAX_REQUESTS = 20;
const rateBuckets = new Map<string, number[]>();

function isAllowedZone(value: unknown): value is (typeof ZONES)[number] {
  return typeof value === "string" && (ZONES as readonly string[]).includes(value);
}

// ── Action suggestions (drive the "add to tasks?" chip in the chat) ─────────
type SuggestionKind = "ev" | "dishwasher" | "washer" | "generic";

const WINDOW_LENGTH: Record<SuggestionKind, number> = {
  ev: 3,
  dishwasher: 2,
  washer: 2,
  generic: 2,
};

/** Typical energy per action, used for the saving estimate (kWh). */
const ACTION_KWH: Record<SuggestionKind, number> = {
  ev: 30,
  dishwasher: 1.5,
  washer: 1,
  generic: 2,
};

function detectKind(message: string): SuggestionKind | null {
  if (
    /(elbil|elbilen|\bev\b|electric car|ladda|laddning|charge|charging|电车|充电|汽車|电动车|汽车充电)/i.test(
      message
    )
  ) {
    return "ev";
  }
  if (/(diskmaskin|dishwasher|洗碗|洗碗机)/i.test(message)) return "dishwasher";
  if (/(tvättmaskin|tvätt|washer|washing|洗衣|洗衣机)/i.test(message)) return "washer";
  if (
    /\b(when|what time|best|cheapest|när|billigast|bästa|timme|timmar|fönster|window|klockan)\b|什么时候|几点|最便宜|便宜|时段|时间/i.test(
      message
    )
  ) {
    return "generic";
  }
  return null;
}

function rateLimit(key: string, now: number): boolean {
  const bucket = (rateBuckets.get(key) ?? []).filter((t) => now - t < RATE_WINDOW_MS);
  if (bucket.length >= RATE_MAX_REQUESTS) {
    rateBuckets.set(key, bucket);
    return false;
  }
  bucket.push(now);
  rateBuckets.set(key, bucket);
  if (rateBuckets.size > 1000) {
    rateBuckets.forEach((ts, k) => {
      if (ts.every((t) => now - t >= RATE_WINDOW_MS)) rateBuckets.delete(k);
    });
  }
  return true;
}

export async function POST(request: NextRequest) {
  const startedAt = Date.now();

  let body: { message?: unknown; zone?: unknown; lang?: unknown; currentPrice?: unknown } = {};
  try {
    body = await request.json();
  } catch {
    // handled below via empty-message check
  }

  const rawMessage = typeof body.message === "string" ? body.message.trim() : "";
  if (!rawMessage) {
    return NextResponse.json({ error: "Empty message" }, { status: 400 });
  }
  if (rawMessage.length > MAX_MESSAGE_LENGTH) {
    return NextResponse.json({ error: "Message too long" }, { status: 400 });
  }

  const zone = isAllowedZone(body.zone) ? body.zone : DEFAULT_ZONE;
  const lang = body.lang === "en" ? "en" : "sv";
  const currentPrice =
    typeof body.currentPrice === "number" && Number.isFinite(body.currentPrice)
      ? body.currentPrice
      : undefined;

  // Sparky lives behind authentication. Accepts either transport: a session
  // cookie (web dashboard) or a bearer token (the Android app).
  const { user, error: authError } = await userFromRequest(request);
  if (!user) {
    if (authError) {
      console.warn("[chat] auth rejected:", authError);
    }
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (!rateLimit(user.id || ip, Date.now())) {
    return NextResponse.json(
      { error: "Too many requests. Please try again shortly." },
      { status: 429 }
    );
  }

  const apiKey = process.env.GEMINI_API_KEY;
  const model = process.env.GEMINI_MODEL || "gemini-2.5-flash";
  if (!apiKey) {
    console.error("[chat] GEMINI_API_KEY not configured");
    return NextResponse.json({ error: "AI service not configured" }, { status: 500 });
  }

  const todayPrices = await fetchTodayHourly(zone);
  let priceContext = "";
  if (todayPrices && todayPrices.length > 0) {
    const prices = todayPrices.map((p) => p.price);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const avgPrice = Math.round(prices.reduce((a, b) => a + b, 0) / prices.length);
    const minHour = todayPrices.find((p) => p.price === minPrice)?.hour ?? "--:--";
    const maxHour = todayPrices.find((p) => p.price === maxPrice)?.hour ?? "--:--";

    priceContext =
      `\nToday's hourly prices for ${zone} (öre/kWh, local Swedish time):\n` +
      todayPrices.map((p) => `  ${p.hour}: ${p.price} öre/kWh`).join("\n") +
      `\n\nSummary: cheapest at ${minHour} (${minPrice} öre), ` +
      `most expensive at ${maxHour} (${maxPrice} öre), ` +
      `average ${avgPrice} öre.\n`;
  } else {
    priceContext = "\n(No full-day price data available right now.)\n";
  }

  // Deterministic fallback summary (used if the model forgets concrete hours).
  const cheapHours = todayPrices
    ? [...todayPrices]
        .sort((a, b) => a.price - b.price)
        .slice(0, 3)
        .sort((a, b) => a.hour.localeCompare(b.hour))
    : [];
  const cheapestFloor = cheapHours.length
    ? Math.min(...cheapHours.map((h) => h.price))
    : 0;
  const concreteFallback =
    cheapHours.length > 0
      ? lang === "sv"
        ? `\n\n⚡ Idag i ${zone}: billigaste timmarna är ${cheapHours.map((h) => h.hour).join(", ")} (lägst ${cheapestFloor} öre/kWh).`
        : `\n\n⚡ Today in ${zone}: the cheapest hours are ${cheapHours.map((h) => h.hour).join(", ")} (lowest ${cheapestFloor} öre/kWh).`
      : "";
  const wantsTime =
    /\b(when|what time|best|cheapest|charge|charging|elbil|batteri|tider|ladda|tvätt|diskmaskin|washer|dishwasher|appliance|köra|starta|när|billigast|bästa|timmar|fönster|window|klockan)\b|什么时候|几点|最便宜|便宜|充电|电车|洗碗机|洗衣机|时段/i.test(
      rawMessage
    );

  // Structured suggestion the client can offer as a one-tap task.
  const kind = detectKind(rawMessage);
  let suggestion: {
    kind: SuggestionKind;
    title: string;
    window: string;
    savings: number;
  } | null = null;

  if (kind && todayPrices && todayPrices.length > 0) {
    const win = bestContiguousWindow(todayPrices, WINDOW_LENGTH[kind]);
    if (win) {
      const peak = Math.max(...todayPrices.map((p) => p.price));
      const savings =
        (Math.max(0, peak - win.avg) * ACTION_KWH[kind]) / 100; // öre/kWh × kWh → kr
      const titles: Record<SuggestionKind, { sv: string; en: string }> = {
        ev: {
          sv: `Ladda elbilen ${win.start}–${win.end}`,
          en: `Charge the EV ${win.start}–${win.end}`,
        },
        dishwasher: {
          sv: `Starta diskmaskinen ${win.start}–${win.end}`,
          en: `Run the dishwasher ${win.start}–${win.end}`,
        },
        washer: {
          sv: `Kör tvättmaskinen ${win.start}–${win.end}`,
          en: `Run the washing machine ${win.start}–${win.end}`,
        },
        generic: {
          sv: `Använd el ${win.start}–${win.end}`,
          en: `Use electricity ${win.start}–${win.end}`,
        },
      };
      suggestion = {
        kind,
        title: lang === "sv" ? titles[kind].sv : titles[kind].en,
        window: `${win.start}–${win.end}`,
        savings: Math.round(savings * 10) / 10,
      };
      priceContext +=
        `\nRecommended action window today: ${suggestion.window} ` +
        `(saves ~${suggestion.savings} kr vs the most expensive hour — use THIS window when answering).\n`;
    }
  }

  const systemInstruction =
    `You are "Sparky", a friendly and practical Swedish electricity price assistant. ` +
    `Your tone is warm, concise, and helpful — like a knowledgeable neighbour.\n\n` +
    `Current context:\n` +
    `- Zone: ${zone}\n` +
    `- Current price: ${currentPrice ?? "unknown"} öre/kWh\n` +
    `- Reply in ${lang === "sv" ? "Swedish" : "English"} unless the user writes in another language.` +
    priceContext +
    `\nGuidelines:\n` +
    `1. All times in the context are already local Swedish time (Europe/Stockholm). Never shift them.\n` +
    `2. Base ALL answers on the price data above. Never make up prices or hours.\n` +
    `3. When the user asks about timing, charging, washing or any appliance — you MUST end your answer ` +
    `with the concrete cheapest window using the actual hours from the context (e.g. "02:00–05:00"), ` +
    `plus the approximate saving. Never answer such a question without giving concrete hours.\n` +
    `4. For washing machine (~1 kWh/load): savings = price difference × 1. For dishwasher (~1.5 kWh): × 1.5. ` +
    `For EV charging (~60 kWh): × 60. Show the math.\n` +
    `5. Keep responses brief (2–4 sentences) and actionable.\n` +
    `6. If the price data is missing, say that prices for later today are not published yet ` +
    `(Nord Pool publishes around 12:00 CET) and suggest checking back — never invent hours.\n` +
    `7. Match the user's language strictly. If they write in English, reply in English. ` +
    `If they write in Swedish, reply in Swedish.\n` +
    `8. Do NOT ask the user whether to save the tip as a task — the app shows that ` +
    `option automatically. Just give the advice.\n` +
    `9. Reply in plain text only. Do not use markdown: no asterisks for emphasis, ` +
    `no headings, no bullet characters. The chat bubble renders text literally, so ` +
    `markup reaches the user as visible punctuation — write "02:00–05:00", not ` +
    `"**02:00–05:00**". If you want to show a calculation, write it as a plain ` +
    `sentence.`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), GEMINI_TIMEOUT_MS);

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          systemInstruction: {
            parts: [{ text: systemInstruction }],
          },
          contents: [{ role: "user", parts: [{ text: rawMessage }] }],
          generationConfig: { maxOutputTokens: GEMINI_MAX_OUTPUT_TOKENS },
        }),
      }
    );

    if (!res.ok) {
      const errorBody = await res.text();
      console.error("[chat] Gemini API error:", res.status, errorBody.slice(0, 500));
      return NextResponse.json(
        { error: "AI service temporarily unavailable. Please try again later." },
        { status: 503 }
      );
    }

    const data = await res.json();
    let response =
      data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ||
      "I'm not sure about that. Could you try rephrasing your question?";

    // Safety net: if the user asked about timing and the model forgot the
    // concrete hours, append the deterministic cheapest hours ourselves.
    if (
      wantsTime &&
      cheapHours.length > 0 &&
      !/\d{2}:\d{2}/.test(response) &&
      concreteFallback
    ) {
      response = response + concreteFallback;
    }

    // Fallback: even if no action keyword matched (e.g. the question was in
    // another language), offer the window the answer already recommends.
    if (!suggestion && todayPrices && todayPrices.length > 0) {
      const match = response.match(/(\d{2}:\d{2})\s*[–\-—]\s*(\d{2}:\d{2})/);
      if (match) {
        const startIdx = todayPrices.findIndex((p) => p.hour === match[1]);
        if (startIdx >= 0) {
          const slice = todayPrices.slice(startIdx, startIdx + WINDOW_LENGTH.generic);
          const avg = slice.reduce((sum, h) => sum + h.price, 0) / slice.length;
          const peak = Math.max(...todayPrices.map((p) => p.price));
          const savings = (Math.max(0, peak - avg) * ACTION_KWH.generic) / 100;
          suggestion = {
            kind: "generic",
            title:
              lang === "sv"
                ? `Använd el ${match[1]}–${match[2]}`
                : `Use electricity ${match[1]}–${match[2]}`,
            window: `${match[1]}–${match[2]}`,
            savings: Math.round(savings * 10) / 10,
          };
        }
      }
    }

    return NextResponse.json({ response, suggestion });
  } catch (error) {
    const timedOut = error instanceof Error && error.name === "AbortError";
    console.error(
      "[chat] Chat route error:",
      error instanceof Error ? error.message : String(error),
      `zone=${zone} elapsedMs=${Date.now() - startedAt}`
    );
    return NextResponse.json(
      {
        error: timedOut
          ? "The AI service timed out. Please try again."
          : "Something went wrong. Please try again.",
      },
      { status: timedOut ? 504 : 500 }
    );
  } finally {
    clearTimeout(timeout);
  }
}
