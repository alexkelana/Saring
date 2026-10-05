import { scoreHeadlines, sentimentLabel } from "./heuristic";
import { lastBarsSpark } from "./indicators";
import { fetchHeadlinesFor } from "./news";
import { applySentiment, minValueFor, scoreStock } from "./score";
import { scoreSentiment } from "./sentiment";
import type { ScreenResult, StockResult, StrategyId } from "./types";
import { fetchIdxSnapshots, fetchIhsg } from "./tradingview";
import { fetchCharts } from "./yahoo";

function fallbackThesis(
  row: ReturnType<typeof scoreStock>,
  strategy: StrategyId,
  sentiment: number,
): string {
  const head = row.reasons[0] ?? "Setup cukup rapi";
  const sent = sentimentLabel(sentiment);
  if (strategy === "intraday") {
    return `${row.symbol} masuk radar sesi ini: ${head.toLowerCase()}. Sentimen berita ${sent}. Cocok hanya jika likuiditas tetap jaga sampai penutupan.`;
  }
  if (strategy === "swing") {
    return `${row.symbol} punya setup swing ${row.verdict === "beli" ? "yang rapi" : "yang masih perlu konfirmasi"}: ${head.toLowerCase()}. Sentimen ${sent}.`;
  }
  return `${row.symbol} dinilai dari kualitas dan tren panjang: ${head.toLowerCase()}. Sentimen ${sent}. Posisi bertahap, bukan all-in.`;
}

const screenCache = new Map<string, { at: number; value: ScreenResult }>();
const SCREEN_TTL = 4 * 60 * 1000;

export async function runScreening(input: {
  strategy: StrategyId;
  sector?: string;
}): Promise<ScreenResult> {
  const strategy = input.strategy;
  const sector = input.sector && input.sector !== "Semua" ? input.sector : "Semua";
  const cacheKey = `v2:${strategy}:${sector}`;
  const hit = screenCache.get(cacheKey);
  if (hit && Date.now() - hit.at < SCREEN_TTL) return hit.value;

  const [market, snapshots] = await Promise.all([fetchIhsg(), fetchIdxSnapshots()]);
  const universe = snapshots.filter((s) => (sector === "Semua" ? true : s.sector === sector));
  const minVal = minValueFor(strategy);
  const scored = [];
  let failed = snapshots.length - universe.length;

  for (const snap of universe) {
    if (snap.price <= 0 || (snap.rsi == null && snap.sma20 == null)) {
      failed += 1;
      continue;
    }
    const liquidEnough =
      snap.value >= minVal || (strategy === "invest" && (snap.fundamentals.mcap ?? 0) >= 10e12);
    if (!liquidEnough) continue;
    if (strategy === "intraday" && (snap.rsi ?? 50) > 78) continue;
    scored.push(scoreStock(strategy, snap));
  }

  scored.sort((a, b) => b.scores.total - a.scores.total);
  const shortlist = scored.slice(0, 14);

  const [headlines, charts] = await Promise.all([
    fetchHeadlinesFor(shortlist.slice(0, 6).map((s) => ({ symbol: s.symbol, name: s.name }))),
    fetchCharts(shortlist.map((s) => s.symbol)),
  ]);

  const chartMap = new Map(charts.map((c) => [c.symbol, c]));
  const withChart = shortlist.map((row) => {
    const chart = chartMap.get(row.symbol);
    if (!chart) return row;
    return {
      ...row,
      spark: lastBarsSpark(chart.bars, 56),
      lastDiv: chart.dividends[0],
    };
  });

  const newsRows = withChart.map((s) => ({
    symbol: s.symbol,
    name: s.name,
    sector: s.sector,
    price: s.price,
    changePct: s.changePct,
    rsi: s.indicators.rsi,
    headlines: headlines.get(s.symbol) ?? [],
  }));

  const sentiment = await scoreSentiment({
    strategy,
    market: `IHSG ${market.price.toFixed(0)} (${market.changePct >= 0 ? "+" : ""}${market.changePct.toFixed(2)}%), status ${market.statusLabel}`,
    stocks: newsRows,
  });
  const sentMap = new Map(sentiment.rows.map((r) => [r.symbol, r]));

  const results: StockResult[] = withChart.map((row) => {
    const news = headlines.get(row.symbol) ?? [];
    const heur = scoreHeadlines(news);
    const ai = sentMap.get(row.symbol);
    const sentimentScore = ai?.sentiment ?? heur.sentiment;
    const extraRisks = ai?.risks ?? [];
    const thesis =
      (ai?.thesis && ai.thesis.trim()) || fallbackThesis(row, strategy, sentimentScore);
    const withSent = applySentiment(row, strategy, sentimentScore, thesis, extraRisks);
    return { ...withSent, headlines: news };
  });

  results.sort((a, b) => b.scores.total - a.scores.total);
  const cutoff = strategy === "intraday" ? 54 : 52;
  let qualified = results.filter((r) => r.scores.total >= cutoff);
  if (qualified.length < 6) qualified = results.slice(0, 8);
  const note =
    market.trend === "turun"
      ? "IHSG sedang melemah — kurangi ukuran posisi dan utamakan saham paling likuid."
      : undefined;

  const value: ScreenResult = {
    strategy,
    sector,
    asOf: Date.now(),
    market,
    scanned: snapshots.length,
    eligible: scored.length,
    failed,
    qualified: qualified.length,
    results: qualified.slice(0, 12),
    sentimentEnabled: sentiment.enabled,
    note,
  };
  screenCache.set(cacheKey, { at: Date.now(), value });
  return value;
}
