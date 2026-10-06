"use client";

import { Bell, Star, Wallet, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { RangeBar } from "@/components/screener/range-bar";
import { Sparkline } from "@/components/screener/sparkline";
import { useDesk } from "@/lib/screener/desk-store";
import {
  formatCompactIDR,
  formatIDR,
  formatLots,
  formatMultiple,
  formatPct,
  formatPrice,
  formatRoe,
  LOT,
} from "@/lib/screener/format";
import { STRATEGIES } from "@/lib/screener/strategies";
import { useScreener } from "@/lib/screener/store";
import type { StockResult, StrategyId } from "@/lib/screener/types";
import { cn } from "@/lib/utils";

function FactorBar({ label, value }: { label: string; value: number }) {
  const tone = value >= 72 ? "bg-up" : value >= 58 ? "bg-warn" : "bg-muted-foreground/50";
  return (
    <div className="space-y-1.5">
      <div className="flex items-baseline justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-mono tabular-nums text-foreground">{Math.round(value)}</span>
      </div>
      <div className="h-1 overflow-hidden rounded-full bg-secondary">
        <div
          className={cn("h-full rounded-full transition-[width] duration-500 ease-out", tone)}
          style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
        />
      </div>
    </div>
  );
}

const VERDICT_COPY = {
  beli: "Layak beli",
  pertimbangkan: "Pertimbangkan",
  tunggu: "Tunggu konfirmasi",
};

export function StockDetail({ stock, onClose }: { stock: StockResult; onClose: () => void }) {
  const strategy = useScreener((s) => s.strategy);
  const watchlist = useScreener((s) => s.watchlist);
  const toggleWatch = useScreener((s) => s.toggleWatch);
  const saved = watchlist.includes(stock.symbol);
  const weights = STRATEGIES[strategy].weights;
  const up = stock.changePct >= 0;
  const rr =
    stock.price > stock.levels.stop
      ? (stock.levels.target - stock.price) / (stock.price - stock.levels.stop)
      : 0;
  const f = stock.fundamentals;

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="font-display text-2xl font-medium tracking-tight text-foreground">
              {stock.symbol}
            </h2>
            <Badge variant={stock.verdict}>{VERDICT_COPY[stock.verdict]}</Badge>
          </div>
          <p className="mt-0.5 text-sm text-muted-foreground">{stock.name}</p>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="size-11"
            aria-label={saved ? "Hapus dari watchlist" : "Simpan ke watchlist"}
            onClick={() => toggleWatch(stock.symbol)}
          >
            <Star className={cn("size-4", saved && "fill-primary text-primary")} />
          </Button>
          <Button variant="ghost" size="icon" className="size-11" onClick={onClose} aria-label="Tutup">
            <X className="size-4" />
          </Button>
        </div>
      </div>

      <div className="mt-4 flex items-end justify-between gap-3">
        <div>
          <p className="font-mono text-3xl font-medium tracking-tight tabular-nums">
            {formatPrice(stock.price)}
          </p>
          <p className={cn("mt-1 font-mono text-sm tabular-nums", up ? "text-up" : "text-down")}>
            {formatPct(stock.changePct)}
          </p>
        </div>
        {stock.spark.length > 2 ? (
          <Sparkline values={stock.spark} up={up} className="h-10 w-36" />
        ) : null}
      </div>

      <RangeBar className="mt-4" low={stock.week52Low} high={stock.week52High} value={stock.price} />

      <p className="mt-5 text-sm leading-relaxed text-foreground/90">{stock.thesis}</p>

      <div className="mt-5 grid grid-cols-3 gap-2">
        {[
          { k: "Stop", v: formatPrice(stock.levels.stop) },
          { k: "Target", v: formatPrice(stock.levels.target) },
          { k: "R:R", v: rr ? `${rr.toFixed(1)}×` : "—" },
        ].map((item) => (
          <div key={item.k} className="rounded-xl bg-secondary px-3 py-2.5">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">{item.k}</p>
            <p className="mt-1 font-mono text-sm tabular-nums">{item.v}</p>
          </div>
        ))}
      </div>

      <Separator className="my-5" />

      <div className="space-y-3">
        <FactorBar label={`Teknikal · ${Math.round(weights.technical * 100)}%`} value={stock.scores.technical} />
        <FactorBar
          label={`Fundamental · ${Math.round(weights.fundamental * 100)}%`}
          value={stock.scores.fundamental}
        />
        <FactorBar label={`Sentimen · ${Math.round(weights.sentiment * 100)}%`} value={stock.scores.sentiment} />
      </div>

      <div className="mt-5 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
        <Meta label="Sektor" value={stock.sector} />
        <Meta label="RSI" value={stock.indicators.rsi != null ? stock.indicators.rsi.toFixed(0) : "—"} />
        <Meta
          label="RVOL"
          value={stock.indicators.rvol != null ? `${stock.indicators.rvol.toFixed(1)}×` : "—"}
        />
        <Meta
          label="Posisi 52w"
          value={stock.indicators.pos52w != null ? `${stock.indicators.pos52w.toFixed(0)}%` : "—"}
        />
        <Meta label="Nilai" value={`Rp ${formatCompactIDR(stock.value)}`} />
        <Meta label="Support" value={formatPrice(stock.levels.support)} />
        <Meta label="PE" value={formatMultiple(f.pe)} />
        <Meta label="PB" value={formatMultiple(f.pb)} />
        <Meta label="ROE" value={formatRoe(f.roe)} />
        <Meta label="Dividen" value={f.divYield != null ? `${f.divYield.toFixed(1)}%` : "—"} />
        <Meta label="Kap." value={f.mcap ? `Rp ${formatCompactIDR(f.mcap)}` : "—"} />
        <Meta label="DER" value={formatMultiple(f.de)} />
      </div>

      {stock.flags.lq45 || stock.flags.dividend || stock.flags.soe || stock.flags.shariah ? (
        <div className="mt-4 flex flex-wrap gap-1.5">
          {stock.flags.lq45 ? <Badge>LQ45</Badge> : null}
          {stock.flags.idx30 ? <Badge>IDX30</Badge> : null}
          {stock.flags.soe ? <Badge>BUMN</Badge> : null}
          {stock.flags.dividend ? <Badge>Dividen</Badge> : null}
          {stock.flags.shariah ? <Badge>Syariah</Badge> : null}
        </div>
      ) : null}

      {stock.reasons.length ? (
        <div className="mt-5">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Alasan</p>
          <ul className="mt-2 space-y-1.5 text-sm text-foreground/90">
            {stock.reasons.map((r) => (
              <li key={r} className="flex gap-2">
                <span className="mt-2 size-1 shrink-0 rounded-full bg-up" />
                <span>{r}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {stock.risks.length ? (
        <div className="mt-4">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Risiko</p>
          <ul className="mt-2 space-y-1.5 text-sm text-foreground/90">
            {stock.risks.map((r) => (
              <li key={r} className="flex gap-2">
                <span className="mt-2 size-1 shrink-0 rounded-full bg-down" />
                <span>{r}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {stock.headlines.length ? (
        <div className="mt-5">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Berita</p>
          <ul className="mt-2 space-y-2">
            {stock.headlines.slice(0, 3).map((h) => (
              <li key={h.title} className="text-sm leading-snug">
                <p className="text-foreground/90">{h.title}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">{h.source}</p>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <DeskActions stock={stock} strategy={strategy} />
    </div>
  );
}

function DeskActions({ stock, strategy }: { stock: StockResult; strategy: StrategyId }) {
  const addAlert = useDesk((s) => s.addAlert);
  const addPosition = useDesk((s) => s.addPosition);
  const [lots, setLots] = useState("1");
  const [openBuy, setOpenBuy] = useState(false);

  const alertAt = (kind: "above" | "below", value: number, label: string) => {
    addAlert({ symbol: stock.symbol, name: stock.name, kind, value });
    toast.message(`Alert ${stock.symbol}`, {
      description: `${label} ${formatPrice(value)}`,
    });
  };

  const buy = () => {
    const n = Number(lots);
    if (!Number.isFinite(n) || n <= 0) {
      toast.message("Lot tidak valid.");
      return;
    }
    addPosition({
      symbol: stock.symbol,
      name: stock.name,
      sector: stock.sector,
      shares: n * LOT,
      avgPrice: stock.price,
      strategy,
      stop: stock.levels.stop,
      target: stock.levels.target,
    });
    setOpenBuy(false);
    toast.message(`${stock.symbol} masuk portofolio`, {
      description: `${formatLots(n * LOT)} @ ${formatPrice(stock.price)} · ${formatIDR(n * LOT * stock.price)}`,
    });
  };

  return (
    <div className="mt-6 space-y-3">
      <div className="grid grid-cols-2 gap-2">
        <Button
          variant="subtle"
          size="sm"
          className="h-11"
          onClick={() => alertAt("above", stock.levels.target, "di atas target")}
        >
          <Bell className="size-4" />
          Alert target
        </Button>
        <Button
          variant="subtle"
          size="sm"
          className="h-11"
          onClick={() => alertAt("below", stock.levels.stop, "di bawah stop")}
        >
          <Bell className="size-4" />
          Alert stop
        </Button>
      </div>
      {openBuy ? (
        <div className="rounded-2xl bg-secondary p-3">
          <label className="text-xs uppercase tracking-wide text-muted-foreground" htmlFor="lot-buy">
            Lot (100 lembar)
          </label>
          <div className="mt-2 flex gap-2">
            <Input
              id="lot-buy"
              type="number"
              min={0.01}
              value={lots}
              onChange={(e) => setLots(e.target.value)}
              className="h-11"
            />
            <Button className="h-11" onClick={buy}>
              Beli
            </Button>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            Estimasi {formatIDR((Number(lots) || 0) * LOT * stock.price)}
          </p>
        </div>
      ) : (
        <Button className="h-11 w-full" onClick={() => setOpenBuy(true)}>
          <Wallet className="size-4" />
          Masuk portofolio
        </Button>
      )}
    </div>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-2">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-mono text-xs tabular-nums">{value}</span>
    </div>
  );
}
