"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { ArrowUpRight, Loader2, Search, Star } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { ScoreRing } from "@/components/screener/score-ring";
import { Sparkline } from "@/components/screener/sparkline";
import { StockDetail } from "@/components/screener/stock-detail";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getMarketOverview, runScreen } from "@/lib/screener/actions";
import { formatJakarta, formatPct, formatPrice } from "@/lib/screener/format";
import { STRATEGIES, STRATEGY_ORDER } from "@/lib/screener/strategies";
import { useScreener } from "@/lib/screener/store";
import type { MarketSnapshot, StrategyId } from "@/lib/screener/types";
import { SECTORS, UNIVERSE } from "@/lib/screener/universe";
import { cn } from "@/lib/utils";

const STEPS = [
  "Mengambil harga dan volume emiten BEI…",
  "Menghitung RSI, MACD, SMA, dan volume relatif…",
  "Memindai headline dan sentimen berita…",
  "Menyusun peringkat sesuai strategi…",
];

const VERDICT_COPY = {
  beli: "Beli",
  pertimbangkan: "Timbang",
  tunggu: "Tunggu",
};

export function HomeView({ initialMarket }: { initialMarket?: MarketSnapshot }) {
  const strategy = useScreener((s) => s.strategy);
  const sector = useScreener((s) => s.sector);
  const query = useScreener((s) => s.query);
  const result = useScreener((s) => s.result);
  const selected = useScreener((s) => s.selected);
  const watchlist = useScreener((s) => s.watchlist);
  const error = useScreener((s) => s.error);
  const setStrategy = useScreener((s) => s.setStrategy);
  const setSector = useScreener((s) => s.setSector);
  const setQuery = useScreener((s) => s.setQuery);
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
    },
    onError: () => {
      setError("Screening gagal. Coba beberapa saat lagi.");
    },
  });

  useEffect(() => {
    if (!mutation.isPending) return;
    setStep(0);
    const id = window.setInterval(() => setStep((s) => (s + 1) % STEPS.length), 2200);
    return () => window.clearInterval(id);
  }, [mutation.isPending]);

  const market = result?.market ?? marketQuery.data;
  const selectedStock = result?.results.find((r) => r.symbol === selected) ?? null;

  const filtered = useMemo(() => {
    const rows = result?.results ?? [];
    const q = query.trim().toUpperCase();
    return rows.filter((r) => {
      if (watchOnly && !watchlist.includes(r.symbol)) return false;
      if (!q) return true;
      return r.symbol.includes(q) || r.name.toUpperCase().includes(q) || r.sector.toUpperCase().includes(q);
    });
  }, [result, query, watchOnly, watchlist]);

  return (
    <div className="relative mx-auto min-h-dvh w-full max-w-[1320px] px-4 pb-16 pt-5 sm:px-6 lg:px-8">
      <header className="saring-enter flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-muted-foreground">
            Screener saham BEI
          </p>
          <h1 className="mt-1 font-display text-[2.4rem] italic leading-none tracking-tight sm:text-5xl">
            saring
          </h1>
        </div>
        <MarketChip
          price={market?.price}
          changePct={market?.changePct}
          statusLabel={market?.statusLabel}
          asOf={market?.asOf}
        />
      </header>

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
                    "font-mono text-[11px] uppercase tracking-wide",
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

      <p className="mt-3 text-[13px] text-muted-foreground">
        {UNIVERSE.length} emiten likuid · teknikal, fundamental, dan sentimen berita · strategi{" "}
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
                {result.asOf ? ` · ${formatJakarta(result.asOf)}` : ""}
              </p>
              <button
                type="button"
                onClick={() => setWatchOnly((v) => !v)}
                className={cn(
                  "inline-flex h-9 items-center gap-1.5 rounded-full px-3 text-[13px] transition-colors duration-150",
                  watchOnly ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground",
                )}
              >
                <Star className={cn("size-3.5", watchOnly && "fill-current")} />
                Tersimpan
              </button>
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
                        <span className="hidden w-5 font-mono text-[12px] text-muted-foreground tabular-nums sm:block">
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        <ScoreRing value={row.scores.total} size={44} />
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-medium tracking-tight">{row.symbol}</span>
                            <Badge variant={row.verdict}>{VERDICT_COPY[row.verdict]}</Badge>
                          </div>
                          <p className="truncate text-[13px] text-muted-foreground">{row.name}</p>
                        </div>
                        <Sparkline
                          values={row.spark}
                          up={up}
                          className="hidden h-8 w-24 shrink-0 md:block"
                        />
                        <div className="shrink-0 text-right">
                          <p className="font-mono text-sm tabular-nums">{formatPrice(row.price)}</p>
                          <p className={cn("font-mono text-[12px] tabular-nums", up ? "text-up" : "text-down")}>
                            {formatPct(row.changePct)}
                          </p>
                        </div>
                      </button>
                      <button
                        type="button"
                        className="grid size-10 shrink-0 place-items-center rounded-full text-muted-foreground hover:text-foreground"
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

      <footer className="mt-16 max-w-2xl text-[12px] leading-relaxed text-muted-foreground">
        Saring memindai emiten likuid BEI dari data pasar publik, indikator teknikal, kualitas emiten, dan
        sentimen berita. Ini bukan saran investasi, ajakan membeli, atau jaminan imbal hasil. Selalu verifikasi
        ke sumber resmi dan sesuaikan dengan profil risiko Anda.
        {result && !result.sentimentEnabled ? " Analisis sentimen AI tidak aktif pada sesi ini." : ""}
      </footer>
    </div>
  );
}

function MarketChip({
  price,
  changePct,
  statusLabel,
  asOf,
}: {
  price?: number;
  changePct?: number;
  statusLabel?: string;
  asOf?: number;
}) {
  const up = (changePct ?? 0) >= 0;
  return (
    <div className="rounded-2xl bg-card px-4 py-3 shadow-[var(--shadow-border)]">
      <div className="flex items-baseline gap-2">
        <span className="text-[11px] uppercase tracking-wide text-muted-foreground">IHSG</span>
        <span className="font-mono text-lg tabular-nums">{price ? formatPrice(price) : "—"}</span>
        <span className={cn("font-mono text-sm tabular-nums", up ? "text-up" : "text-down")}>
          {changePct != null ? formatPct(changePct) : ""}
        </span>
      </div>
      <p className="mt-0.5 text-[12px] text-muted-foreground">
        {statusLabel ?? "Memuat"}
        {asOf ? ` · ${formatJakarta(asOf)}` : ""}
      </p>
    </div>
  );
}

function LoadingPanel({ step, strategy }: { step: number; strategy: StrategyId }) {
  return (
    <div className="mt-10 rounded-3xl bg-card px-5 py-8 shadow-[var(--shadow-border)] sm:px-8">
      <p className="font-display text-2xl tracking-tight">Memindai papan BEI</p>
      <p className="shimmer-text mt-2 text-sm">{STEPS[step]}</p>
      <div className="mt-6 grid grid-cols-3 gap-2 sm:grid-cols-6">
        {UNIVERSE.slice(0, 12).map((s, i) => (
          <div
            key={s.symbol}
            className="rounded-xl bg-secondary px-2 py-2 text-center font-mono text-[11px] text-muted-foreground"
            style={{ opacity: 0.35 + ((i + step) % 5) * 0.12 }}
          >
            {s.symbol}
          </div>
        ))}
      </div>
      <p className="mt-5 text-[13px] text-muted-foreground">
        Strategi {STRATEGIES[strategy].label} · {UNIVERSE.length} emiten. Biasanya 8–15 detik.
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
      <Button className="mt-7" onClick={onRun}>
        Jalankan screening
        <ArrowUpRight className="size-4" />
      </Button>
    </div>
  );
}
