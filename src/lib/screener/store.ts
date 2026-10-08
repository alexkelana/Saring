import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ScreenResult, StrategyId, Verdict } from "./types";

export type SortKey = "score" | "change" | "value" | "rsi";
export type VerdictFilter = "all" | "beli" | "pertimbangkan" | "tunggu";

export type RadarRow = {
  symbol: string;
  name: string;
  verdict: Verdict;
};

export type Radar = {
  strategy: StrategyId;
  rows: RadarRow[];
};

type ScreenerState = {
  strategy: StrategyId;
  sector: string;
  query: string;
  sort: SortKey;
  verdictFilter: VerdictFilter;
  result: ScreenResult | null;
  selected: string | null;
  watchlist: string[];
  radar: Radar | null;
  error: string | null;
  setStrategy: (strategy: StrategyId) => void;
  setSector: (sector: string) => void;
  setQuery: (query: string) => void;
  setSort: (sort: SortKey) => void;
  setVerdictFilter: (verdictFilter: VerdictFilter) => void;
  setResult: (result: ScreenResult | null) => void;
  setSelected: (selected: string | null) => void;
  setError: (error: string | null) => void;
  toggleWatch: (symbol: string) => void;
};

export const useScreener = create<ScreenerState>()(
  persist(
    (set, get) => ({
      strategy: "swing",
      sector: "Semua",
      query: "",
      sort: "score",
      verdictFilter: "all",
      result: null,
      selected: null,
      watchlist: [],
      radar: null,
      error: null,
      setStrategy: (strategy) => set({ strategy }),
      setSector: (sector) => set({ sector }),
      setQuery: (query) => set({ query }),
      setSort: (sort) => set({ sort }),
      setVerdictFilter: (verdictFilter) => set({ verdictFilter }),
      setResult: (result) =>
        set({
          result,
          selected: result?.results[0]?.symbol ?? null,
          error: null,
          verdictFilter: "all",
          radar: result
            ? {
                strategy: result.strategy,
                rows: result.results.map((r) => ({
                  symbol: r.symbol,
                  name: r.name,
                  verdict: r.verdict,
                })),
              }
            : get().radar,
        }),
      setSelected: (selected) => set({ selected }),
      setError: (error) => set({ error }),
      toggleWatch: (symbol) => {
        const cur = get().watchlist;
        set({
          watchlist: cur.includes(symbol) ? cur.filter((s) => s !== symbol) : [...cur, symbol],
        });
      },
    }),
    {
      name: "saring-v2",
      partialize: (s) => ({ watchlist: s.watchlist, strategy: s.strategy, radar: s.radar }),
    },
  ),
);