import type { ChartBundle, Indicators, Ohlcv } from "./types";

function finite(values: Array<number | null | undefined>): number[] {
  return values.filter((v): v is number => typeof v === "number" && Number.isFinite(v));
}

export function sma(values: number[], period: number): number | null {
  if (values.length < period) return null;
  let sum = 0;
  for (let i = values.length - period; i < values.length; i++) sum += values[i]!;
  return sum / period;
}

export function smaAt(values: number[], period: number, offset = 0): number | null {
  const end = values.length - offset;
  if (end < period) return null;
  let sum = 0;
  for (let i = end - period; i < end; i++) sum += values[i]!;
  return sum / period;
}

export function emaSeries(values: number[], period: number): number[] | null {
  if (values.length < period) return null;
  const k = 2 / (period + 1);
  const out: number[] = new Array(values.length);
  let acc = 0;
  for (let i = 0; i < period; i++) acc += values[i]!;
  acc /= period;
  for (let i = 0; i < period - 1; i++) out[i] = acc;
  out[period - 1] = acc;
  for (let i = period; i < values.length; i++) {
    acc = values[i]! * k + acc * (1 - k);
    out[i] = acc;
  }
  return out;
}

export function ema(values: number[], period: number): number | null {
  const series = emaSeries(values, period);
  return series ? series[series.length - 1]! : null;
}

export function rsi(values: number[], period = 14): number | null {
  if (values.length < period + 1) return null;
  let avgG = 0;
  let avgL = 0;
  for (let i = 1; i <= period; i++) {
    const d = values[i]! - values[i - 1]!;
    if (d >= 0) avgG += d;
    else avgL -= d;
  }
  avgG /= period;
  avgL /= period;
  for (let i = period + 1; i < values.length; i++) {
    const d = values[i]! - values[i - 1]!;
    const g = d > 0 ? d : 0;
    const l = d < 0 ? -d : 0;
    avgG = (avgG * (period - 1) + g) / period;
    avgL = (avgL * (period - 1) + l) / period;
  }
  if (avgL === 0) return 100;
  const rs = avgG / avgL;
  return 100 - 100 / (1 + rs);
}

export function macdLast(values: number[]): { macd: number; signal: number; hist: number } | null {
  const e12 = emaSeries(values, 12);
  const e26 = emaSeries(values, 26);
  if (!e12 || !e26) return null;
  const line: number[] = [];
  for (let i = 25; i < values.length; i++) line.push(e12[i]! - e26[i]!);
  const sig = emaSeries(line, 9);
  if (!sig) return null;
  const macd = line[line.length - 1]!;
  const signal = sig[sig.length - 1]!;
  return { macd, signal, hist: macd - signal };
}

export function atr(bars: Ohlcv[], period = 14): number | null {
  if (bars.length < period + 1) return null;
  const trs: number[] = [];
  for (let i = 1; i < bars.length; i++) {
    const b = bars[i]!;
    const prev = bars[i - 1]!;
    trs.push(Math.max(b.h - b.l, Math.abs(b.h - prev.c), Math.abs(b.l - prev.c)));
  }
  return sma(trs, period);
}

export function roc(values: number[], period: number): number | null {
  if (values.length <= period) return null;
  const prev = values[values.length - 1 - period]!;
  if (prev === 0) return null;
  return ((values[values.length - 1]! - prev) / prev) * 100;
}

export function computeIndicators(chart: ChartBundle): Indicators {
  const closes = finite(chart.bars.map((b) => b.c));
  const volumes = finite(chart.bars.map((b) => b.v));
  const lastVol = volumes[volumes.length - 1] ?? chart.volume;
  const avgVol = sma(volumes.slice(0, -1), Math.min(20, Math.max(5, volumes.length - 1)));
  const macd = macdLast(closes);
  const sma50Now = sma(closes, 50);
  const sma50Prev = smaAt(closes, 50, 5);
  const sma200Now = sma(closes, 200);
  const sma200Prev = smaAt(closes, 200, 10);
  const atrVal = atr(chart.bars, 14);
  const price = chart.price || closes[closes.length - 1] || 0;
  const range = chart.week52High - chart.week52Low;
  return {
    rsi: rsi(closes, 14),
    sma20: sma(closes, 20),
    sma50: sma50Now,
    sma200: sma200Now,
    ema9: ema(closes, 9),
    macd: macd?.macd ?? null,
    macdHist: macd?.hist ?? null,
    atr: atrVal,
    atrPct: atrVal && price ? (atrVal / price) * 100 : null,
    rvol: avgVol && avgVol > 0 ? lastVol / avgVol : null,
    roc10: roc(closes, 10),
    pos52w: range > 0 ? ((price - chart.week52Low) / range) * 100 : null,
    sma50Slope:
      sma50Now && sma50Prev && sma50Prev !== 0 ? ((sma50Now - sma50Prev) / sma50Prev) * 100 : null,
    sma200Slope:
      sma200Now && sma200Prev && sma200Prev !== 0
        ? ((sma200Now - sma200Prev) / sma200Prev) * 100
        : null,
  };
}

export function lastBarsSpark(bars: Ohlcv[], n = 24): number[] {
  const closes = bars.map((b) => b.c).filter((c) => Number.isFinite(c));
  if (closes.length <= n) return closes;
  return closes.slice(-n);
}

export function nearestSupport(bars: Ohlcv[], price: number): number {
  const window = bars.slice(-40);
  const lows = window.map((b) => b.l).filter((v) => v < price * 0.995);
  if (!lows.length) {
    const min = Math.min(...window.map((b) => b.l));
    return Number.isFinite(min) ? min : price * 0.97;
  }
  return Math.max(...lows);
}

export function nearestResistance(bars: Ohlcv[], price: number): number {
  const window = bars.slice(-40);
  const highs = window.map((b) => b.h).filter((v) => v > price * 1.005);
  if (!highs.length) {
    const max = Math.max(...window.map((b) => b.h));
    return Number.isFinite(max) ? max : price * 1.03;
  }
  return Math.min(...highs);
}

export function clamp(n: number, lo = 0, hi = 100): number {
  return Math.min(hi, Math.max(lo, n));
}

export function round(n: number, digits = 0): number {
  const p = 10 ** digits;
  return Math.round(n * p) / p;
}
