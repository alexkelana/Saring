import { applySentiment, minValueFor, scoreStock } from "./score";
import { fetchHeadlinesFor } from "./news";
import { scoreSentiment } from "./sentiment";
import type { ScreenResult, StockResult, StrategyId } from "./types";
import { UNIVERSE } from "./universe";
import { fetchCharts, fetchIhsg } from "./yahoo";

function fallbackThesis(row: ReturnType<typeof scoreStock>, strategy: StrategyId): string {
  const head = row.reasons[0] ?? "Setup teknikal cukup rapi";
  if (strategy === "intraday") {
    return `${row.symbol} masuk radar sesi ini: ${head.toLowerCase()}. Cocok hanya jika likuiditas tetap jaga sampai penutupan.`;
  }
  if (strategy === "swing") {
    return `${row.symbol} punya setup swing ${row.verdict === "beli" ? "yang rapi" : "yang masih perlu konfirmasi"}: ${head.toLowerCase()}.`;
  }
  return `${row.symbol} dinilai dari kualitas dan tren panjang: ${head.toLowerCase()}. Posisi bertahap, bukan all-in.`;
}

export async function runScreening(input: {
  strategy: StrategyId;
  sector?: string;
}): Promise<ScreenResult> {
  const strategy = input.strategy;
  const sector = input.sector && input.sector !== "Semua" ? input.sector : "Semua";
  const universe = UNIVERSE.filter((s) => (sector === "Semua" ? true : s.sector === sector));
  const [market, charts] = await Promise.all([
    fetchIhsg(),
    fetchCharts(universe.map((s) => s.symbol)),
  ]);
  const bySymbol = new Map(universe.map((s) => [s.symbol, s]));
  const minVal = minValueFor(strategy);
  const scored = [];
  let failed = universe.length - charts.length;

  for (const chart of charts) {
    const meta = bySymbol.get(chart.symbol);
    if (!meta) continue;
    if (chart.price <= 0) {
      failed += 1;
      continue;
    }
    const row = scoreStock(strategy, meta, chart);
    if (row.value < minVal && !(meta.flags.lq45 && strategy === "invest")) continue;
    if (strategy === "intraday" && (row.indicators.rsi ?? 50) > 78) continue;
    scored.push(row);
  }

  scored.sort((a, b) => b.scores.total - a.scores.total);
  const shortlist = scored.slice(0, 14);

  const headlines = await fetchHeadlinesFor(
    shortlist.slice(0, 8).map((s) => ({ symbol: s.symbol, name: s.name })),
  );

  const sentiment = await scoreSentiment({
    strategy,
    market: `IHSG ${market.price.toFixed(0)} (${market.changePct >= 0 ? "+" : ""}${market.changePct.toFixed(2)}%), status ${market.statusLabel}`,
    stocks: shortlist.map((s) => ({
      symbol: s.symbol,
      name: s.name,
      sector: s.sector,
      price: s.price,
      changePct: s.changePct,
      rsi: s.indicators.rsi,
      headlines: headlines.get(s.symbol) ?? [],
    })),
  });

  const sentMap = new Map(sentiment.rows.map((r) => [r.symbol, r]));
  const results: StockResult[] = shortlist.map((row) => {
    const s = sentMap.get(row.symbol);
    const withSent = applySentiment(
      row,
      strategy,
      s?.sentiment ?? row.scores.sentiment,
      s?.thesis || fallbackThesis(row, strategy),
      s?.risks ?? [],
    );
    return {
      ...withSent,
      headlines: headlines.get(row.symbol) ?? [],
    };
  });

  results.sort((a, b) => b.scores.total - a.scores.total);
  const cutoff = strategy === "intraday" ? 54 : 52;
  let qualified = results.filter((r) => r.scores.total >= cutoff);
  if (qualified.length < 6) qualified = results.slice(0, 8);
  const note =
    market.trend === "turun"
      ? "IHSG sedang melemah — kurangi ukuran posisi dan utamakan saham paling likuid."
      : undefined;

  return {
    strategy,
    sector,
    asOf: Date.now(),
    market,
    scanned: universe.length,
    failed,
    qualified: qualified.length,
    results: qualified.slice(0, 12),
    sentimentEnabled: sentiment.enabled,
    note,
  };
}
