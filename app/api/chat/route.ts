import { NextRequest, NextResponse } from "next/server";
import { toRetailPrice } from "@/lib/pricing";

const NORDAPI_BASE = "https://nordapi.ee/api/v1";

interface NordapiHourly {
  hour_start: string;
  price_local_kwh: number | string;
}

async function fetchTodayPrices(zone: string): Promise<
  { hour: string; price: number }[] | null
> {
  try {
    const res = await fetch(`${NORDAPI_BASE}/electricity/today/${zone}`, {
      cache: "no-store",
    });
    if (!res.ok) return null;
    const data = await res.json();
    const prices = data.data as NordapiHourly[];
    if (!prices || prices.length === 0) return null;

    // Aggregate 15-min intervals into hourly averages
    const hourly = new Map<string, number[]>();
    for (const p of prices) {
      const ts = new Date(p.hour_start);
      const key = `${ts.getHours().toString().padStart(2, "0")}:00`;
      if (!hourly.has(key)) hourly.set(key, []);
      hourly.get(key)!.push(toRetailPrice(parseFloat(String(p.price_local_kwh))));
    }

    return Array.from(hourly.entries()).map(([hour, vals]) => ({
      hour,
      price: Math.round(vals.reduce((a, b) => a + b, 0) / vals.length),
    }));
  } catch {
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    const { message, zone, currentPrice } = await request.json();

    const apiKey = process.env.GEMINI_API_KEY;
    const model = process.env.GEMINI_MODEL || "gemini-2.5-flash";

    if (!apiKey) {
      return NextResponse.json(
        { error: "Gemini API key not configured" },
        { status: 500 }
      );
    }

    // Fetch today's hourly prices so Sparky can give specific advice
    const todayPrices = await fetchTodayPrices(zone || "SE3");

    let priceContext = "";
    if (todayPrices && todayPrices.length > 0) {
      const prices = todayPrices.map((p) => p.price);
      const minPrice = Math.min(...prices);
      const maxPrice = Math.max(...prices);
      const avgPrice = Math.round(prices.reduce((a, b) => a + b, 0) / prices.length);
      const minHour = todayPrices.find((p) => p.price === minPrice)?.hour ?? "--:--";
      const maxHour = todayPrices.find((p) => p.price === maxPrice)?.hour ?? "--:--";

      const priceTable = todayPrices
        .map((p) => `  ${p.hour}: ${p.price} öre/kWh`)
        .join("\n");

      priceContext =
        `\nToday's hourly prices for ${zone || "SE3"} (öre/kWh):\n` +
        priceTable +
        `\n\nSummary: cheapest at ${minHour} (${minPrice} öre), ` +
        `most expensive at ${maxHour} (${maxPrice} öre), ` +
        `average ${avgPrice} öre.\n`;
    } else {
      priceContext = "\n(No full-day price data available right now.)\n";
    }

    const systemInstruction =
      `You are "Sparky", a friendly and practical Swedish electricity price assistant. ` +
      `Your tone is warm, concise, and helpful — like a knowledgeable neighbor.\n\n` +
      `Current context:\n` +
      `- Zone: ${zone || "SE3"}\n` +
      `- Current price: ${currentPrice ?? "unknown"} öre/kWh` +
      priceContext +
      `\nGuidelines:\n` +
      `1. Base ALL answers on the price data above. Never make up prices.\n` +
      `2. When asked about best times to run appliances, give SPECIFIC hours (e.g. "02:00–05:00") ` +
      `and calculate exact savings compared to peak hours.\n` +
      `3. For washing machine (~1 kWh/load): savings = price difference × 1. For dishwasher (~1.5 kWh): × 1.5. ` +
      `For EV charging (~60 kWh): × 60. Show the math.\n` +
      `4. Keep responses brief (2–4 sentences) and actionable.\n` +
      `5. If data is missing, say so honestly.`;

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: {
          parts: [{ text: systemInstruction }],
        },
        contents: [
          {
            role: "user",
            parts: [{ text: message }],
          },
        ],
      }),
    });

    if (!res.ok) {
      const errorBody = await res.text();
      console.error("Gemini API error:", errorBody);
      return NextResponse.json(
        { error: "AI service temporarily unavailable. Please try again later." },
        { status: 503 }
      );
    }

    const data = await res.json();
    const response =
      data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ||
      "I'm not sure about that. Could you try rephrasing your question?";

    return NextResponse.json({ response });
  } catch (error) {
    console.error("Chat route error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
