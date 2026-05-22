import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { message, zone, currentPrice } = await request.json();

    const apiKey = process.env.GEMINI_API_KEY;
    const model = process.env.GEMINI_MODEL || "gemini-2.0-flash";

    if (!apiKey) {
      return NextResponse.json(
        { error: "Gemini API key not configured" },
        { status: 500 }
      );
    }

    const systemInstruction =
      `You are "Sparky", a friendly and practical Swedish electricity price assistant. ` +
      `Your tone is warm, concise, and helpful — like a knowledgeable neighbor.\n\n` +
      `Current context:\n` +
      `- Zone: ${zone || "SE3"}\n` +
      `- Current price: ${currentPrice ?? "unknown"} SEK/kWh\n\n` +
      `Guidelines:\n` +
      `1. Base answers on the data provided. Don't make up prices.\n` +
      `2. Give specific, actionable advice (what time, how much, potential savings).\n` +
      `3. Keep responses brief and natural.\n` +
      `4. If you don't have enough data, say so honestly.`;

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
