import {
  atrSeries,
  emaSeries,
  macdHistSeries,
  rsiSeries,
  smaSeries,
} from "./indicators";
import type {
  BacktestResult,
  BacktestSymbolRow,
  BacktestTrade,
  ChartBundle,
  EquityPoint,
  Lookback,
  Ohlcv,
  StrategyId,
} from "./types";
import { UNIVERSE_BY_SYMBOL, bareSymbol, pickBacktestSymbols } from "./universe";
import { fetchChart, fetchCharts } from "./yahoo";

const FEE = 0.0015;
const START = 100_000_000;
const cache = new Map<string, { at: number; value: BacktestResult }>();
const TTL = 12 * 60 * 1000;

type Prepared = {
  symbol: string;
  name: string;
  bars: Ohlcv[];
  close: number[];
  sma20: (number | null)[];
  sma50: (number | null)[];
  sma200: (number | null)[];
  ema9: number[] | null;
  rsi: (number | null)[];
  macd: (number | null)[];
  atr: (number | null)[];
  rvol: (number | null)[];
  byT: Map<number, number>;
};

type OpenPos = {
  symbol: string;
  name: string;
  shares: number;
  entry: number;
  entryT: number;
  stop: number;
  target: number;
  maxHold: number;
  barsHeld: number;
  reason: string;
};

type Pending = {
  symbol: string;
  reason: string;
};

function downsample(points: EquityPoint[], max = 90): EquityPoint[] {
  if (points.length <= max) return points;
  const step = Math.ceil(points.length / max);
  const out: EquityPoint[] = [];
  for (let i = 0; i < points.length; i += step) out.push(points[i]!);
  const last = points[points.length - 1]!;
  if (out[out.length - 1]?.t !== last.t) out.push(last);
  return out;
}

function rules(strategy: StrategyId) {
  if (strategy === "intraday") {
    return { maxHold: 1, stopMul: 1.05, tgtMul: 1.6, maxPos: 5, warmup: 40 };
  }
  if (strategy === "swing") {
    return { maxHold: 12, stopMul: 1.7, tgtMul: 2.4, maxPos: 8, warmup: 60 };
  }
  return { maxHold: 40, stopMul: 2.4, tgtMul: 3.2, maxPos: 8, warmup: 210 };
}

function prepare(chart: ChartBundle): Prepared | null {
  const bars = chart.bars.filter((b) => Number.isFinite(b.c) && b.c > 0);
  if (bars.length < 40) return null;
  const close = bars.map((b) => b.c);
  const vol = bars.map((b) => b.v);
  const volSma = smaSeries(vol, 10);
  const rvol = vol.map((v, i) => {
    const avg = volSma[i];
    return avg && avg > 0 ? v / avg : null;
  });
  return {
    symbol: chart.symbol,
    name: UNIVERSE_BY_SYMBOL.get(chart.symbol)?.name ?? chart.name,
    bars,
    close,
    sma20: smaSeries(close, 20),
    sma50: smaSeries(close, 50),
    sma200: smaSeries(close, 200),
    ema9: emaSeries(close, 9),
    rsi: rsiSeries(close, 14),
    macd: macdHistSeries(close),
    atr: atrSeries(bars, 14),
    rvol,
    byT: new Map(bars.map((b, i) => [b.t, i])),
  };
}

function signal(strategy: StrategyId, p: Prepared, i: number): string | null {
  const price = p.close[i]!;
  const rsi = p.rsi[i];
  const sma20 = p.sma20[i];
  const sma50 = p.sma50[i];
  const sma200 = p.sma200[i];
  const ema9 = p.ema9?.[i];
  const macd = p.macd[i];
  const rvol = p.rvol[i];

  if (strategy === "intraday") {
    if (ema9 == null || sma20 == null || rsi == null) return null;
    if (price < ema9 || price < sma20) return null;
    if (rsi < 38 || rsi > 70) return null;
    if (rvol != null && rvol < 1.1) return null;
    return "Momentum harian di atas EMA9/SMA20";
  }

  if (strategy === "swing") {
    if (sma20 == null || sma50 == null || rsi == null || macd == null) return null;
    if (price < sma20 || price < sma50) return null;
    if (macd <= 0) return null;
    if (rsi < 42 || rsi > 68) return null;
    return "Tren SMA20/50 + MACD positif";
  }

  if (sma50 == null || sma200 == null || rsi == null) return null;
  if (price < sma200 || sma50 < sma200) return null;
  if (rsi > 68) return null;
  const window = p.close.slice(Math.max(0, i - 251), i + 1);
  const hi = Math.max(...window);
  if (hi > 0 && price / hi > 0.92) return null;
  return "Di atas SMA200, tren menengah positif";
}

function shouldExit(strategy: StrategyId, p: Prepared, i: number): boolean {
  const price = p.close[i]!;
  if (strategy === "intraday") return true;
  if (strategy === "swing") {
    const sma20 = p.sma20[i];
    const macd = p.macd[i];
    return (sma20 != null && price < sma20) || (macd != null && macd < 0);
  }
  const sma200 = p.sma200[i];
  return sma200 != null && price < sma200;
}

function simulate(strategy: StrategyId, books: Prepared[], ihsg?: ChartBundle | null): BacktestResult {
  const spec = rules(strategy);
  const times = [...new Set(books.flatMap((b) => b.bars.map((x) => x.t)))].sort((a, b) => a - b);
  const cashStart = START;
  let cash = cashStart;
  const opens: OpenPos[] = [];
  const pending = new Map<string, Pending>();
  const cooldown = new Map<string, number>();
  const trades: BacktestTrade[] = [];
  const equity: EquityPoint[] = [];
  const bookBySym = new Map(books.map((b) => [b.symbol, b]));

  const mark = (t: number) => {
    let v = cash;
    for (const pos of opens) {
      const book = bookBySym.get(pos.symbol);
      const idx = book?.byT.get(t);
      const px = idx != null ? book!.close[idx]! : pos.entry;
      v += pos.shares * px;
    }
    return v;
  };

  const closePos = (pos: OpenPos, t: number, price: number, why: BacktestTrade["exitReason"]) => {
    const proceeds = pos.shares * price * (1 - FEE);
    cash += proceeds;
    const retPct = ((price * (1 - FEE)) / (pos.entry * (1 + FEE)) - 1) * 100;
    trades.push({
      symbol: pos.symbol,
      name: pos.name,
      entryDate: pos.entryT,
      exitDate: t,
      entry: pos.entry,
      exit: price,
      retPct,
      reason: pos.reason,
      exitReason: why,
      holdDays: Math.max(1, pos.barsHeld),
    });
    cooldown.set(pos.symbol, t);
  };

  for (const t of times) {
    for (let i = opens.length - 1; i >= 0; i--) {
      const pos = opens[i]!;
      const book = bookBySym.get(pos.symbol);
      const idx = book?.byT.get(t);
      if (idx == null || !book) continue;
      const bar = book.bars[idx]!;
      pos.barsHeld += 1;
      let exitPx: number | null = null;
      let why: BacktestTrade["exitReason"] | null = null;
      if (bar.l <= pos.stop) {
        exitPx = Math.min(bar.o, pos.stop);
        why = "stop";
      } else if (bar.h >= pos.target) {
        exitPx = pos.target;
        why = "target";
      } else if (pos.barsHeld >= pos.maxHold) {
        exitPx = bar.c;
        why = "time";
      } else if (shouldExit(strategy, book, idx) && pos.barsHeld >= 1) {
        exitPx = bar.c;
        why = "signal";
      }
      if (exitPx != null && why) {
        closePos(pos, t, exitPx, why);
        opens.splice(i, 1);
      }
    }

    for (const book of books) {
      const idx = book.byT.get(t);
      if (idx == null) continue;
      const queued = pending.get(book.symbol);
      if (!queued) continue;
      pending.delete(book.symbol);
      if (opens.some((p) => p.symbol === book.symbol)) continue;
      if (opens.length >= spec.maxPos) continue;
      const bar = book.bars[idx]!;
      const atr = book.atr[idx] && book.atr[idx]! > 0 ? book.atr[idx]! : bar.c * 0.02;
      const slots = spec.maxPos - opens.length;
      const alloc = (cash / slots) * 0.98;
      const fill = bar.o * (1 + FEE);
      if (alloc < fill * 100) continue;
      const shares = Math.floor(alloc / fill);
      if (shares <= 0) continue;
      cash -= shares * fill;
      const stop = fill / (1 + FEE) - atr * spec.stopMul;
      const target = fill / (1 + FEE) + atr * spec.tgtMul;
      opens.push({
        symbol: book.symbol,
        name: book.name,
        shares,
        entry: fill / (1 + FEE),
        entryT: t,
        stop,
        target,
        maxHold: spec.maxHold,
        barsHeld: 0,
        reason: queued.reason,
      });
    }

    if (opens.length < spec.maxPos) {
      for (const book of books) {
        if (opens.length >= spec.maxPos) break;
        if (opens.some((p) => p.symbol === book.symbol) || pending.has(book.symbol)) continue;
        const idx = book.byT.get(t);
        if (idx == null || idx < spec.warmup) continue;
        const lastExit = cooldown.get(book.symbol);
        if (lastExit != null) {
          const lastIdx = book.byT.get(lastExit);
          if (lastIdx != null && idx - lastIdx < 5) continue;
        }
        const why = signal(strategy, book, idx);
        if (why) pending.set(book.symbol, { symbol: book.symbol, reason: why });
      }
    }

    if (t >= (times[spec.warmup] ?? times[0]!)) {
      equity.push({ t, v: mark(t) });
    }
  }

  for (const pos of [...opens]) {
    const book = bookBySym.get(pos.symbol);
    const last = book?.bars[book.bars.length - 1];
    if (last) closePos(pos, last.t, last.c, "time");
  }
  opens.length = 0;

  const finalEquity = equity[equity.length - 1]?.v ?? cash;
  const totalReturn = ((finalEquity - cashStart) / cashStart) * 100;
  const wins = trades.filter((x) => x.retPct > 0);
  const losses = trades.filter((x) => x.retPct <= 0);
  const sumW = wins.reduce((a, b) => a + b.retPct, 0);
  const sumL = Math.abs(losses.reduce((a, b) => a + b.retPct, 0));
  let peak = cashStart;
  let maxDd = 0;
  for (const p of equity) {
    peak = Math.max(peak, p.v);
    if (peak > 0) maxDd = Math.max(maxDd, ((peak - p.v) / peak) * 100);
  }

  let vsBuyHold: number | null = null;
  if (ihsg && ihsg.bars.length > spec.warmup) {
    const first = ihsg.bars[spec.warmup]?.c ?? ihsg.bars[0]!.c;
    const last = ihsg.bars[ihsg.bars.length - 1]!.c;
    if (first > 0) vsBuyHold = totalReturn - ((last - first) / first) * 100;
  }

  const grouped = new Map<string, BacktestTrade[]>();
  for (const tr of trades) {
    const arr = grouped.get(tr.symbol) ?? [];
    arr.push(tr);
    grouped.set(tr.symbol, arr);
  }
  const bySymbol: BacktestSymbolRow[] = [...grouped.entries()]
    .map(([symbol, rows]) => {
      const w = rows.filter((r) => r.retPct > 0).length;
      const ret = rows.reduce((a, b) => a + b.retPct, 0);
      return {
        symbol,
        name: rows[0]!.name,
        trades: rows.length,
        winRate: rows.length ? (w / rows.length) * 100 : 0,
        retPct: ret,
      };
    })
    .sort((a, b) => b.retPct - a.retPct)
    .slice(0, 8);

  return {
    strategy,
    sector: "Semua",
    lookback: "1y",
    asOf: Date.now(),
    scanned: books.length,
    used: books.length,
    trades: trades.slice(-50).reverse(),
    equity: downsample(equity),
    metrics: {
      totalReturn,
      winRate: trades.length ? (wins.length / trades.length) * 100 : 0,
      trades: trades.length,
      wins: wins.length,
      losses: losses.length,
      avgWin: wins.length ? sumW / wins.length : 0,
      avgLoss: losses.length ? -sumL / losses.length : 0,
      profitFactor: sumL > 0 ? sumW / sumL : wins.length ? 99 : 0,
      maxDrawdown: maxDd,
      avgHoldDays: trades.length ? trades.reduce((a, b) => a + b.holdDays, 0) / trades.length : 0,
      vsBuyHold,
      finalEquity,
      startEquity: cashStart,
    },
    bySymbol,
    symbols: books.map((b) => b.symbol),
  };
}

export async function runBacktest(input: {
  strategy: StrategyId;
  lookback: Lookback;
  sector?: string;
  symbols?: string[];
}): Promise<BacktestResult> {
  const strategy = input.strategy;
  const lookback = input.lookback;
  const sector = input.sector && input.sector !== "Semua" ? input.sector : "Semua";
  const custom = [
    ...new Set(
      (input.symbols ?? [])
        .map((s) => bareSymbol(s))
        .filter((s) => /^[A-Z0-9]{2,8}$/.test(s)),
    ),
  ].slice(0, 12);
  const key = `${strategy}:${lookback}:${sector}:${custom.join(",")}`;
  const hit = cache.get(key);
  if (hit && Date.now() - hit.at < TTL) return hit.value;

  const symbols = custom.length ? custom : pickBacktestSymbols(sector, 12);
  const [charts, ihsg] = await Promise.all([
    fetchCharts(symbols, lookback, symbols.length),
    fetchChart("^JKSE", lookback),
  ]);
  const minCharts = custom.length ? 1 : 6;
  if (charts.length < minCharts) {
    throw new Error("Data historis tidak cukup untuk backtest. Coba lagi beberapa saat.");
  }

  const books = charts.map(prepare).filter((p): p is Prepared => p !== null);
  const result = simulate(strategy, books, ihsg);
  result.strategy = strategy;
  result.lookback = lookback;
  result.sector = sector;
  result.symbols = books.map((b) => b.symbol);
  result.scanned = symbols.length;
  result.used = books.length;
  result.note =
    lookback === "6mo" && strategy === "invest"
      ? "Investasi butuh SMA200 — periode 6 bulan terlalu pendek, sinyal terbatas."
      : books.length < symbols.length
        ? "Sebagian emiten gagal diunduh; hasil memakai yang tersedia."
        : strategy === "intraday"
          ? "Intraday dites di close harian (hold 1 sesi berikutnya), bukan tick per menit."
          : undefined;

  cache.set(key, { at: Date.now(), value: result });
  return result;
}
