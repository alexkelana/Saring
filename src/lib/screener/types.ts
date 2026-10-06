export type StrategyId = "intraday" | "swing" | "invest";

export type Sector =
  | "Perbankan"
  | "Telekomunikasi"
  | "Konsumer"
  | "Otomotif"
  | "Tambang"
  | "Energi"
  | "Properti"
  | "Konstruksi"
  | "Industri"
  | "Kesehatan"
  | "Teknologi"
  | "Ritel"
  | "Perkebunan"
  | "Keuangan"
  | "Transportasi"
  | "Infrastruktur"
  | "Media";

export type Size = "mega" | "large" | "mid" | "small";

export type Verdict = "beli" | "pertimbangkan" | "tunggu";

export type StockFlags = {
  lq45?: boolean;
  idx30?: boolean;
  shariah?: boolean;
  dividend?: boolean;
  soe?: boolean;
};

export type StockMeta = {
  symbol: string;
  name: string;
  sector: Sector;
  size: Size;
  flags: StockFlags;
};

export type Ohlcv = {
  t: number;
  o: number;
  h: number;
  l: number;
  c: number;
  v: number;
};

export type ChartBundle = {
  symbol: string;
  name: string;
  price: number;
  prevClose: number;
  changePct: number;
  volume: number;
  dayHigh: number;
  dayLow: number;
  week52High: number;
  week52Low: number;
  currency: string;
  bars: Ohlcv[];
  dividends: { amount: number; date: number }[];
};

export type Indicators = {
  rsi: number | null;
  rsiHour: number | null;
  sma20: number | null;
  sma50: number | null;
  sma200: number | null;
  ema9: number | null;
  macd: number | null;
  macdHist: number | null;
  atr: number | null;
  atrPct: number | null;
  rvol: number | null;
  roc10: number | null;
  pos52w: number | null;
  sma50Slope: number | null;
  sma200Slope: number | null;
};

export type Fundamentals = {
  pe: number | null;
  pb: number | null;
  roe: number | null;
  de: number | null;
  divYield: number | null;
  epsGrowth: number | null;
  mcap: number | null;
};

export type Levels = {
  support: number;
  resistance: number;
  stop: number;
  target: number;
};

export type Headline = {
  title: string;
  source: string;
  date: string;
};

export type FactorScores = {
  total: number;
  technical: number;
  fundamental: number;
  sentiment: number;
};

export type StockResult = {
  symbol: string;
  name: string;
  sector: Sector;
  industry: string;
  size: Size;
  flags: StockFlags;
  price: number;
  prevClose: number;
  changePct: number;
  volume: number;
  value: number;
  spark: number[];
  week52High: number | null;
  week52Low: number | null;
  scores: FactorScores;
  verdict: Verdict;
  reasons: string[];
  risks: string[];
  thesis: string;
  levels: Levels;
  indicators: Indicators;
  fundamentals: Fundamentals;
  headlines: Headline[];
  lastDiv?: { amount: number; date: number };
};

export type MarketSnapshot = {
  price: number;
  changePct: number;
  name: string;
  asOf: number;
  status: "open" | "break" | "pre" | "closed";
  statusLabel: string;
  trend: "naik" | "turun" | "datar";
};

export type ScreenResult = {
  strategy: StrategyId;
  sector: string;
  asOf: number;
  market: MarketSnapshot;
  scanned: number;
  eligible: number;
  failed: number;
  qualified: number;
  results: StockResult[];
  sentimentEnabled: boolean;
  note?: string;
};

export type Quote = {
  symbol: string;
  name: string;
  sector: Sector;
  price: number;
  changePct: number;
  prevClose: number;
  volume: number;
  value: number;
};

export type Lookback = "6mo" | "1y" | "2y";

export type BacktestTrade = {
  symbol: string;
  name: string;
  entryDate: number;
  exitDate: number;
  entry: number;
  exit: number;
  retPct: number;
  reason: string;
  exitReason: "target" | "stop" | "time" | "signal";
  holdDays: number;
};

export type EquityPoint = {
  t: number;
  v: number;
};

export type BacktestSymbolRow = {
  symbol: string;
  name: string;
  trades: number;
  winRate: number;
  retPct: number;
};

export type BacktestMetrics = {
  totalReturn: number;
  winRate: number;
  trades: number;
  wins: number;
  losses: number;
  avgWin: number;
  avgLoss: number;
  profitFactor: number;
  maxDrawdown: number;
  avgHoldDays: number;
  vsBuyHold: number | null;
  finalEquity: number;
  startEquity: number;
};

export type BacktestResult = {
  strategy: StrategyId;
  sector: string;
  lookback: Lookback;
  asOf: number;
  scanned: number;
  used: number;
  trades: BacktestTrade[];
  equity: EquityPoint[];
  metrics: BacktestMetrics;
  bySymbol: BacktestSymbolRow[];
  note?: string;
};

