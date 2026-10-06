import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { runBacktest } from "./backtest";
import { runScreening } from "./screen";
import { fetchIdxSnapshots, fetchIhsg } from "./tradingview";
import type { Quote } from "./types";
import { bareSymbol } from "./universe";

const strategySchema = z.enum(["intraday", "swing", "invest"]);
const lookbackSchema = z.enum(["6mo", "1y", "2y"]);

export const getMarketOverview = createServerFn({ method: "GET" }).handler(async () => {
  return fetchIhsg();
});

export const runScreen = createServerFn({ method: "POST" })
  .validator((input: unknown) =>
    z
      .object({
        strategy: strategySchema,
        sector: z.string().optional(),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    return runScreening(data);
  });

export const getQuotes = createServerFn({ method: "POST" })
  .validator((input: unknown) =>
    z
      .object({
        symbols: z.array(z.string().min(1).max(12)).max(80),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    const want = new Set(data.symbols.map(bareSymbol));
    const snaps = await fetchIdxSnapshots();
    const quotes: Quote[] = [];
    for (const s of snaps) {
      if (!want.has(s.symbol)) continue;
      quotes.push({
        symbol: s.symbol,
        name: s.name,
        sector: s.sector,
        price: s.price,
        changePct: s.changePct,
        prevClose: s.prevClose,
        volume: s.volume,
        value: s.value,
      });
    }
    return quotes;
  });

export const runBacktestFn = createServerFn({ method: "POST" })
  .validator((input: unknown) =>
    z
      .object({
        strategy: strategySchema,
        lookback: lookbackSchema,
        sector: z.string().optional(),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    return runBacktest(data);
  });
