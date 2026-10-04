import { STRATEGIES } from "./strategies";
import type { ChartBundle, Indicators, StockMeta, StockResult, StrategyId, Verdict } from "./types";
import { clamp, computeIndicators, lastBarsSpark, nearestResistance, nearestSupport, round } from "./indicators";

function lerpScore(value: number, goodLow: number, goodHigh: number, hardLow: number, hardHigh: number): number {
  if (value <= hardLow || value >= hardHigh) return 8;
  if (value >= goodLow && value <= goodHigh) return 88;
  if (value < goodLow) {
    const t = (value - hardLow) / (goodLow - hardLow);
    return 8 + t * 80;
  }
  const t = (hardHigh - value) / (hardHigh - goodHigh);
  return 8 + t * 80;
}

function technicalScore(strategy: StrategyId, ind: Indicators, chart: ChartBundle): { score: number; reasons: string[]; risks: string[] } {
  const reasons: string[] = [];
  const risks: string[] = [];
  const price = chart.price;
  let acc = 0;
  let w = 0;

  const add = (weight: number, pts: number) => {
    acc += weight * pts;
    w += weight;
  };

  if (ind.rsi != null) {
    const band = strategy === "intraday" ? [38, 68, 22, 82] : strategy === "swing" ? [42, 66, 28, 78] : [35, 65, 20, 82];
    add(1.2, lerpScore(ind.rsi, band[0]!, band[1]!, band[2]!, band[3]!));
    if (ind.rsi >= 45 && ind.rsi <= 65) reasons.push(`RSI ${ind.rsi.toFixed(0)} — momentum sehat`);
    else if (ind.rsi > 72) risks.push(`RSI ${ind.rsi.toFixed(0)} jenuh beli`);
    else if (ind.rsi < 35) risks.push(`RSI ${ind.rsi.toFixed(0)} lemah`);
  }

  if (ind.ema9 != null && strategy === "intraday") {
    const above = price >= ind.ema9;
    add(1.1, above ? 86 : 28);
    if (above) reasons.push("Harga di atas EMA9");
    else risks.push("Harga di bawah EMA9");
  }

  if (ind.sma20 != null) {
    const above = price >= ind.sma20;
    add(1, above ? 84 : 32);
    if (above) reasons.push("Di atas SMA20");
  }

  if (ind.sma50 != null) {
    const above = price >= ind.sma50;
    add(strategy === "intraday" ? 0.7 : 1.3, above ? 86 : 30);
    if (above && strategy !== "intraday") reasons.push("Tren menengah (SMA50) positif");
    else if (!above && strategy !== "intraday") risks.push("Masih di bawah SMA50");
  }

  if (ind.sma200 != null) {
    const above = price >= ind.sma200;
    add(strategy === "invest" ? 1.6 : strategy === "swing" ? 0.9 : 0.4, above ? 88 : 34);
    if (strategy === "invest") {
      if (above) reasons.push("Di atas SMA200 — tren panjang naik");
      else reasons.push("Di bawah SMA200 — potensi value, butuh konfirmasi");
    }
  }

  if (ind.sma50Slope != null) {
    add(0.8, clamp(50 + ind.sma50Slope * 18));
  }

  if (ind.macdHist != null) {
    add(1, ind.macdHist > 0 ? 80 : 36);
    if (ind.macdHist > 0) reasons.push("MACD histogram positif");
    else if (strategy !== "intraday") risks.push("MACD belum konfirmasi");
  }

  if (ind.rvol != null) {
    if (strategy === "intraday") {
      add(1.4, clamp(30 + (ind.rvol - 0.6) * 40));
      if (ind.rvol >= 1.4) reasons.push(`Volume ${ind.rvol.toFixed(1)}× rata-rata`);
      else if (ind.rvol < 0.8) risks.push("Volume tipis");
    } else {
      add(0.7, clamp(40 + (ind.rvol - 0.7) * 25));
    }
  }

  if (ind.roc10 != null) {
    if (strategy === "intraday") add(0.9, lerpScore(ind.roc10, 0.4, 6, -8, 14));
    else if (strategy === "swing") add(0.8, lerpScore(ind.roc10, 0, 8, -12, 18));
    else add(0.4, lerpScore(ind.roc10, -4, 6, -20, 22));
  }

  if (ind.pos52w != null) {
    if (strategy === "intraday") add(0.5, lerpScore(ind.pos52w, 55, 88, 15, 99));
    else if (strategy === "swing") add(0.6, lerpScore(ind.pos52w, 40, 80, 10, 97));
    else add(1.1, lerpScore(ind.pos52w, 28, 72, 5, 96));
    if (strategy === "invest" && ind.pos52w > 88) risks.push("Dekat puncak 52 minggu");
    if (strategy === "invest" && ind.pos52w < 30) reasons.push("Masih diskon vs 52 minggu");
  }

  if (ind.atrPct != null) {
    if (strategy === "intraday") add(0.6, lerpScore(ind.atrPct, 1.4, 4.2, 0.4, 9));
    else if (strategy === "swing") add(0.5, lerpScore(ind.atrPct, 1.2, 3.8, 0.4, 8));
    else add(0.7, lerpScore(ind.atrPct, 0.8, 2.8, 0.3, 7));
    if (strategy === "invest" && ind.atrPct > 5) risks.push("Volatilitas tinggi untuk investasi");
  }

  if (chart.changePct <= -5 && strategy === "intraday") {
    add(0.8, 18);
    risks.push("Koreksi harian dalam");
  }

  const score = w > 0 ? acc / w : 50;
  return { score: clamp(score), reasons: reasons.slice(0, 4), risks: risks.slice(0, 3) };
}

function fundamentalScore(
  strategy: StrategyId,
  meta: StockMeta,
  chart: ChartBundle,
  ind: Indicators,
): { score: number; reasons: string[]; risks: string[] } {
  const reasons: string[] = [];
  const risks: string[] = [];
  let acc = 48;

  const value = chart.price * chart.volume;
  if (strategy === "intraday") {
    if (value >= 20e9) {
      acc += 18;
      reasons.push("Likuiditas sesi kuat");
    } else if (value >= 8e9) acc += 10;
    else if (value >= 3e9) acc += 2;
    else {
      acc -= 16;
      risks.push("Nilai transaksi rendah");
    }
  } else if (value >= 8e9) acc += 8;
  else if (value < 1.5e9) {
    acc -= 10;
    risks.push("Likuiditas menengah ke bawah");
  }

  if (meta.size === "mega") acc += strategy === "invest" ? 16 : 8;
  else if (meta.size === "large") acc += strategy === "invest" ? 12 : 6;
  else if (meta.size === "mid") acc += strategy === "invest" ? 2 : 4;
  else {
    acc -= strategy === "invest" ? 14 : 4;
    if (strategy === "invest") risks.push("Kapitalisasi kecil");
  }

  if (meta.flags.lq45) {
    acc += strategy === "intraday" ? 6 : 10;
    if (strategy !== "intraday") reasons.push("Anggota LQ45");
  }
  if (meta.flags.idx30) acc += 4;
  if (meta.flags.soe && strategy === "invest") {
    acc += 4;
    reasons.push("BUMN / kualitas institusi");
  }

  const lastDiv = chart.dividends[0];
  const yearMs = 400 * 24 * 3600 * 1000;
  const paidRecently = lastDiv && Date.now() - lastDiv.date < yearMs;
  if (paidRecently || meta.flags.dividend) {
    acc += strategy === "invest" ? 12 : strategy === "swing" ? 6 : 2;
    if (strategy === "invest" && lastDiv) {
      const yieldPct = (lastDiv.amount / chart.price) * 100;
      reasons.push(`Dividen terakhir ${round(yieldPct, 1)}% dari harga`);
    }
  } else if (strategy === "invest") {
    acc -= 4;
  }

  if (meta.flags.shariah && strategy !== "intraday") acc += 3;

  if (chart.price < 50) {
    acc -= 22;
    risks.push("Harga sangat rendah — risiko gorengan");
  } else if (chart.price < 120 && meta.size === "small") {
    acc -= 8;
  }

  if (ind.sma200Slope != null && strategy === "invest") {
    acc += clamp(ind.sma200Slope * 8, -8, 10);
  }

  return { score: clamp(acc), reasons: reasons.slice(0, 3), risks: risks.slice(0, 2) };
}

function verdictOf(total: number): Verdict {
  if (total >= 72) return "beli";
  if (total >= 58) return "pertimbangkan";
  return "tunggu";
}

function levelsFor(strategy: StrategyId, chart: ChartBundle, ind: Indicators) {
  const atr = ind.atr ?? chart.price * 0.02;
  const stopMul = strategy === "intraday" ? 1.05 : strategy === "swing" ? 1.7 : 2.4;
  const tgtMul = strategy === "intraday" ? 1.6 : strategy === "swing" ? 2.4 : 3.2;
  const support = nearestSupport(chart.bars, chart.price);
  const resistance = nearestResistance(chart.bars, chart.price);
  return {
    support: round(support),
    resistance: round(resistance),
    stop: round(Math.min(support, chart.price - atr * stopMul)),
    target: round(Math.max(resistance, chart.price + atr * tgtMul)),
  };
}

export type ScoredRow = Omit<StockResult, "thesis" | "headlines">;

export function scoreStock(strategy: StrategyId, meta: StockMeta, chart: ChartBundle): ScoredRow {
  const indicators = computeIndicators(chart);
  const t = technicalScore(strategy, indicators, chart);
  const f = fundamentalScore(strategy, meta, chart, indicators);
  const weights = STRATEGIES[strategy].weights;
  const sentiment = 50;
  const total = clamp(
    t.score * weights.technical + f.score * weights.fundamental + sentiment * weights.sentiment,
  );
  const reasons = [...t.reasons, ...f.reasons].filter((v, i, a) => a.indexOf(v) === i).slice(0, 5);
  const risks = [...t.risks, ...f.risks].filter((v, i, a) => a.indexOf(v) === i).slice(0, 4);
  const lastDiv = chart.dividends[0];
  return {
    symbol: meta.symbol,
    name: meta.name,
    sector: meta.sector,
    size: meta.size,
    flags: meta.flags,
    price: chart.price,
    prevClose: chart.prevClose,
    changePct: chart.changePct,
    volume: chart.volume,
    value: chart.price * chart.volume,
    spark: lastBarsSpark(chart.bars, 56),
    scores: { total, technical: t.score, fundamental: f.score, sentiment },
    verdict: verdictOf(total),
    reasons,
    risks,
    levels: levelsFor(strategy, chart, indicators),
    indicators,
    lastDiv,
  };
}

export function applySentiment(
  row: ScoredRow,
  strategy: StrategyId,
  sentiment: number,
  thesis: string,
  extraRisks: string[],
): StockResult {
  const weights = STRATEGIES[strategy].weights;
  const total = clamp(
    row.scores.technical * weights.technical +
      row.scores.fundamental * weights.fundamental +
      sentiment * weights.sentiment,
  );
  return {
    ...row,
    scores: { ...row.scores, sentiment, total },
    verdict: verdictOf(total),
    thesis,
    headlines: [],
    risks: [...row.risks, ...extraRisks].filter((v, i, a) => a.indexOf(v) === i).slice(0, 4),
  };
}

export function minValueFor(strategy: StrategyId): number {
  if (strategy === "intraday") return 2.5e9;
  if (strategy === "swing") return 1.2e9;
  return 0.6e9;
}
