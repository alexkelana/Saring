"use client";

import { useMutation } from "@tanstack/react-query";
import { ArrowUpRight, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { AppShell } from "@/components/screener/app-shell";
import { EquityChart } from "@/components/screener/equity-chart";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { runBacktestFn } from "@/lib/screener/actions";
import { formatDateShort, formatIDR, formatPct, formatPrice } from "@/lib/screener/format";
import { STRATEGIES, STRATEGY_ORDER } from "@/lib/screener/strategies";
import type { BacktestResult, Lookback, StrategyId } from "@/lib/screener/types";
import { SECTORS } from "@/lib/screener/universe";
import { cn } from "@/lib/utils";

const LOOKBACKS: { id: Lookback; label: string }[] = [
  { id: "6mo", label: "6 bulan" },
  { id: "1y", label: "1 tahun" },
  { id: "2y", label: "2 tahun" },
];

const EXIT_LABEL = {
  target: "Target",
  stop: "Stop",
  time: "Waktu",
  signal: "Sinyal",
};

export function BacktestView() {
  const [strategy, setStrategy] = useState<StrategyId>("swing");
  const [lookback, setLookback] = useState<Lookback>("1y");
  const [sector, setSector] = useState("Semua");
  const [result, setResult] = useState<BacktestResult | null>(null);

  const mutation = useMutation({
    mutationFn: () => runBacktestFn({ data: { strategy, lookback, sector } }),
    onSuccess: (data) => {
      setResult(data);
      toast.message(`Backtest ${STRATEGIES[strategy].label} selesai`, {
        description: `${data.metrics.trades} transaksi di ${data.used} emiten.`,
      });
    },
    onError: (err) => {
      const msg = err instanceof Error && err.message ? err.message : "Backtest gagal. Coba beberapa saat lagi.";
      toast.message(msg);
    },
  });

  const item = STRATEGIES[strategy];
  const m = result?.metrics;

  return (
    <AppShell>
      <section className="saring-enter-2 mt-8">
        <p className="text-xs uppercase tracking-wide text-muted-foreground">Simulasi historis</p>
        <h2 className="font-display text-3xl tracking-tight">Backtest</h2>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          Menjalankan aturan {item.label.toLowerCase()} di emiten likuid BEI, modal virtual Rp 100 juta,
          biaya 0,15% per sisi. Bukan jaminan kinerja masa depan.
        </p>

        <div className="mt-6 grid gap-3 md:grid-cols-3">
          {STRATEGY_ORDER.map((id) => {
            const s = STRATEGIES[id];
            const active = strategy === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => setStrategy(id)}
                className={cn(
                  "rounded-3xl p-4 text-left shadow-[var(--shadow-border)] transition-[background-color,box-shadow] duration-200",
                  active ? "bg-primary text-primary-foreground" : "bg-card text-foreground",
                )}
              >
                <span className="font-display text-xl tracking-tight">{s.label}</span>
                <p className={cn("mt-1 text-sm", active ? "text-primary-foreground/75" : "text-muted-foreground")}>
                  {s.horizon}
                </p>
              </button>
            );
          })}
        </div>

        <div className="mt-5 flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="flex flex-wrap gap-1.5">
            {LOOKBACKS.map((l) => (
              <button
                key={l.id}
                type="button"
                onClick={() => setLookback(l.id)}
                className={cn(
                  "inline-flex h-11 items-center rounded-full px-4 text-sm",
                  lookback === l.id ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground",
                )}
              >
                {l.label}
              </button>
            ))}
          </div>
          <label className="sr-only" htmlFor="bt-sektor">
            Sektor
          </label>
          <select
            id="bt-sektor"
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
          <Button className="h-11 min-w-[11rem]" onClick={() => mutation.mutate()} disabled={mutation.isPending}>
            {mutation.isPending ? <Loader2 className="size-4 animate-spin" /> : <ArrowUpRight className="size-4" />}
            {mutation.isPending ? "Mensimulasi…" : "Jalankan backtest"}
          </Button>
        </div>

        {mutation.isPending ? (
          <div className="mt-8 rounded-3xl bg-card px-5 py-8 shadow-[var(--shadow-border)]">
            <p className="font-display text-2xl tracking-tight">Mengambil history papan</p>
            <p className="shimmer-text mt-2 text-sm">Sinyal, fill, stop, dan target dihitung per sesi…</p>
          </div>
        ) : null}

        {mutation.isError && !mutation.isPending ? (
          <p className="mt-6 rounded-2xl bg-down/10 px-4 py-3 text-sm text-down">
            Screening historis gagal diunduh. Coba lagi — Yahoo kadang membatasi request bersamaan.
          </p>
        ) : null}

        {result && m && !mutation.isPending ? (
          <div className="mt-8 space-y-5">
            {result.note ? (
              <p className="rounded-2xl bg-warn/10 px-4 py-3 text-sm text-warn">{result.note}</p>
            ) : null}

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <Metric
                label="Imbal hasil"
                value={formatPct(m.totalReturn)}
                tone={m.totalReturn >= 0 ? "up" : "down"}
              />
              <Metric label="Win rate" value={`${m.winRate.toFixed(0)}%`} sub={`${m.wins} menang / ${m.losses} kalah`} />
              <Metric label="Max drawdown" value={formatPct(-Math.abs(m.maxDrawdown))} tone="down" />
              <Metric
                label="Vs IHSG"
                value={m.vsBuyHold == null ? "—" : formatPct(m.vsBuyHold)}
                tone={m.vsBuyHold == null ? undefined : m.vsBuyHold >= 0 ? "up" : "down"}
                sub="alpha vs buy-hold"
              />
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <Metric label="Transaksi" value={String(m.trades)} sub={`hold ${m.avgHoldDays.toFixed(1)} hari`} />
              <Metric
                label="Profit factor"
                value={m.profitFactor >= 20 ? "∞" : m.profitFactor.toFixed(2)}
                sub={`avg ${formatPct(m.avgWin)} / ${formatPct(m.avgLoss)}`}
              />
              <Metric label="Ekuitas akhir" value={formatIDR(m.finalEquity)} sub={`dari ${formatIDR(m.startEquity)}`} />
            </div>

            <EquityChart series={result.equity} />

            <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_18rem]">
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Transaksi terakhir</p>
                <ul className="mt-3 space-y-2">
                  {result.trades.map((t, i) => (
                    <li
                      key={`${t.symbol}-${t.entryDate}-${i}`}
                      className="flex flex-wrap items-center justify-between gap-2 rounded-2xl bg-card px-4 py-3 shadow-[var(--shadow-border)]"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{t.symbol}</span>
                          <Badge variant={t.retPct >= 0 ? "up" : "down"}>{EXIT_LABEL[t.exitReason]}</Badge>
                        </div>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {formatDateShort(t.entryDate)} → {formatDateShort(t.exitDate)} · {t.holdDays}h ·{" "}
                          {formatPrice(t.entry)} → {formatPrice(t.exit)}
                        </p>
                      </div>
                      <p className={cn("font-mono text-sm tabular-nums", t.retPct >= 0 ? "text-up" : "text-down")}>
                        {formatPct(t.retPct)}
                      </p>
                    </li>
                  ))}
                </ul>
                {result.trades.length === 0 ? (
                  <p className="mt-6 text-sm text-muted-foreground">Tidak ada sinyal yang terpenuhi di periode ini.</p>
                ) : null}
              </div>
              <aside>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Kontributor</p>
                <ul className="mt-3 space-y-2">
                  {result.bySymbol.map((row) => (
                    <li key={row.symbol} className="rounded-2xl bg-secondary px-3 py-3">
                      <div className="flex items-baseline justify-between gap-2">
                        <span className="font-medium">{row.symbol}</span>
                        <span className={cn("font-mono text-sm tabular-nums", row.retPct >= 0 ? "text-up" : "text-down")}>
                          {formatPct(row.retPct)}
                        </span>
                      </div>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {row.trades} tx · win {row.winRate.toFixed(0)}%
                      </p>
                    </li>
                  ))}
                </ul>
              </aside>
            </div>
          </div>
        ) : !mutation.isPending ? (
          <div className="mt-8 rounded-3xl bg-card px-5 py-8 shadow-[var(--shadow-border)] sm:px-8">
            <p className="font-display text-2xl tracking-tight">Uji dulu, baru taruh modal.</p>
            <ul className="mt-5 grid gap-2 sm:grid-cols-2">
              {item.looksFor.map((line) => (
                <li key={line} className="flex gap-2 text-sm">
                  <span className="mt-2 size-1 shrink-0 rounded-full bg-primary" />
                  {line}
                </li>
              ))}
            </ul>
            <Button className="mt-7" onClick={() => mutation.mutate()}>
              Jalankan backtest
              <ArrowUpRight className="size-4" />
            </Button>
          </div>
        ) : null}
      </section>
    </AppShell>
  );
}

function Metric({
  label,
  value,
  sub,
  tone,
}: {
  label: string;
  value: string;
  sub?: string;
  tone?: "up" | "down";
}) {
  return (
    <div className="rounded-3xl bg-card px-4 py-4 shadow-[var(--shadow-border)]">
      <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className={cn("mt-2 font-mono text-xl tabular-nums", tone === "up" && "text-up", tone === "down" && "text-down")}>
        {value}
      </p>
      {sub ? <p className="mt-1 text-xs text-muted-foreground">{sub}</p> : null}
    </div>
  );
}
