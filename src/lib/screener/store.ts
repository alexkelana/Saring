import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ScreenResult, StrategyId } from "./types";

type ScreenerState = {
  strategy: StrategyId;
  sector: string;
  query: string;
  result: ScreenResult | null;
  selected: string | null;
  watchlist: string[];
  error: string | null;
  setStrategy: (strategy: StrategyId) => void;
  setSector: (sector: string) => void;
  setQuery: (query: string) => void;
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
      result: null,
      selected: null,
      watchlist: [],
      error: null,
      setStrategy: (strategy) => set({ strategy }),
      setSector: (sector) => set({ sector }),
      setQuery: (query) => set({ query }),
      setResult: (result) =>
        set({ result, selected: result?.results[0]?.symbol ?? null, error: null }),
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
      name: "saring-v1",
      partialize: (s) => ({ watchlist: s.watchlist }),
    },
  ),
);
