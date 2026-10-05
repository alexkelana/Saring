import { STRATEGIES } from "./strategies";
import { indicatorsFromSnap, type IdxSnapshot } from "./tradingview";
import type {
  Indicators,
  Levels,
  StockResult,
  StrategyId,
  Verdict,
} from "./types";
import { clamp, round } from "./indicators";

function lerpScore(
  value: number,
  goodLow: number,
  goodHigh: number,
  hardLow: number,
  hardHigh: number,
): number {
  if (value <= hardLow || value >= hardHigh) return 8;
  if (value >= goodLow && value <= goodHigh) return 88;
  if (value < goodLow) {
    const t = (value - hardLow) / (goodLow - hardLow);
    return 8 + t * 80;
  }
  const t = (hardHigh - value) / (hardHigh - goodHigh);
  return 8 + t * 80;
}

function technicalScore(
  strategy: StrategyId,
  ind: Indicators,
  snap: IdxSnapshot,
): { score: number; reasons: string[]; risks: string[] } {
  const reasons: string[] = [];
  const risks: string[] = [];
  const price = snap.price;
  let acc = 0;
  let w = 0;
  const add = (weight: number, pts: number) => {
    acc += weight * pts;
    w += weight;
  };

  const rsi = strategy === "intraday" ? (ind.rsiHour ?? ind.rsi) : ind.rsi;
  if (rsi != null) {
    const band =
      strategy === "intraday"
        ? [38, 68, 22, 82]
        : strategy === "swing"
          ? [42, 66, 28, 78]
          : [35, 65, 20, 82];
    add(1.2, lerpScore(rsi, band[0]!, band[1]!, band[2]!, band[3]!));
    if (rsi >= 45 && rsi <= 65) reasons.push(`RSI ${rsi.toFixed(0)} — momentum sehat`);
    else if (rsi > 72) risks.push(`RSI ${rsi.toFixed(0)} jenuh beli`);
    else if (rsi < 32) risks.push(`RSI ${rsi.toFixed(0)} lemah`);
  }

  if (ind.ema9 != null && strategy === "intraday") {
    const above = price >= ind.ema9;
    add(1.1, above ? 86 : 28);
    if (above) reasons.push("Harga di atas EMA10");
    else risks.push("Harga di bawah EMA10");
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
    add(0.7, clamp(50 + ind.sma50Slope * 1.4));
  }

  if (ind.macdHist != null) {
    add(1, ind.macdHist > 0 ? 80 : 36);
    if (ind.macdHist > 0) reasons.push("MACD histogram positif");
    else if (strategy !== "intraday") risks.push("MACD belum konfirmasi");
  }

  if (ind.rvol != null) {
    if (strategy === "intraday") {
      add(1.4, clamp(30 + Math.min(ind.rvol, 4) * 18));
      if (ind.rvol >= 1.4) reasons.push(`Volume ${ind.rvol.toFixed(1)}× rata-rata`);
      else if (ind.rvol < 0.8) risks.push("Volume tipis");
    } else {
      add(0.6, clamp(40 + Math.min(ind.rvol, 3) * 12));
    }
  }

  if (ind.roc10 != null) {
    if (strategy === "intraday") add(0.9, lerpScore(ind.roc10, 0.4, 8, -12, 18));
    else if (strategy === "swing") add(0.8, lerpScore(ind.roc10, 0, 10, -16, 22));
    else add(0.4, lerpScore(ind.roc10, -6, 8, -30, 28));
  }

  if (ind.pos52w != null) {
    if (strategy === "intraday") add(0.5, lerpScore(ind.pos52w, 55, 88, 15, 99));
    else if (strategy === "swing") add(0.6, lerpScore(ind.pos52w, 40, 80, 10, 97));
    else add(1.1, lerpScore(ind.pos52w, 28, 72, 5, 96));
    if (strategy === "invest" && ind.pos52w > 88) risks.push("Dekat puncak 52 minggu");
    if (strategy === "invest" && ind.pos52w < 30) reasons.push("Masih diskon vs 52 minggu");
  }

  if (ind.atrPct != null) {
    if (strategy === "intraday") add(0.6, lerpScore(ind.atrPct, 1.4, 4.2, 0.4, 12));
    else if (strategy === "swing") add(0.5, lerpScore(ind.atrPct, 1.2, 3.8, 0.4, 10));
    else add(0.7, lerpScore(ind.atrPct, 0.8, 2.8, 0.3, 8));
    if (strategy === "invest" && ind.atrPct > 6) risks.push("Volatilitas tinggi untuk investasi");
  }

  if (snap.recommend != null) {
    add(0.4, clamp(50 + snap.recommend * 40));
  }

  if (snap.changePct <= -5 && strategy === "intraday") {
    add(0.8, 18);
    risks.push("Koreksi harian dalam");
  }

  const score = w > 0 ? acc / w : 50;
  return { score: clamp(score), reasons: reasons.slice(0, 4), risks: risks.slice(0, 3) };
}

function fundamentalScore(
  strategy: StrategyId,
  snap: IdxSnapshot,
): { score: number; reasons: string[]; risks: string[] } {
  const reasons: string[] = [];
  const risks: string[] = [];
  const f = snap.fundamentals;
  let acc = 46;

  if (strategy === "intraday") {
    if (snap.value >= 20e9) {
      acc += 16;
      reasons.push("Likuiditas sesi kuat");
    } else if (snap.value >= 8e9) acc += 10;
    else if (snap.value >= 3e9) acc += 2;
    else {
      acc -= 16;
      risks.push("Nilai transaksi rendah");
    }
  } else if (snap.value >= 8e9) acc += 6;
  else if (snap.value < 1e9) {
    acc -= 8;
    risks.push("Likuiditas menengah ke bawah");
  }

  if (snap.size === "mega") acc += strategy === "invest" ? 10 : 6;
  else if (snap.size === "large") acc += strategy === "invest" ? 8 : 5;
  else if (snap.size === "small") {
    acc -= strategy === "invest" ? 12 : 3;
    if (strategy === "invest") risks.push("Kapitalisasi kecil");
  }

  if (snap.flags.lq45) {
    acc += strategy === "intraday" ? 5 : 8;
    if (strategy !== "intraday") reasons.push("Anggota LQ45");
  }
  if (snap.flags.idx30) acc += 3;
  if (snap.flags.soe && strategy === "invest") {
    acc += 3;
    reasons.push("BUMN / kualitas institusi");
  }

  if (f.pe != null && f.pe > 0) {
    const pePts = lerpScore(f.pe, 6, 18, 1, 55);
    acc += (strategy === "invest" ? 0.18 : 0.06) * (pePts - 50);
    if (strategy === "invest" && f.pe >= 6 && f.pe <= 16) {
      reasons.push(`PE ${f.pe.toFixed(1)}× — valuasi masuk akal`);
    } else if (strategy === "invest" && f.pe > 40) {
      risks.push(`PE ${f.pe.toFixed(0)}× mahal`);
    }
  } else if (strategy === "invest") {
    acc -= 6;
  }

  if (f.pb != null && f.pb > 0 && strategy !== "intraday") {
    acc += 0.08 * (lerpScore(f.pb, 0.6, 2.4, 0.15, 12) - 50);
  }

  if (f.roe != null) {
    if (f.roe >= 15) {
      acc += strategy === "invest" ? 12 : 5;
      if (strategy === "invest") reasons.push(`ROE ${f.roe.toFixed(0)}%`);
    } else if (f.roe >= 8) acc += strategy === "invest" ? 6 : 2;
    else if (f.roe < 0) {
      acc -= strategy === "invest" ? 12 : 4;
      if (strategy === "invest") risks.push("ROE negatif");
    }
  }

  if (f.divYield != null && f.divYield >= 2) {
    acc += strategy === "invest" ? Math.min(12, f.divYield) : strategy === "swing" ? 4 : 1;
    if (strategy === "invest" && f.divYield >= 3) {
      reasons.push(`Imbal hasil dividen ${f.divYield.toFixed(1)}%`);
    }
  } else if (strategy === "invest" && snap.flags.dividend) {
    acc += 4;
  }

  if (f.de != null && snap.sector !== "Perbankan" && strategy === "invest") {
    if (f.de > 2.2) {
      acc -= 8;
      risks.push("Utang relatif tinggi");
    } else if (f.de < 0.8) acc += 3;
  }

  if (f.epsGrowth != null && strategy !== "intraday") {
    if (f.epsGrowth >= 10) acc += 6;
    else if (f.epsGrowth < -15) acc -= 6;
  }

  if (snap.flags.shariah && strategy !== "intraday") acc += 2;

  if (snap.price < 50 && snap.size === "small" && snap.value < 5e9) {
    acc -= 14;
    risks.push("Harga rendah dan kurang likuid");
  }

  return { score: clamp(acc), reasons: reasons.slice(0, 3), risks: risks.slice(0, 2) };
}

function verdictOf(total: number): Verdict {
  if (total >= 68) return "beli";
  if (total >= 56) return "pertimbangkan";
  return "tunggu";
}

function levelsFor(strategy: StrategyId, snap: IdxSnapshot, ind: Indicators): Levels {
  const atr = ind.atr && ind.atr > 0 ? ind.atr : snap.price * 0.02;
  const stopMul = strategy === "intraday" ? 1.05 : strategy === "swing" ? 1.7 : 2.4;
  const tgtMul = strategy === "intraday" ? 1.6 : strategy === "swing" ? 2.4 : 3.2;
  const below = [snap.sma20, snap.sma50, snap.sma200, snap.low, snap.week52Low].filter(
    (n): n is number => n != null && n < snap.price * 0.997,
  );
  const above = [snap.sma20, snap.sma50, snap.high, snap.week52High].filter(
    (n): n is number => n != null && n > snap.price * 1.003,
  );
  const support = below.length ? Math.max(...below) : snap.price - atr * stopMul;
  const resistance = above.length ? Math.min(...above) : snap.price + atr * tgtMul;
  return {
    support: round(support),
    resistance: round(resistance),
    stop: round(Math.min(support, snap.price - atr * stopMul)),
    target: round(Math.max(resistance, snap.price + atr * tgtMul)),
  };
}

export type ScoredRow = Omit<StockResult, "thesis" | "headlines">;

export function scoreStock(strategy: StrategyId, snap: IdxSnapshot): ScoredRow {
  const indicators = indicatorsFromSnap(snap);
  const t = technicalScore(strategy, indicators, snap);
  const f = fundamentalScore(strategy, snap);
  const weights = STRATEGIES[strategy].weights;
  const sentiment = 50;
  const total = clamp(
    t.score * weights.technical + f.score * weights.fundamental + sentiment * weights.sentiment,
  );
  const reasons = [...t.reasons, ...f.reasons].filter((v, i, a) => a.indexOf(v) === i).slice(0, 5);
  const risks = [...t.risks, ...f.risks].filter((v, i, a) => a.indexOf(v) === i).slice(0, 4);
  return {
    symbol: snap.symbol,
    name: snap.name,
    sector: snap.sector,
    industry: snap.industry,
    size: snap.size,
    flags: snap.flags,
    price: snap.price,
    prevClose: snap.prevClose,
    changePct: snap.changePct,
    volume: snap.volume,
    value: snap.value,
    spark: [],
    week52High: snap.week52High,
    week52Low: snap.week52Low,
    scores: { total, technical: t.score, fundamental: f.score, sentiment },
    verdict: verdictOf(total),
    reasons,
    risks,
    levels: levelsFor(strategy, snap, indicators),
    indicators,
    fundamentals: snap.fundamentals,
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
  if (strategy === "intraday") return 3e9;
  if (strategy === "swing") return 1e9;
  return 4e8;
}

