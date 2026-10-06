"use client";

import { useQuery } from "@tanstack/react-query";
import { Link, useRouterState } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { NoticeBell } from "@/components/screener/notice-bell";
import { getMarketOverview } from "@/lib/screener/actions";
import { formatJakarta, formatPct, formatPrice } from "@/lib/screener/format";
import type { MarketSnapshot } from "@/lib/screener/types";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/", label: "Saring", exact: true },
  { to: "/portfolio", label: "Portofolio", exact: false },
  { to: "/backtest", label: "Backtest", exact: false },
] as const;

export function AppShell({
  children,
  market,
}: {
  children: ReactNode;
  market?: MarketSnapshot;
}) {
  const marketQuery = useQuery({
    queryKey: ["ihsg"],
    queryFn: () => getMarketOverview(),
    initialData: market,
    refetchInterval: 90_000,
  });
  const snap = marketQuery.data;
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div className="relative mx-auto min-h-dvh w-full max-w-[1320px] px-4 pb-16 pt-5 sm:px-6 lg:px-8">
      <header className="saring-enter flex flex-col gap-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.22em] text-muted-foreground">
              Screener saham BEI
            </p>
            <h1 className="mt-1 font-display text-4xl italic leading-none tracking-tight sm:text-5xl">
              saring
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <NoticeBell />
            <MarketChip
              price={snap?.price}
              changePct={snap?.changePct}
              statusLabel={snap?.statusLabel}
              asOf={snap?.asOf}
            />
          </div>
        </div>
        <nav className="flex flex-wrap items-center gap-1.5" aria-label="Bagian aplikasi">
          {NAV.map((item) => {
            const active = item.exact ? pathname === item.to : pathname === item.to || pathname.startsWith(`${item.to}/`);
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "inline-flex h-11 items-center rounded-full px-4 text-sm transition-[background-color,color] duration-150",
                  active
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-muted-foreground hover:text-foreground",
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </header>
      {children}
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
        <span className="text-xs uppercase tracking-wide text-muted-foreground">IHSG</span>
        <span className="font-mono text-lg tabular-nums">{price ? formatPrice(price) : "—"}</span>
        <span className={cn("font-mono text-sm tabular-nums", up ? "text-up" : "text-down")}>
          {changePct != null ? formatPct(changePct) : ""}
        </span>
      </div>
      <p className="mt-0.5 text-xs text-muted-foreground">
        {statusLabel ?? "Memuat"}
        {asOf ? ` · ${formatJakarta(asOf)}` : ""}
      </p>
    </div>
  );
}
