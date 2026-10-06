"use client";

import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useRef } from "react";
import { toast } from "sonner";
import { getQuotes } from "@/lib/screener/actions";
import { useDesk } from "@/lib/screener/desk-store";
import { formatPct, formatPrice } from "@/lib/screener/format";

const COOLDOWN = 6 * 60 * 60 * 1000;

function ping(title: string, body: string) {
  toast.message(title, { description: body });
  if (typeof Notification !== "undefined" && Notification.permission === "granted") {
    try {
      new Notification(title, { body, icon: "/favicon.svg" });
    } catch {
      /* preview / iframe may block */
    }
  }
}

export function AlertWatcher() {
  const alerts = useDesk((s) => s.alerts);
  const positions = useDesk((s) => s.positions);
  const pushNotice = useDesk((s) => s.pushNotice);
  const markFired = useDesk((s) => s.markFired);
  const markRisk = useDesk((s) => s.markRisk);
  const seen = useRef<string>("");

  const symbols = useMemo(() => {
    const set = new Set<string>();
    for (const a of alerts) if (a.enabled) set.add(a.symbol);
    for (const p of positions) set.add(p.symbol);
    return [...set];
  }, [alerts, positions]);

  const query = useQuery({
    queryKey: ["quotes", symbols.join(",")],
    queryFn: () => getQuotes({ data: { symbols } }),
    enabled: symbols.length > 0,
    refetchInterval: 90_000,
  });

  useEffect(() => {
    const rows = query.data;
    if (!rows?.length) return;
    const stamp = `${query.dataUpdatedAt}:${rows.map((r) => r.symbol + r.price).join("|")}`;
    if (stamp === seen.current) return;
    seen.current = stamp;
    const now = Date.now();
    const bySym = new Map(rows.map((r) => [r.symbol, r]));
    const desk = useDesk.getState();

    for (const alert of desk.alerts) {
      if (!alert.enabled) continue;
      if (alert.lastFiredAt && now - alert.lastFiredAt < COOLDOWN) continue;
      const q = bySym.get(alert.symbol);
      if (!q) continue;
      let hit = false;
      let body = "";
      if (alert.kind === "above" && q.price >= alert.value) {
        hit = true;
        body = `${alert.symbol} ${formatPrice(q.price)} menembus ${formatPrice(alert.value)}.`;
      } else if (alert.kind === "below" && q.price <= alert.value) {
        hit = true;
        body = `${alert.symbol} ${formatPrice(q.price)} turun ke ${formatPrice(alert.value)}.`;
      } else if (alert.kind === "change" && Math.abs(q.changePct) >= alert.value) {
        hit = true;
        body = `${alert.symbol} bergerak ${formatPct(q.changePct)} hari ini.`;
      }
      if (!hit) continue;
      const title = `Alert ${alert.symbol}`;
      desk.pushNotice({ title, body, symbol: alert.symbol, kind: "alert" });
      desk.markFired(alert.id);
      ping(title, body);
    }

    for (const pos of desk.positions) {
      if (pos.lastRiskAt && now - pos.lastRiskAt < COOLDOWN) continue;
      const q = bySym.get(pos.symbol);
      if (!q) continue;
      if (pos.stop != null && q.price <= pos.stop) {
        const title = `Stop ${pos.symbol}`;
        const body = `Harga ${formatPrice(q.price)} menyentuh stop ${formatPrice(pos.stop)}.`;
        desk.pushNotice({ title, body, symbol: pos.symbol, kind: "portfolio" });
        desk.markRisk(pos.id);
        ping(title, body);
      } else if (pos.target != null && q.price >= pos.target) {
        const title = `Target ${pos.symbol}`;
        const body = `Harga ${formatPrice(q.price)} mencapai target ${formatPrice(pos.target)}.`;
        desk.pushNotice({ title, body, symbol: pos.symbol, kind: "portfolio" });
        desk.markRisk(pos.id);
        ping(title, body);
      }
    }
  }, [query.data, query.dataUpdatedAt, pushNotice, markFired, markRisk]);

  return null;
}
