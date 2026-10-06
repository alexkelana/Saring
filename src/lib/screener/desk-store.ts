import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { StrategyId } from "./types";

export type AlertKind = "above" | "below" | "change";

export type PriceAlert = {
  id: string;
  symbol: string;
  name: string;
  kind: AlertKind;
  value: number;
  createdAt: number;
  lastFiredAt?: number;
  enabled: boolean;
};

export type NoticeKind = "alert" | "screen" | "portfolio" | "system";

export type Notice = {
  id: string;
  title: string;
  body: string;
  at: number;
  read: boolean;
  symbol?: string;
  kind: NoticeKind;
};

export type Position = {
  id: string;
  symbol: string;
  name: string;
  sector: string;
  shares: number;
  avgPrice: number;
  openedAt: number;
  strategy?: StrategyId;
  stop?: number;
  target?: number;
  lastRiskAt?: number;
};

export type ClosedTrade = {
  id: string;
  symbol: string;
  name: string;
  shares: number;
  avgPrice: number;
  exitPrice: number;
  openedAt: number;
  closedAt: number;
};

function nid() {
  return `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;
}

type DeskState = {
  alerts: PriceAlert[];
  notices: Notice[];
  positions: Position[];
  closed: ClosedTrade[];
  screenPing: boolean;
  addAlert: (input: Omit<PriceAlert, "id" | "createdAt" | "enabled" | "lastFiredAt">) => string;
  removeAlert: (id: string) => void;
  toggleAlert: (id: string) => void;
  markFired: (id: string) => void;
  pushNotice: (input: Omit<Notice, "id" | "at" | "read">) => void;
  markRead: (id: string) => void;
  markAllRead: () => void;
  clearNotices: () => void;
  setScreenPing: (v: boolean) => void;
  addPosition: (input: {
    symbol: string;
    name: string;
    sector: string;
    shares: number;
    avgPrice: number;
    strategy?: StrategyId;
    stop?: number;
    target?: number;
  }) => void;
  sellPosition: (id: string, shares: number, exitPrice: number) => void;
  updateLevels: (id: string, levels: { stop?: number; target?: number }) => void;
  markRisk: (id: string) => void;
};

export const useDesk = create<DeskState>()(
  persist(
    (set, get) => ({
      alerts: [],
      notices: [],
      positions: [],
      closed: [],
      screenPing: true,
      addAlert: (input) => {
        const id = nid();
        set({
          alerts: [
            { ...input, id, createdAt: Date.now(), enabled: true },
            ...get().alerts.filter((a) => !(a.symbol === input.symbol && a.kind === input.kind && a.value === input.value)),
          ].slice(0, 40),
        });
        return id;
      },
      removeAlert: (id) => set({ alerts: get().alerts.filter((a) => a.id !== id) }),
      toggleAlert: (id) =>
        set({
          alerts: get().alerts.map((a) => (a.id === id ? { ...a, enabled: !a.enabled } : a)),
        }),
      markFired: (id) =>
        set({
          alerts: get().alerts.map((a) => (a.id === id ? { ...a, lastFiredAt: Date.now() } : a)),
        }),
      pushNotice: (input) => {
        const next: Notice = { ...input, id: nid(), at: Date.now(), read: false };
        set({ notices: [next, ...get().notices].slice(0, 40) });
      },
      markRead: (id) =>
        set({
          notices: get().notices.map((n) => (n.id === id ? { ...n, read: true } : n)),
        }),
      markAllRead: () => set({ notices: get().notices.map((n) => ({ ...n, read: true })) }),
      clearNotices: () => set({ notices: [] }),
      setScreenPing: (v) => set({ screenPing: v }),
      addPosition: (input) => {
        const cur = get().positions;
        const existing = cur.find((p) => p.symbol === input.symbol);
        if (existing) {
          const shares = existing.shares + input.shares;
          const avgPrice = (existing.avgPrice * existing.shares + input.avgPrice * input.shares) / shares;
          set({
            positions: cur.map((p) =>
              p.id === existing.id
                ? {
                    ...p,
                    shares,
                    avgPrice,
                    stop: input.stop ?? p.stop,
                    target: input.target ?? p.target,
                    strategy: input.strategy ?? p.strategy,
                  }
                : p,
            ),
          });
          return;
        }
        set({
          positions: [
            {
              id: nid(),
              ...input,
              openedAt: Date.now(),
            },
            ...cur,
          ],
        });
      },
      sellPosition: (id, shares, exitPrice) => {
        const pos = get().positions.find((p) => p.id === id);
        if (!pos) return;
        const qty = Math.min(shares, pos.shares);
        const closed: ClosedTrade = {
          id: nid(),
          symbol: pos.symbol,
          name: pos.name,
          shares: qty,
          avgPrice: pos.avgPrice,
          exitPrice,
          openedAt: pos.openedAt,
          closedAt: Date.now(),
        };
        const remain = pos.shares - qty;
        set({
          closed: [closed, ...get().closed].slice(0, 80),
          positions: remain <= 0 ? get().positions.filter((p) => p.id !== id) : get().positions.map((p) => (p.id === id ? { ...p, shares: remain } : p)),
        });
      },
      updateLevels: (id, levels) =>
        set({
          positions: get().positions.map((p) => (p.id === id ? { ...p, ...levels } : p)),
        }),
      markRisk: (id) =>
        set({
          positions: get().positions.map((p) => (p.id === id ? { ...p, lastRiskAt: Date.now() } : p)),
        }),
    }),
    {
      name: "saring-desk-v1",
      partialize: (s) => ({
        alerts: s.alerts,
        notices: s.notices,
        positions: s.positions,
        closed: s.closed,
        screenPing: s.screenPing,
      }),
    },
  ),
);

export function positionMetrics(p: Position, price?: number) {
  const cost = p.shares * p.avgPrice;
  const value = price != null ? p.shares * price : cost;
  const pnl = value - cost;
  const pct = cost ? (pnl / cost) * 100 : 0;
  return { cost, value, pnl, pct };
}
