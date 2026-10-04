import type { Headline, StrategyId } from "./types";

export type SentimentRow = {
  symbol: string;
  sentiment: number;
  thesis: string;
  risks: string[];
};

type GrokChat = {
  choices?: Array<{ message?: { content?: string } }>;
};

function extractJson(text: string): unknown {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const raw = (fenced?.[1] ?? text).trim();
  const start = raw.search(/[\[{]/);
  if (start < 0) return null;
  const sliced = raw.slice(start);
  try {
    return JSON.parse(sliced);
  } catch {
    const endObj = sliced.lastIndexOf("}");
    const endArr = sliced.lastIndexOf("]");
    const end = Math.max(endObj, endArr);
    if (end > 0) {
      try {
        return JSON.parse(sliced.slice(0, end + 1));
      } catch {
        return null;
      }
    }
    return null;
  }
}

export async function scoreSentiment(input: {
  strategy: StrategyId;
  market: string;
  stocks: Array<{
    symbol: string;
    name: string;
    sector: string;
    price: number;
    changePct: number;
    rsi: number | null;
    headlines: Headline[];
  }>;
}): Promise<{ enabled: boolean; rows: SentimentRow[] }> {
  const apiKey = process.env.XAI_API_KEY;
  if (!apiKey || input.stocks.length === 0) return { enabled: false, rows: [] };

  const compact = input.stocks.map((s) => ({
    symbol: s.symbol,
    name: s.name,
    sector: s.sector,
    changePct: Number(s.changePct.toFixed(2)),
    rsi: s.rsi != null ? Math.round(s.rsi) : null,
    news: s.headlines.slice(0, 3).map((h) => h.title),
  }));

  const horizon =
    input.strategy === "intraday"
      ? "intraday (tutup hari ini)"
      : input.strategy === "swing"
        ? "swing 5-20 hari"
        : "investasi jangka panjang";

  const prompt = `Anda analis saham BEI. Strategi: ${horizon}. Kondisi pasar: ${input.market}.
Nilai sentimen berita + konteks emiten berikut (skala 0-100, 50 = netral).
Tulis thesis 1 kalimat bahasa Indonesia, nada tenang, bukan hype. Sebut risiko singkat jika ada.
Jangan rekomendasikan saham yang jelas kena skandal hukum/fraud.
Output JSON array saja, tanpa markdown:
[{"symbol":"BBCA","sentiment":62,"thesis":"...","risks":["..."]}]

Data:
${JSON.stringify(compact)}`;

  try {
    const res = await fetch("https://api.x.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      signal: AbortSignal.timeout(22000),
      body: JSON.stringify({
        model: "grok-4.5",
        temperature: 0.2,
        max_tokens: 1600,
        messages: [
          {
            role: "system",
            content:
              "Anda analis ekuitas Indonesia. Jawab hanya JSON valid. Jangan menjanjikan profit.",
          },
          { role: "user", content: prompt },
        ],
      }),
    });
    if (!res.ok) return { enabled: false, rows: [] };
    const body = (await res.json()) as GrokChat;
    const text = body.choices?.[0]?.message?.content ?? "";
    const parsed = extractJson(text);
    if (!Array.isArray(parsed)) return { enabled: true, rows: [] };
    const rows: SentimentRow[] = [];
    for (const item of parsed) {
      if (!item || typeof item !== "object") continue;
      const rec = item as Record<string, unknown>;
      const symbol = String(rec.symbol ?? "").toUpperCase();
      if (!symbol) continue;
      const sentiment = Number(rec.sentiment);
      const thesis = String(rec.thesis ?? "").trim();
      const risks = Array.isArray(rec.risks)
        ? rec.risks.map((r) => String(r)).filter(Boolean).slice(0, 2)
        : [];
      rows.push({
        symbol,
        sentiment: Number.isFinite(sentiment) ? Math.min(100, Math.max(0, sentiment)) : 50,
        thesis,
        risks,
      });
    }
    return { enabled: true, rows };
  } catch {
    return { enabled: false, rows: [] };
  }
}
