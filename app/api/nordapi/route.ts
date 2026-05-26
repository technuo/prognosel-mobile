import { NextRequest, NextResponse } from "next/server";

const NORDAPI_BASE = "https://nordapi.ee/api/v1";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const endpoint = searchParams.get("endpoint");
  const zone = searchParams.get("zone");
  const startDate = searchParams.get("start_date");
  const endDate = searchParams.get("end_date");

  if (!endpoint || !zone) {
    return NextResponse.json(
      { error: "Missing endpoint or zone parameter" },
      { status: 400 }
    );
  }

  let url: string;
  if (endpoint === "history") {
    if (!startDate || !endDate) {
      return NextResponse.json(
        { error: "Missing start_date or end_date for history" },
        { status: 400 }
      );
    }
    url = `${NORDAPI_BASE}/electricity/history/${zone}?start_date=${startDate}&end_date=${endDate}`;
  } else if (endpoint === "today") {
    url = `${NORDAPI_BASE}/electricity/today/${zone}`;
  } else if (endpoint === "current") {
    url = `${NORDAPI_BASE}/electricity/current/${zone}`;
  } else {
    return NextResponse.json({ error: "Unknown endpoint" }, { status: 400 });
  }

  try {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) {
      return NextResponse.json(
        { error: `NordAPI error: ${res.status}` },
        { status: res.status }
      );
    }
    const data = await res.json();
    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json(
      { error: "Failed to fetch from NordAPI" },
      { status: 500 }
    );
  }
}
