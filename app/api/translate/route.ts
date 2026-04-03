import { NextRequest, NextResponse } from "next/server";

interface MyMemoryResponse {
  responseStatus: number;
  responseData: {
    translatedText: string;
    match: number;
  };
}

const MYMEMORY_API = "https://api.mymemory.translated.net/get";
const MYMEMORY_EMAIL = process.env.MYMEMORY_EMAIL ?? "";

export async function POST(request: NextRequest): Promise<NextResponse> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { text, from = "en", to = "ru" } = body as { text?: string; from?: string; to?: string };

  if (!text?.trim()) {
    return NextResponse.json({ error: "`text` is required" }, { status: 400 });
  }

  const sourceLang = !from || from === "auto" ? "en" : from;
  const params = new URLSearchParams({ q: text.slice(0, 500), langpair: `${sourceLang}|${to}` });
  if (MYMEMORY_EMAIL) params.set("de", MYMEMORY_EMAIL);

  try {
    const res = await fetch(`${MYMEMORY_API}?${params}`, {
      headers: { Accept: "application/json" },
    });

    if (!res.ok) throw new Error(`MyMemory error: ${res.status}`);

    const data: MyMemoryResponse = await res.json();

    if (data.responseStatus !== 200) {
      return NextResponse.json({ error: "Translation failed" }, { status: 502 });
    }

    return NextResponse.json({
      translatedText: data.responseData.translatedText,
      confidence: data.responseData.match,
      from,
      to,
    });
  } catch (err) {
    console.error("[/api/translate]", err);
    return NextResponse.json({ error: "Failed to reach translation service" }, { status: 502 });
  }
}
