"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { ArrowUpRight, Loader2, Search, Star } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { AppShell } from "@/components/screener/app-shell";
import { RangeBar } from "@/components/screener/range-bar";
import { ScoreRing } from "@/components/screener/score-ring";
import { Sparkline } from "@/components/screener/sparkline";
import { StockDetail } from "@/components/screener/stock-detail";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getMarketOverview, runScreen } from "@/lib/screener/actions";
import { useDesk } from "@/lib/screener/desk-store";
import { formatJakarta, formatPct, formatPrice } from "@/lib/screener/format";
import { STRATEGIES, STRATEGY_ORDER } from "@/lib/screener/strategies";
import { useScreener, type SortKey, type VerdictFilter } from "@/lib/screener/store";
import type { MarketSnapshot, StrategyId } from "@/lib/screener/types";
import { MOSAIC, SECTORS } from "@/lib/screener/universe";
import { cn } from "@/lib/utils";

const STEPS = [
  "Mengambil papan BEI — teknikal dan fundamental…",
  "Menyaring likuiditas sesuai strategi…",
  "Memindai headline dan sentimen berita…",
  "Menyusun peringkat kandidat beli…",
];

const VERDICT_COPY = {
  beli: "Beli",
  pertimbangkan: "Timbang",
  tunggu: "Tunggu",
};

const SORT_OPTIONS: { id: SortKey; label: string }[] = [
  { id: "score", label: "Skor" },
  { id: "change", label: "%" },
  { id: "value", label: "Nilai" },
  { id: "rsi", label: "RSI" },
];

const VERDICT_FILTERS: { id: VerdictFilter; label: string }[] = [
  { id: "all", label: "Semua" },
  { id: "beli", label: "Beli" },
  { id: "pertimbangkan", label: "Timbang" },
];

export function HomeView({ initialMarket }: { initialMarket?: MarketSnapshot }) {
  const strategy = useScreener((s) => s.strategy);
  const sector = useScreener((s) => s.sector);
  const query = useScreener((s) => s.query);
  const sort = useScreener((s) => s.sort);
  const verdictFilter = useScreener((s) => s.verdictFilter);
  const result = useScreener((s) => s.result);
  const selected = useScreener((s) => s.selected);
  const watchlist = useScreener((s) => s.watchlist);
  const error = useScreener((s) => s.error);
  const setStrategy = useScreener((s) => s.setStrategy);
  const setSector = useScreener((s) => s.setSector);
  const setQuery = useScreener((s) => s.setQuery);
  const setSort = useScreener((s) => s.setSort);
  const setVerdictFilter = useScreener((s) => s.setVerdictFilter);
  const setResult = useScreener((s) => s.setResult);
  const setSelected = useScreener((s) => s.setSelected);
  const setError = useScreener((s) => s.setError);
  const toggleWatch = useScreener((s) => s.toggleWatch);
  const [step, setStep] = useState(0);
  const [watchOnly, setWatchOnly] = useState(false);

  const marketQuery = useQuery({
    queryKey: ["ihsg"],
    queryFn: () => getMarketOverview(),
    initialData: initialMarket,
    refetchInterval: 90_000,
  });

  const mutation = useMutation({
    mutationFn: () => runScreen({ data: { strategy, sector } }),
    onSuccess: (data) => {
      setResult(data);
      toast.message(`Selesai memindai ${data.scanned} emiten`, {
        description: `${data.results.length} saham masuk radar ${STRATEGIES[strategy].label.toLowerCase()}.`,
      });
      const desk = useDesk.getState();
      if (!desk.screenPing) return;
      const beli = data.results.filter((r) => r.verdict === "beli");
      const saved = useScreener.getState().watchlist;
      const hits = beli.filter((r) => saved.includes(r.symbol));
      if (hits.length) {
        const body = hits.map((r) => r.symbol).join(", ");
        desk.pushNotice({
          title: `${hits.length} watchlist masuk beli`,
          body,
          kind: "screen",
          symbol: hits[0]?.symbol,
        });
      } else if (beli.length) {
        desk.pushNotice({
          title: `${beli.length} saham radar beli`,
          body: `${STRATEGIES[strategy].label}: ${beli
            .slice(0, 5)
            .map((r) => r.symbol)
            .join(", ")}`,
          kind: "screen",
        });
      }
    },
    onError: () => {
      setError("Screening gagal. Coba beberapa saat lagi.");
    },
  });

  useEffect(() => {
    if (!mutation.isPending) return;
    setStep(0);
    const id = window.setInterval(() => setStep((s) => (s + 1) % STEPS.length), 1800);
    return () => window.clearInterval(id);
  }, [mutation.isPending]);

  const market = result?.market ?? marketQuery.data;
  const selectedStock = result?.results.find((r) => r.symbol === selected) ?? null;

  const filtered = useMemo(() => {
    const rows = result?.results ?? [];
    const q = query.trim().toUpperCase();
    const next = rows.filter((r) => {
      if (watchOnly && !watchlist.includes(r.symbol)) return false;
      if (verdictFilter !== "all" && r.verdict !== verdictFilter) return false;
      if (!q) return true;
      return r.symbol.includes(q) || r.name.toUpperCase().includes(q) || r.sector.toUpperCase().includes(q);
    });
    next.sort((a, b) => {
      if (sort === "change") return b.changePct - a.changePct;
      if (sort === "value") return b.value - a.value;
      if (sort === "rsi") return (b.indicators.rsi ?? 0) - (a.indicators.rsi ?? 0);
      return b.scores.total - a.scores.total;
    });
    return next;
  }, [result, query, watchOnly, watchlist, sort, verdictFilter]);

  return (
    <AppShell market={market}>
      <section className="saring-enter-2 mt-8 grid gap-3 md:grid-cols-3">
        {STRATEGY_ORDER.map((id) => {
          const item = STRATEGIES[id];
          const active = strategy === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => setStrategy(id)}
              className={cn(
                "rounded-3xl p-4 text-left shadow-[var(--shadow-border)] transition-[background-color,box-shadow,transform] duration-200 ease-out",
                "hover:shadow-[var(--shadow-border-hover)] active:scale-[0.99]",
                active ? "bg-primary text-primary-foreground" : "bg-card text-foreground",
              )}
            >
              <div className="flex items-baseline justify-between gap-3">
                <span className="font-display text-xl tracking-tight">{item.label}</span>
                <span
                  className={cn(
                    "font-mono text-xs uppercase tracking-wide",
                    active ? "text-primary-foreground/70" : "text-muted-foreground",
                  )}
                >
                  {item.horizon}
                </span>
              </div>
              <p
                className={cn(
                  "mt-2 text-sm leading-relaxed",
                  active ? "text-primary-foreground/80" : "text-muted-foreground",
                )}
              >
                {item.blurb}
              </p>
              <div
                className={cn(
                  "mt-4 flex h-1 overflow-hidden rounded-full",
                  active ? "bg-primary-foreground/15" : "bg-secondary",
                )}
              >
                <span
                  className={cn("h-full", active ? "bg-primary-foreground" : "bg-foreground/70")}
                  style={{ flexGrow: item.weights.technical }}
                />
                <span
                  className={cn("h-full", active ? "bg-primary-foreground/60" : "bg-foreground/40")}
                  style={{ flexGrow: item.weights.fundamental }}
                />
                <span
                  className={cn("h-full", active ? "bg-primary-foreground/30" : "bg-foreground/20")}
                  style={{ flexGrow: item.weights.sentiment }}
                />
              </div>
            </button>
          );
        })}
      </section>

      <section className="saring-enter-3 mt-6 flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="relative min-w-0 flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari kode, nama, atau sektor"
            className="pl-11"
            aria-label="Cari emiten"
          />
        </div>
        <label className="sr-only" htmlFor="sektor">
          Sektor
        </label>
        <select
          id="sektor"
          value={sector}
          onChange={(e) => setSector(e.target.value)}
          className="h-11 rounded-full bg-secondary px-4 text-sm text-foreground shadow-[var(--shadow-border)] focus-visible:ring-2 focus-visible:ring-ring/70 focus-visible:outline-none"
        >
          <option value="Semua">Semua sektor</option>
          {SECTORS.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <Button
          className="h-11 min-w-[11rem]"
          onClick={() => mutation.mutate()}
          disabled={mutation.isPending}
        >
          {mutation.isPending ? <Loader2 className="size-4 animate-spin" /> : <ArrowUpRight className="size-4" />}
          {mutation.isPending ? "Menyaring…" : "Jalankan screening"}
        </Button>
      </section>

      <p className="mt-3 text-sm text-muted-foreground">
        Seluruh papan BEI · teknikal, fundamental, dan sentimen berita · strategi{" "}
        {STRATEGIES[strategy].label.toLowerCase()}
      </p>

      {mutation.isPending ? <LoadingPanel step={step} strategy={strategy} /> : null}
      {error && !mutation.isPending ? (
        <p className="mt-6 rounded-2xl bg-down/10 px-4 py-3 text-sm text-down">{error}</p>
      ) : null}

      {!mutation.isPending && result ? (
        <div className="mt-6 grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_22rem]">
          <div>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-muted-foreground">
                {result.qualified} kandidat dari {result.scanned} emiten
                {` · ${result.eligible} lolos likuiditas`}
                {result.asOf ? ` · ${formatJakarta(result.asOf)}` : ""}
              </p>
              <button
                type="button"
                onClick={() => setWatchOnly((v) => !v)}
                className={cn(
                  "inline-flex h-11 items-center gap-1.5 rounded-full px-3 text-sm transition-colors duration-150",
                  watchOnly ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground",
                )}
              >
                <Star className={cn("size-3.5", watchOnly && "fill-current")} />
                Tersimpan
              </button>
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-2">
              {VERDICT_FILTERS.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setVerdictFilter(f.id)}
                  className={cn(
                    "inline-flex h-9 items-center rounded-full px-3 text-sm transition-colors duration-150",
                    verdictFilter === f.id
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-muted-foreground",
                  )}
                >
                  {f.label}
                </button>
              ))}
              <span className="mx-1 text-muted-foreground">·</span>
              {SORT_OPTIONS.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setSort(s.id)}
                  className={cn(
                    "inline-flex h-9 items-center rounded-full px-3 text-sm transition-colors duration-150",
                    sort === s.id ? "bg-accent text-foreground" : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {s.label}
                </button>
              ))}
            </div>

            {result.note ? (
              <p className="mt-3 rounded-2xl bg-warn/10 px-4 py-3 text-sm text-warn">{result.note}</p>
            ) : null}

            <ul className="mt-3 space-y-2">
              {filtered.map((row, i) => {
                const active = row.symbol === selected;
                const up = row.changePct >= 0;
                const saved = watchlist.includes(row.symbol);
                return (
                  <li key={row.symbol}>
                    <div
                      className={cn(
                        "flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left shadow-[var(--shadow-border)] transition-[background-color,box-shadow] duration-150 sm:px-4",
                        active ? "bg-accent" : "bg-card hover:shadow-[var(--shadow-border-hover)]",
                      )}
                    >
                      <button
                        type="button"
                        onClick={() => setSelected(row.symbol)}
                        className="flex min-w-0 flex-1 items-center gap-3"
                      >
                        <span className="hidden w-5 font-mono text-xs text-muted-foreground tabular-nums sm:block">
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        <ScoreRing value={row.scores.total} size={44} />
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-medium tracking-tight">{row.symbol}</span>
                            <Badge variant={row.verdict}>{VERDICT_COPY[row.verdict]}</Badge>
                          </div>
                          <p className="truncate text-sm text-muted-foreground">{row.name}</p>
                        </div>
                        {row.spark.length > 2 ? (
                          <Sparkline
                            values={row.spark}
                            up={up}
                            className="hidden h-8 w-24 shrink-0 md:block"
                          />
                        ) : (
                          <div className="hidden w-28 shrink-0 md:block">
                            <RangeBar low={row.week52Low} high={row.week52High} value={row.price} />
                          </div>
                        )}
                        <div className="shrink-0 text-right">
                          <p className="font-mono text-sm tabular-nums">{formatPrice(row.price)}</p>
                          <p className={cn("font-mono text-xs tabular-nums", up ? "text-up" : "text-down")}>
                            {formatPct(row.changePct)}
                          </p>
                        </div>
                      </button>
                      <button
                        type="button"
                        className="grid size-11 shrink-0 place-items-center rounded-full text-muted-foreground hover:text-foreground"
                        aria-label={saved ? "Hapus dari watchlist" : "Simpan"}
                        onClick={() => toggleWatch(row.symbol)}
                      >
                        <Star className={cn("size-4", saved && "fill-primary text-primary")} />
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
            {filtered.length === 0 ? (
              <p className="mt-8 text-sm text-muted-foreground">
                Tidak ada emiten yang cocok dengan saringan ini.
              </p>
            ) : null}
          </div>

          {selectedStock ? (
            <>
              <button
                type="button"
                className="fixed inset-0 z-40 bg-background/70 lg:hidden"
                aria-label="Tutup detail"
                onClick={() => setSelected(null)}
              />
              <aside className="fixed inset-x-0 bottom-0 z-50 max-h-[86vh] overflow-y-auto rounded-t-3xl bg-card p-5 shadow-[var(--shadow-border)] lg:sticky lg:top-5 lg:z-0 lg:max-h-[calc(100dvh-2.5rem)] lg:rounded-3xl">
                <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-border lg:hidden" />
                <StockDetail stock={selectedStock} onClose={() => setSelected(null)} />
              </aside>
            </>
          ) : (
            <aside className="hidden rounded-3xl bg-card p-6 text-sm text-muted-foreground shadow-[var(--shadow-border)] lg:block">
              Pilih emiten untuk melihat thesis, level, dan pecahan skor.
            </aside>
          )}
        </div>
      ) : !mutation.isPending ? (
        <EmptyState strategy={strategy} onRun={() => mutation.mutate()} />
      ) : null}

      <footer className="mt-16 max-w-2xl text-xs leading-relaxed text-muted-foreground">
        Saring memindai emiten BEI dari data pasar publik: indikator teknikal, fundamental (PE, ROE, dividen,
        kapitalisasi), dan sentimen berita. Ini bukan saran investasi, ajakan membeli, atau jaminan imbal
        hasil. Selalu verifikasi ke sumber resmi dan sesuaikan dengan profil risiko Anda.
        {result && !result.sentimentEnabled ? " Analisis sentimen AI tidak aktif pada sesi ini — skor berita memakai headline." : ""}
      </footer>
    </AppShell>
  );
}

function LoadingPanel({ step, strategy }: { step: number; strategy: StrategyId }) {
  return (
    <div className="mt-10 rounded-3xl bg-card px-5 py-8 shadow-[var(--shadow-border)] sm:px-8">
      <p className="font-display text-2xl tracking-tight">Memindai papan BEI</p>
      <p className="shimmer-text mt-2 text-sm">{STEPS[step]}</p>
      <div className="mt-6 grid grid-cols-3 gap-2 sm:grid-cols-6">
        {MOSAIC.map((symbol, i) => (
          <div
            key={symbol}
            className="rounded-xl bg-secondary px-2 py-2 text-center font-mono text-xs text-muted-foreground"
            style={{ opacity: 0.35 + ((i + step) % 5) * 0.12 }}
          >
            {symbol}
          </div>
        ))}
      </div>
      <p className="mt-5 text-sm text-muted-foreground">
        Strategi {STRATEGIES[strategy].label} · seluruh emiten likuid. Biasanya 5–10 detik.
      </p>
    </div>
  );
}

function EmptyState({ strategy, onRun }: { strategy: StrategyId; onRun: () => void }) {
  const item = STRATEGIES[strategy];
  return (
    <div className="mt-10 rounded-3xl bg-card px-5 py-8 shadow-[var(--shadow-border)] sm:px-8">
      <p className="font-display text-3xl tracking-tight">Saring dulu, baru beli.</p>
      <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground">{item.blurb}</p>
      <ul className="mt-5 grid gap-2 sm:grid-cols-2">
        {item.looksFor.map((line) => (
          <li key={line} className="flex gap-2 text-sm text-foreground/90">
            <span className="mt-2 size-1 shrink-0 rounded-full bg-primary" />
            {line}
          </li>
        ))}
      </ul>
      <details className="mt-6 max-w-xl text-sm text-muted-foreground">
        <summary className="cursor-pointer text-foreground">Bagaimana skor dihitung</summary>
        <p className="mt-2 leading-relaxed">
          Setiap emiten dinilai 0–100 dari tiga faktor sesuai strategi: teknikal (RSI, SMA, MACD, volume
          relatif), fundamental (PE, ROE, dividen, kapitalisasi, likuiditas), dan sentimen berita. Hanya yang
          cukup likuid yang naik ke daftar kandidat.
        </p>
      </details>
      <Button className="mt-7" onClick={onRun}>
        Jalankan screening
        <ArrowUpRight className="size-4" />
      </Button>
    </div>
  );
}
