import type { ChartBundle, MarketSnapshot, Ohlcv } from "./types";
import { yahooSymbol } from "./universe";

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36";

const TTL_MS = 12 * 60 * 1000;
type CacheEntry<T> = { at: number; value: T };
const chartCache = new Map<string, CacheEntry<ChartBundle | null>>();

function fromCache<T>(entry: CacheEntry<T> | undefined | null): T | null {
  if (!entry) return null;
  if (Date.now() - entry.at > TTL_MS) return null;
  return entry.value;
}

async function mapPool<T, R>(
  items: T[],
  limit: number,
  fn: (item: T, index: number) => Promise<R>,
): Promise<R[]> {
  const out = new Array<R>(items.length);
  let cursor = 0;
  async function worker() {
    while (true) {
      const i = cursor++;
      if (i >= items.length) return;
      out[i] = await fn(items[i]!, i);
    }
  }
  const n = Math.min(limit, items.length);
  await Promise.all(Array.from({ length: n }, worker));
  return out;
}

type YahooChart = {
  chart?: {
    result?: Array<{
      meta?: {
        symbol?: string;
        shortName?: string;
        longName?: string;
        regularMarketPrice?: number;
        chartPreviousClose?: number;
        previousClose?: number;
        regularMarketChangePercent?: number;
        regularMarketVolume?: number;
        regularMarketDayHigh?: number;
        regularMarketDayLow?: number;
        fiftyTwoWeekHigh?: number;
        fiftyTwoWeekLow?: number;
        currency?: string;
        regularMarketTime?: number;
      };
      timestamp?: number[];
      indicators?: {
        quote?: Array<{
          open?: Array<number | null>;
          high?: Array<number | null>;
          low?: Array<number | null>;
          close?: Array<number | null>;
          volume?: Array<number | null>;
        }>;
      };
      events?: {
        dividends?: Record<string, { amount?: number; date?: number }>;
      };
    }>;
  };
};

async function fetchJson<T>(url: string, timeoutMs = 4000): Promise<T | null> {
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": UA, Accept: "application/json" },
      signal: AbortSignal.timeout(timeoutMs),
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

export async function fetchChart(symbol: string, range = "6mo"): Promise<ChartBundle | null> {
  const y = yahooSymbol(symbol);
  const key = `${y}:${range}`;
  const hit = fromCache(chartCache.get(key));
  if (hit !== null) return hit;

  const url = `https://query2.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(y)}?range=${range}&interval=1d&events=div`;
  const data = await fetchJson<YahooChart>(url, 6000);
  const result = data?.chart?.result?.[0];
  if (!result?.timestamp?.length || !result.indicators?.quote?.[0]) {
    chartCache.set(key, { at: Date.now(), value: null });
    return null;
  }
  const q = result.indicators.quote[0];
  const bars: Ohlcv[] = [];
  for (let i = 0; i < result.timestamp.length; i++) {
    const o = q.open?.[i];
    const h = q.high?.[i];
    const l = q.low?.[i];
    const c = q.close?.[i];
    const v = q.volume?.[i];
    if (![o, h, l, c].every((x) => typeof x === "number" && Number.isFinite(x))) continue;
    bars.push({
      t: result.timestamp[i]! * 1000,
      o: o as number,
      h: h as number,
      l: l as number,
      c: c as number,
      v: typeof v === "number" && Number.isFinite(v) ? v : 0,
    });
  }
  if (bars.length < 12) {
    chartCache.set(key, { at: Date.now(), value: null });
    return null;
  }
  const meta = result.meta ?? {};
  const last = bars[bars.length - 1]!;
  const price = meta.regularMarketPrice ?? last.c;
  const prev = meta.chartPreviousClose ?? meta.previousClose ?? bars[bars.length - 2]?.c ?? last.c;
  const dividends = Object.values(result.events?.dividends ?? {})
    .map((d) => ({ amount: d.amount ?? 0, date: (d.date ?? 0) * 1000 }))
    .filter((d) => d.amount > 0)
    .sort((a, b) => b.date - a.date);
  const bundle: ChartBundle = {
    symbol: y.replace(/\.JK$/i, ""),
    name: meta.shortName ?? meta.longName ?? symbol,
    price,
    prevClose: prev,
    changePct: prev ? ((price - prev) / prev) * 100 : (meta.regularMarketChangePercent ?? 0),
    volume: meta.regularMarketVolume ?? last.v,
    dayHigh: meta.regularMarketDayHigh ?? last.h,
    dayLow: meta.regularMarketDayLow ?? last.l,
    week52High: meta.fiftyTwoWeekHigh ?? Math.max(...bars.map((b) => b.h)),
    week52Low: meta.fiftyTwoWeekLow ?? Math.min(...bars.map((b) => b.l)),
    currency: meta.currency ?? "IDR",
    bars,
    dividends,
  };
  chartCache.set(key, { at: Date.now(), value: bundle });
  return bundle;
}

export async function fetchCharts(
  symbols: string[],
  range = "6mo",
  max = 12,
): Promise<ChartBundle[]> {
  try {
    const rows = await mapPool(symbols.slice(0, max), 6, async (symbol) => fetchChart(symbol, range));
    return rows.filter((r): r is ChartBundle => r !== null);
  } catch {
    return [];
  }
}

export function jakartaParts(date = new Date()) {
  const fmt = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Jakarta",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const parts = Object.fromEntries(fmt.formatToParts(date).map((p) => [p.type, p.value]));
  const hour = Number(parts.hour);
  const minute = Number(parts.minute);
  const mins = hour * 60 + minute;
  const weekday = parts.weekday;
  const isWeekend = weekday === "Sat" || weekday === "Sun";
  return { hour, minute, mins, weekday, isWeekend, parts };
}

export function marketStatus(): Pick<MarketSnapshot, "status" | "statusLabel"> {
  const { mins, isWeekend } = jakartaParts();
  if (isWeekend) return { status: "closed", statusLabel: "Tutup (akhir pekan)" };
  if (mins < 9 * 60) return { status: "pre", statusLabel: "Pra-pembukaan" };
  if (mins >= 9 * 60 && mins < 11 * 60 + 30) return { status: "open", statusLabel: "Sesi 1" };
  if (mins >= 11 * 60 + 30 && mins < 13 * 60 + 30) return { status: "break", statusLabel: "Istirahat" };
  if (mins >= 13 * 60 + 30 && mins < 16 * 60) return { status: "open", statusLabel: "Sesi 2" };
  return { status: "closed", statusLabel: "Tutup" };
}
