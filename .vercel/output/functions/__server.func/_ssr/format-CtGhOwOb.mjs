import { n as TSS_SERVER_FUNCTION, r as getServerFnById, t as createServerFn } from "./ssr.mjs";
import { a as object, n as array, o as string, t as _enum } from "../_libs/zod.mjs";
import { n as create, t as persist } from "../_libs/zustand.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/format-CtGhOwOb.js
var createSsrRpc = (functionId) => {
	const url = "/_serverFn/" + functionId;
	const serverFnMeta = { id: functionId };
	const fn = async (...args) => {
		return (await getServerFnById(functionId, { origin: "server" }))(...args);
	};
	return Object.assign(fn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
var strategySchema = _enum([
	"intraday",
	"swing",
	"invest"
]);
var lookbackSchema = _enum([
	"6mo",
	"1y",
	"2y"
]);
var getMarketOverview = createServerFn({ method: "GET" }).handler(createSsrRpc("188d632fbf615078a692c25743dd576addb6c625e679120cf0a02b872af73ecd"));
var runScreen = createServerFn({ method: "POST" }).validator((input) => object({
	strategy: strategySchema,
	sector: string().optional()
}).parse(input)).handler(createSsrRpc("6eaf54abdfd734364375eee1d24f9c131579fc8e6952e40428d59ffcf07f3b9f"));
var getQuotes = createServerFn({ method: "POST" }).validator((input) => object({ symbols: array(string().min(1).max(12)).max(80) }).parse(input)).handler(createSsrRpc("765611b3632ae0a729aafd72c1f6f1412018add583950a4f05378361c1ccd7ac"));
var runBacktestFn = createServerFn({ method: "POST" }).validator((input) => object({
	strategy: strategySchema,
	lookback: lookbackSchema,
	sector: string().optional()
}).parse(input)).handler(createSsrRpc("15c8f22f741e68b1e8de96535b5cdc1f4be31d59c834918178aead72f7da7d29"));
function nid() {
	return `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;
}
var useDesk = create()(persist((set, get) => ({
	alerts: [],
	notices: [],
	positions: [],
	closed: [],
	screenPing: true,
	addAlert: (input) => {
		const id = nid();
		set({ alerts: [{
			...input,
			id,
			createdAt: Date.now(),
			enabled: true
		}, ...get().alerts.filter((a) => !(a.symbol === input.symbol && a.kind === input.kind && a.value === input.value))].slice(0, 40) });
		return id;
	},
	removeAlert: (id) => set({ alerts: get().alerts.filter((a) => a.id !== id) }),
	toggleAlert: (id) => set({ alerts: get().alerts.map((a) => a.id === id ? {
		...a,
		enabled: !a.enabled
	} : a) }),
	markFired: (id) => set({ alerts: get().alerts.map((a) => a.id === id ? {
		...a,
		lastFiredAt: Date.now()
	} : a) }),
	pushNotice: (input) => {
		set({ notices: [{
			...input,
			id: nid(),
			at: Date.now(),
			read: false
		}, ...get().notices].slice(0, 40) });
	},
	markRead: (id) => set({ notices: get().notices.map((n) => n.id === id ? {
		...n,
		read: true
	} : n) }),
	markAllRead: () => set({ notices: get().notices.map((n) => ({
		...n,
		read: true
	})) }),
	clearNotices: () => set({ notices: [] }),
	setScreenPing: (v) => set({ screenPing: v }),
	addPosition: (input) => {
		const cur = get().positions;
		const existing = cur.find((p) => p.symbol === input.symbol);
		if (existing) {
			const shares = existing.shares + input.shares;
			const avgPrice = (existing.avgPrice * existing.shares + input.avgPrice * input.shares) / shares;
			set({ positions: cur.map((p) => p.id === existing.id ? {
				...p,
				shares,
				avgPrice,
				stop: input.stop ?? p.stop,
				target: input.target ?? p.target,
				strategy: input.strategy ?? p.strategy
			} : p) });
			return;
		}
		set({ positions: [{
			id: nid(),
			...input,
			openedAt: Date.now()
		}, ...cur] });
	},
	sellPosition: (id, shares, exitPrice) => {
		const pos = get().positions.find((p) => p.id === id);
		if (!pos) return;
		const qty = Math.min(shares, pos.shares);
		const closed = {
			id: nid(),
			symbol: pos.symbol,
			name: pos.name,
			shares: qty,
			avgPrice: pos.avgPrice,
			exitPrice,
			openedAt: pos.openedAt,
			closedAt: Date.now()
		};
		const remain = pos.shares - qty;
		set({
			closed: [closed, ...get().closed].slice(0, 80),
			positions: remain <= 0 ? get().positions.filter((p) => p.id !== id) : get().positions.map((p) => p.id === id ? {
				...p,
				shares: remain
			} : p)
		});
	},
	updateLevels: (id, levels) => set({ positions: get().positions.map((p) => p.id === id ? {
		...p,
		...levels
	} : p) }),
	markRisk: (id) => set({ positions: get().positions.map((p) => p.id === id ? {
		...p,
		lastRiskAt: Date.now()
	} : p) })
}), {
	name: "saring-desk-v1",
	partialize: (s) => ({
		alerts: s.alerts,
		notices: s.notices,
		positions: s.positions,
		closed: s.closed,
		screenPing: s.screenPing
	})
}));
function positionMetrics(p, price) {
	const cost = p.shares * p.avgPrice;
	const value = price != null ? p.shares * price : cost;
	const pnl = value - cost;
	return {
		cost,
		value,
		pnl,
		pct: cost ? pnl / cost * 100 : 0
	};
}
function formatIDR(n, maximumFractionDigits = 0) {
	if (!Number.isFinite(n)) return "—";
	return new Intl.NumberFormat("id-ID", {
		style: "currency",
		currency: "IDR",
		maximumFractionDigits,
		minimumFractionDigits: 0
	}).format(n);
}
function formatPrice(n) {
	if (!Number.isFinite(n)) return "—";
	const digits = n >= 1e3 ? 0 : n >= 100 ? 1 : 2;
	return new Intl.NumberFormat("id-ID", {
		maximumFractionDigits: digits,
		minimumFractionDigits: 0
	}).format(n);
}
function formatCompactIDR(n) {
	if (!Number.isFinite(n) || n === 0) return "0";
	const abs = Math.abs(n);
	const sign = n < 0 ? "−" : "";
	if (abs >= 0xe8d4a51000) return `${sign}${(abs / 0xe8d4a51000).toFixed(abs >= 0x9184e72a000 ? 1 : 2).replace(/\.0+$/, "")} T`;
	if (abs >= 1e9) return `${sign}${(abs / 1e9).toFixed(abs >= 1e10 ? 1 : 2).replace(/\.0+$/, "")} M`;
	if (abs >= 1e6) return `${sign}${(abs / 1e6).toFixed(1).replace(/\.0+$/, "")} jt`;
	if (abs >= 1e3) return `${sign}${(abs / 1e3).toFixed(1).replace(/\.0+$/, "")} rb`;
	return `${sign}${Math.round(abs)}`;
}
function formatPct(n, digits = 2) {
	if (!Number.isFinite(n)) return "—";
	return `${n > 0 ? "+" : ""}${n.toFixed(digits)}%`;
}
function formatJakarta(ts) {
	return new Intl.DateTimeFormat("id-ID", {
		timeZone: "Asia/Jakarta",
		weekday: "short",
		day: "numeric",
		month: "short",
		hour: "2-digit",
		minute: "2-digit",
		hourCycle: "h23"
	}).format(new Date(ts));
}
function formatMultiple(n, digits = 1) {
	if (n == null || !Number.isFinite(n)) return "—";
	return `${n.toFixed(digits)}×`;
}
function formatRoe(n) {
	if (n == null || !Number.isFinite(n)) return "—";
	return `${n.toFixed(n >= 10 ? 0 : 1)}%`;
}
function formatDateShort(ts) {
	return new Intl.DateTimeFormat("id-ID", {
		timeZone: "Asia/Jakarta",
		day: "numeric",
		month: "short"
	}).format(new Date(ts));
}
function formatLots(shares) {
	const lots = shares / 100;
	return `${Number.isInteger(lots) ? String(lots) : lots.toFixed(2).replace(/\.?0+$/, "")} lot`;
}
//#endregion
export { formatLots as a, formatPrice as c, getQuotes as d, positionMetrics as f, useDesk as h, formatJakarta as i, formatRoe as l, runScreen as m, formatDateShort as n, formatMultiple as o, runBacktestFn as p, formatIDR as r, formatPct as s, formatCompactIDR as t, getMarketOverview as u };
