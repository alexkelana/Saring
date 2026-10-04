import type { StrategyId } from "./types";

export const STRATEGIES: Record<
  StrategyId,
  {
    id: StrategyId;
    label: string;
    horizon: string;
    blurb: string;
    looksFor: string[];
    weights: { technical: number; fundamental: number; sentiment: number };
  }
> = {
  intraday: {
    id: "intraday",
    label: "Intraday",
    horizon: "Sesi hari ini",
    blurb: "Momentum, volume relatif, dan likuiditas untuk posisi yang ditutup sebelum penutupan bursa.",
    looksFor: [
      "Volume di atas rata-rata 20 hari",
      "RSI 40–70, bukan jenuh beli",
      "Harga di atas EMA9 / SMA20",
      "Nilai transaksi harian tinggi",
    ],
    weights: { technical: 0.62, fundamental: 0.13, sentiment: 0.25 },
  },
  swing: {
    id: "swing",
    label: "Swing",
    horizon: "5–20 hari",
    blurb: "Tren harian, breakout, dan konfirmasi volume untuk holding beberapa sesi hingga beberapa minggu.",
    looksFor: [
      "Harga di atas SMA20 dan SMA50",
      "MACD histogram menguat",
      "RSI 45–65",
      "Sentimen berita tidak negatif",
    ],
    weights: { technical: 0.45, fundamental: 0.25, sentiment: 0.3 },
  },
  invest: {
    id: "invest",
    label: "Investasi",
    horizon: "Bulanan–tahunan",
    blurb: "Kualitas bisnis, tren jangka panjang, dan valuasi relatif — bukan trading harian.",
    looksFor: [
      "Tren SMA50 / SMA200 naik",
      "Kapitalisasi besar atau LQ45",
      "Riwayat dividen",
      "Tidak overextended dari 52-minggu",
    ],
    weights: { technical: 0.28, fundamental: 0.44, sentiment: 0.28 },
  },
};

export const STRATEGY_ORDER: StrategyId[] = ["intraday", "swing", "invest"];
