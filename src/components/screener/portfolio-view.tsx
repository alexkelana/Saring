"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { AppShell } from "@/components/screener/app-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getQuotes } from "@/lib/screener/actions";
import { positionMetrics, useDesk } from "@/lib/screener/desk-store";
import {
  formatCompactIDR,
  formatIDR,
  formatLots,
  formatPct,
  formatPrice,
  LOT,
} from "@/lib/screener/format";
import type { Quote } from "@/lib/screener/types";
import { UNIVERSE } from "@/lib/screener/universe";
import { cn } from "@/lib/utils";

export function PortfolioView() {
  const positions = useDesk((s) => s.positions);
  const closed = useDesk((s) => s.closed);
  const addPosition = useDesk((s) => s.addPosition);
  const sellPosition = useDesk((s) => s.sellPosition);
  const [adding, setAdding] = useState(false);
  const [confirmId, setConfirmId] = useState<string | null>(null);

  const symbols = useMemo(() => positions.map((p) => p.symbol), [positions]);
  const quotes = useQuery({
    queryKey: ["quotes", "portfolio", symbols.join(",")],
    queryFn: () => getQuotes({ data: { symbols } }),
    enabled: symbols.length > 0,
    refetchInterval: 90_000,
  });
  const bySym = useMemo(() => new Map((quotes.data ?? []).map((q) => [q.symbol, q])), [quotes.data]);

  const totals = useMemo(() => {
    let cost = 0;
    let value = 0;
    for (const p of positions) {
      const m = positionMetrics(p, bySym.get(p.symbol)?.price);
      cost += m.cost;
      value += m.value;
    }
    const pnl = value - cost;
    const pct = cost ? (pnl / cost) * 100 : 0;
    const realized = closed.reduce((a, t) => a + (t.exitPrice - t.avgPrice) * t.shares, 0);
    return { cost, value, pnl, pct, realized };
  }, [positions, bySym, closed]);

  const sectors = useMemo(() => {
    const map = new Map<string, number>();
    for (const p of positions) {
      const v = positionMetrics(p, bySym.get(p.symbol)?.price).value;
      map.set(p.sector, (map.get(p.sector) ?? 0) + v);
    }
    return [...map.entries()].sort((a, b) => b[1] - a[1]);
  }, [positions, bySym]);

  return (
    <AppShell>
      <section className="saring-enter-2 mt-8">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Tracker</p>
            <h2 className="font-display text-3xl tracking-tight">Portofolio</h2>
          </div>
          <Button onClick={() => setAdding((v) => !v)}>
            <Plus className="size-4" />
            Tambah posisi
          </Button>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <Stat label="Nilai pasar" value={positions.length ? formatIDR(totals.value) : "—"} />
          <Stat
            label="P/L terbuka"
            value={positions.length ? formatIDR(totals.pnl) : "—"}
            tone={totals.pnl > 0 ? "up" : totals.pnl < 0 ? "down" : undefined}
            sub={positions.length ? formatPct(totals.pct) : undefined}
          />
          <Stat
            label="Realized"
            value={closed.length ? formatIDR(totals.realized) : "—"}
            tone={totals.realized > 0 ? "up" : totals.realized < 0 ? "down" : undefined}
          />
        </div>

        {adding ? (
          <AddForm
            onCancel={() => setAdding(false)}
            onAdd={(row) => {
              addPosition(row);
              setAdding(false);
              toast.message(`${row.symbol} masuk portofolio`, {
                description: `${formatLots(row.shares)} @ ${formatPrice(row.avgPrice)}`,
              });
            }}
          />
        ) : null}

        {sectors.length > 1 ? (
          <div className="mt-6">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Alokasi sektor</p>
            <div className="mt-2 flex h-2 overflow-hidden rounded-full bg-secondary">
              {sectors.map(([name, v], i) => (
                <span
                  key={name}
                  className="h-full bg-foreground"
                  style={{ width: `${(v / Math.max(1, totals.value)) * 100}%`, opacity: 1 - i * 0.14 }}
                  title={name}
                />
              ))}
            </div>
            <div className="mt-2 flex flex-wrap gap-3 text-xs text-muted-foreground">
              {sectors.map(([name, v]) => (
                <span key={name}>
                  {name} {((v / Math.max(1, totals.value)) * 100).toFixed(0)}%
                </span>
              ))}
            </div>
          </div>
        ) : null}

        {positions.length === 0 && !adding ? (
          <div className="mt-8 rounded-3xl bg-card px-5 py-8 shadow-[var(--shadow-border)] sm:px-8">
            <p className="font-display text-2xl tracking-tight">Belum ada posisi.</p>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground">
              Tambah manual, atau dari hasil screening buka emiten lalu ketuk Masuk portofolio. 1 lot = 100
              lembar.
            </p>
          </div>
        ) : (
          <ul className="mt-6 space-y-2">
            {positions.map((p) => {
              const q = bySym.get(p.symbol);
              const m = positionMetrics(p, q?.price);
              const up = m.pnl >= 0;
              return (
                <li
                  key={p.id}
                  className="rounded-3xl bg-card px-4 py-4 shadow-[var(--shadow-border)] sm:px-5"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-medium tracking-tight">{p.symbol}</span>
                        <span className="text-sm text-muted-foreground">{p.name}</span>
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {formatLots(p.shares)} · avg {formatPrice(p.avgPrice)}
                        {p.stop ? ` · stop ${formatPrice(p.stop)}` : ""}
                        {p.target ? ` · target ${formatPrice(p.target)}` : ""}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-mono text-lg tabular-nums">{q ? formatPrice(q.price) : "—"}</p>
                      <p className={cn("font-mono text-sm tabular-nums", up ? "text-up" : "text-down")}>
                        {formatIDR(m.pnl)} · {formatPct(m.pct)}
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                    <p className="text-xs text-muted-foreground">
                      Nilai {formatCompactIDR(m.value)} · modal {formatCompactIDR(m.cost)}
                      {q ? ` · ${formatPct(q.changePct)} hari ini` : ""}
                    </p>
                    {confirmId === p.id ? (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="subtle"
                          onClick={() => {
                            const px = q?.price ?? p.avgPrice;
                            sellPosition(p.id, p.shares, px);
                            setConfirmId(null);
                            toast.message(`${p.symbol} terjual`, {
                              description: `${formatLots(p.shares)} @ ${formatPrice(px)}`,
                            });
                          }}
                        >
                          Konfirmasi jual
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => setConfirmId(null)}>
                          Batal
                        </Button>
                      </div>
                    ) : (
                      <Button size="sm" variant="ghost" onClick={() => setConfirmId(p.id)}>
                        Jual
                      </Button>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}

        {closed.length ? (
          <div className="mt-10">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Riwayat jual</p>
            <ul className="mt-3 space-y-2">
              {closed.slice(0, 12).map((t) => {
                const pnl = (t.exitPrice - t.avgPrice) * t.shares;
                return (
                  <li
                    key={t.id}
                    className="flex items-baseline justify-between gap-3 rounded-2xl bg-secondary px-4 py-3 text-sm"
                  >
                    <span>
                      {t.symbol} · {formatLots(t.shares)}
                    </span>
                    <span className={cn("font-mono tabular-nums", pnl >= 0 ? "text-up" : "text-down")}>
                      {formatIDR(pnl)}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
        ) : null}
      </section>
    </AppShell>
  );
}

function Stat({
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
      {sub ? <p className="mt-1 font-mono text-xs text-muted-foreground">{sub}</p> : null}
    </div>
  );
}

function AddForm({
  onCancel,
  onAdd,
}: {
  onCancel: () => void;
  onAdd: (row: {
    symbol: string;
    name: string;
    sector: string;
    shares: number;
    avgPrice: number;
  }) => void;
}) {
  const [q, setQ] = useState("");
  const [lots, setLots] = useState("1");
  const [price, setPrice] = useState("");
  const [picked, setPicked] = useState<(typeof UNIVERSE)[number] | null>(null);

  const matches = useMemo(() => {
    const s = q.trim().toUpperCase();
    if (s.length < 1) return [];
    return UNIVERSE.filter((u) => u.symbol.includes(s) || u.name.toUpperCase().includes(s)).slice(0, 6);
  }, [q]);

  const quoteMut = useMutation({
    mutationFn: (symbol: string) => getQuotes({ data: { symbols: [symbol] } }),
    onSuccess: (rows: Quote[]) => {
      const px = rows[0]?.price;
      if (px) setPrice(String(Math.round(px)));
    },
  });

  const choose = (u: (typeof UNIVERSE)[number]) => {
    setPicked(u);
    setQ(u.symbol);
    quoteMut.mutate(u.symbol);
  };

  const submit = () => {
    if (!picked) {
      toast.message("Pilih kode emiten dulu.");
      return;
    }
    const lotN = Number(lots);
    const px = Number(price);
    if (!Number.isFinite(lotN) || lotN <= 0) {
      toast.message("Lot tidak valid.");
      return;
    }
    if (!Number.isFinite(px) || px <= 0) {
      toast.message("Harga tidak valid.");
      return;
    }
    onAdd({
      symbol: picked.symbol,
      name: picked.name,
      sector: picked.sector,
      shares: lotN * LOT,
      avgPrice: px,
    });
  };

  return (
    <div className="mt-6 rounded-3xl bg-card p-4 shadow-[var(--shadow-border)] sm:p-5">
      <p className="font-display text-xl tracking-tight">Posisi baru</p>
      <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_7rem_8rem_auto]">
        <div className="relative">
          <Input
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setPicked(null);
            }}
            placeholder="Kode atau nama"
            aria-label="Cari emiten"
            autoComplete="off"
          />
          {matches.length && !picked ? (
            <ul className="absolute z-10 mt-1 w-full overflow-hidden rounded-2xl bg-popover shadow-[var(--shadow-border)]">
              {matches.map((u) => (
                <li key={u.symbol}>
                  <button
                    type="button"
                    className="flex w-full items-baseline justify-between gap-2 px-4 py-2.5 text-left text-sm hover:bg-accent"
                    onClick={() => choose(u)}
                  >
                    <span className="font-medium">{u.symbol}</span>
                    <span className="truncate text-muted-foreground">{u.name}</span>
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
        <Input
          type="number"
          min={0.01}
          step={1}
          value={lots}
          onChange={(e) => setLots(e.target.value)}
          aria-label="Lot"
          placeholder="Lot"
        />
        <Input
          type="number"
          min={1}
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          aria-label="Harga rata-rata"
          placeholder="Harga"
        />
        <div className="flex gap-2">
          <Button onClick={submit}>Simpan</Button>
          <Button variant="ghost" onClick={onCancel}>
            Batal
          </Button>
        </div>
      </div>
      <p className="mt-3 text-xs text-muted-foreground">1 lot = 100 lembar. Harga terisi otomatis dari papan.</p>
    </div>
  );
}
