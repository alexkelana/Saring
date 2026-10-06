"use client";

import { formatDateShort, formatPct } from "@/lib/screener/format";
import type { EquityPoint } from "@/lib/screener/types";
import { cn } from "@/lib/utils";

export function EquityChart({ series, className }: { series: EquityPoint[]; className?: string }) {
  if (series.length < 2) return <div className={cn("h-40 rounded-2xl bg-secondary", className)} />;
  const values = series.map((p) => p.v);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const w = 640;
  const h = 220;
  const pad = 8;
  const coords = series.map((p, i) => {
    const x = pad + (i / (series.length - 1)) * (w - pad * 2);
    const y = pad + (1 - (p.v - min) / span) * (h - pad * 2);
    return { x, y, p };
  });
  const line = coords.map((c, i) => `${i === 0 ? "M" : "L"}${c.x.toFixed(1)} ${c.y.toFixed(1)}`).join(" ");
  const area = `${line} L${coords[coords.length - 1]!.x.toFixed(1)} ${h - pad} L${coords[0]!.x.toFixed(1)} ${h - pad} Z`;
  const start = values[0]!;
  const last = values[values.length - 1]!;
  const up = last >= start;
  const ret = ((last - start) / start) * 100;
  const stroke = up ? "var(--color-up)" : "var(--color-down)";

  return (
    <div className={cn("rounded-3xl bg-card p-4 shadow-[var(--shadow-border)] sm:p-5", className)}>
      <div className="flex items-baseline justify-between gap-3">
        <p className="text-xs uppercase tracking-wide text-muted-foreground">Kurva ekuitas</p>
        <p className={cn("font-mono text-sm tabular-nums", up ? "text-up" : "text-down")}>{formatPct(ret)}</p>
      </div>
      <svg viewBox={`0 0 ${w} ${h}`} className="mt-3 h-44 w-full" role="img" aria-label="Kurva ekuitas backtest">
        <path d={area} fill={stroke} opacity="0.14" />
        <path d={line} fill="none" stroke={stroke} strokeWidth="2.2" strokeLinejoin="round" strokeLinecap="round" />
      </svg>
      <div className="mt-1 flex justify-between text-xs text-muted-foreground">
        <span>{formatDateShort(series[0]!.t)}</span>
        <span>{formatDateShort(series[series.length - 1]!.t)}</span>
      </div>
    </div>
  );
}
