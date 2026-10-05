import { mapSector, sizeFromMcap, cleanName } from "./sectors";
import type { Fundamentals, Indicators, MarketSnapshot, Sector, Size, StockFlags } from "./types";
import { UNIVERSE_BY_SYMBOL } from "./universe";
import { marketStatus } from "./yahoo";

const TV_URL = "https://scanner.tradingview.com/indonesia/scan";

const COLUMNS = [
  "name",
  "description",
  "close",
  "change",
  "open",
  "high",
  "low",
  "volume",
  "Value.Traded",
  "RSI",
  "RSI|60",
  "SMA20",
  "SMA50",
  "SMA200",
  "EMA10",
  "MACD.macd",
  "MACD.signal",
  "ATR",
  "Mom",
  "relative_volume_10d_calc",
  "price_52_week_high",
  "price_52_week_low",
  "Perf.W",
  "Perf.1M",
  "Perf.3M",
  "Perf.6M",
  "market_cap_basic",
  "price_earnings_ttm",
  "price_book_ratio",
  "return_on_equity",
  "debt_to_equity",
  "dividends_yield_current",
  "earnings_per_share_diluted_yoy_growth_ttm",
  "sector",
  "industry",
  "Recommend.All",
  "Volatility.D",
] as const;

export type IdxSnapshot = {
  symbol: string;
  name: string;
  sector: Sector;
  industry: string;
  size: Size;
  flags: StockFlags;
  price: number;
  prevClose: number;
  changePct: number;
  open: number;
  high: number;
  low: number;
  volume: number;
  value: number;
  rsi: number | null;
  rsiHour: number | null;
  sma20: number | null;
  sma50: number | null;
  sma200: number | null;
  ema10: number | null;
  macd: number | null;
  macdSignal: number | null;
  atr: number | null;
  mom: number | null;
  rvol: number | null;
  week52High: number | null;
  week52Low: number | null;
  perfW: number | null;
  perf1M: number | null;
  perf3M: number | null;
  perf6M: number | null;
  recommend: number | null;
  volatility: number | null;
  fundamentals: Fundamentals;
};

type CacheEntry<T> = { at: number; value: T };

let snapCache: CacheEntry<IdxSnapshot[]> | null = null;
let marketCache: CacheEntry<MarketSnapshot> | null = null;

const SNAP_TTL = 8 * 60 * 1000;
const MARKET_TTL = 60 * 1000;

function num(v: unknown): number | null {
  return typeof v === "number" && Number.isFinite(v) ? v : null;
}

function str(v: unknown): string {
  return typeof v === "string" ? v : v == null ? "" : String(v);
}

function asRoePct(v: number | null): number | null {
  if (v == null) return null;
  const pct = Math.abs(v) <= 1 ? v * 100 : v;
  if (!Number.isFinite(pct)) return null;
  return Math.max(-80, Math.min(200, pct));
}

function asClamped(v: number | null, lo: number, hi: number): number | null {
  if (v == null || !Number.isFinite(v)) return null;
  return Math.max(lo, Math.min(hi, v));
}

async function tvScan(body: unknown, timeoutMs = 10000): Promise<unknown> {
  const res = await fetch(TV_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
      Origin: "https://www.tradingview.com",
      Referer: "https://www.tradingview.com/",
    },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(timeoutMs),
  });
  if (!res.ok) throw new Error(`TradingView ${res.status}`);
  return res.json();
}

function parseRow(symbolRaw: string, d: unknown[]): IdxSnapshot | null {
  const get = (i: number) => d[i];
  const code = str(get(0)).toUpperCase() || symbolRaw.replace(/^IDX:/i, "").toUpperCase();
  if (!/^[A-Z]{4}$/.test(code)) return null;
  const price = num(get(2));
  if (price == null || price <= 0) return null;

  const changePct = num(get(3)) ?? 0;
  const prevClose = changePct !== -100 ? price / (1 + changePct / 100) : price;
  const overlay = UNIVERSE_BY_SYMBOL.get(code);
  const industry = str(get(34));
  const tvSector = str(get(33));
  const mcap = num(get(26));
  const pe = asClamped(num(get(27)), -50, 400);
  const pb = asClamped(num(get(28)), 0, 80);
  const roe = asRoePct(num(get(29)));
  const de = asClamped(num(get(30)), 0, 40);
  const divYield = asClamped(num(get(31)), 0, 40);
  const epsGrowth = asClamped(num(get(32)), -90, 120);

  return {
    symbol: code,
    name: overlay?.name ?? cleanName(str(get(1))) ?? code,
    sector: overlay?.sector ?? mapSector(tvSector, industry),
    industry,
    size: sizeFromMcap(mcap),
    flags: overlay?.flags ?? {},
    price,
    prevClose,
    changePct,
    open: num(get(4)) ?? price,
    high: num(get(5)) ?? price,
    low: num(get(6)) ?? price,
    volume: num(get(7)) ?? 0,
    value: num(get(8)) ?? price * (num(get(7)) ?? 0),
    rsi: num(get(9)),
    rsiHour: num(get(10)),
    sma20: num(get(11)),
    sma50: num(get(12)),
    sma200: num(get(13)),
    ema10: num(get(14)),
    macd: num(get(15)),
    macdSignal: num(get(16)),
    atr: num(get(17)),
    mom: num(get(18)),
    rvol: num(get(19)),
    week52High: num(get(20)),
    week52Low: num(get(21)),
    perfW: num(get(22)),
    perf1M: num(get(23)),
    perf3M: num(get(24)),
    perf6M: num(get(25)),
    recommend: num(get(35)),
    volatility: num(get(36)),
    fundamentals: {
      pe,
      pb,
      roe,
      de,
      divYield,
      epsGrowth,
      mcap,
    },
  };
}

export async function fetchIdxSnapshots(): Promise<IdxSnapshot[]> {
  if (snapCache && Date.now() - snapCache.at < SNAP_TTL) return snapCache.value;
  const payload = {
    columns: [...COLUMNS],
    filter: [{ left: "type", operation: "equal", right: "stock" }],
    options: { lang: "id" },
    markets: ["indonesia"],
    range: [0, 1000],
    sort: { sortBy: "Value.Traded", sortOrder: "desc" },
    ignore_unknown_fields: true,
  };
  const raw = (await tvScan(payload)) as {
    data?: Array<{ s?: string; d?: unknown[] }>;
  };
  const rows: IdxSnapshot[] = [];
  for (const item of raw.data ?? []) {
    if (!item.d) continue;
    const parsed = parseRow(item.s ?? "", item.d);
    if (parsed) rows.push(parsed);
  }
  if (rows.length < 40) throw new Error("Data emiten BEI tidak lengkap");
  snapCache = { at: Date.now(), value: rows };
  return rows;
}

export async function fetchIhsg(): Promise<MarketSnapshot> {
  if (marketCache && Date.now() - marketCache.at < MARKET_TTL) return marketCache.value;
  const { status, statusLabel } = marketStatus();
  try {
    const raw = (await tvScan(
      {
        symbols: { tickers: ["IDX:COMPOSITE"] },
        columns: ["name", "close", "change", "description"],
        ignore_unknown_fields: true,
      },
      8000,
    )) as { data?: Array<{ d?: unknown[] }> };
    const d = raw.data?.[0]?.d ?? [];
    const price = num(d[1]) ?? 0;
    const changePct = num(d[2]) ?? 0;
    const snapshot: MarketSnapshot = {
      price,
      changePct,
      name: str(d[3]) || "IHSG",
      asOf: Date.now(),
      status,
      statusLabel,
      trend: changePct > 0.15 ? "naik" : changePct < -0.15 ? "turun" : "datar",
    };
    marketCache = { at: Date.now(), value: snapshot };
    return snapshot;
  } catch {
    const snapshot: MarketSnapshot = {
      price: 0,
      changePct: 0,
      name: "IHSG",
      asOf: Date.now(),
      status,
      statusLabel,
      trend: "datar",
    };
    return snapshot;
  }
}

export function indicatorsFromSnap(snap: IdxSnapshot): Indicators {
  const macdHist =
    snap.macd != null && snap.macdSignal != null ? snap.macd - snap.macdSignal : null;
  const atr = snap.atr;
  const price = snap.price;
  const range =
    snap.week52High != null && snap.week52Low != null ? snap.week52High - snap.week52Low : 0;
  return {
    rsi: snap.rsi,
    rsiHour: snap.rsiHour,
    sma20: snap.sma20,
    sma50: snap.sma50,
    sma200: snap.sma200,
    ema9: snap.ema10,
    macd: snap.macd,
    macdHist,
    atr,
    atrPct: atr && price ? (atr / price) * 100 : snap.volatility,
    rvol: snap.rvol,
    roc10: snap.perfW,
    pos52w: range > 0 && snap.week52Low != null ? ((price - snap.week52Low) / range) * 100 : null,
    sma50Slope: snap.perf1M,
    sma200Slope: snap.perf6M,
  };
}
