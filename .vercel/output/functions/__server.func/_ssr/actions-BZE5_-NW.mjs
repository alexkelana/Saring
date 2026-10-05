import { n as TSS_SERVER_FUNCTION, t as createServerFn } from "./ssr.mjs";
import { a as UNIVERSE_BY_SYMBOL, c as sizeFromMcap, l as yahooSymbol, o as cleanName, r as STRATEGIES, s as mapSector } from "./universe-C_BugJ9r.mjs";
import { a as string, i as object, t as _enum } from "../_libs/zod.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/actions-BZE5_-NW.js
var createServerRpc = (serverFnMeta, splitImportFn) => {
	const url = "/_serverFn/" + serverFnMeta.id;
	return Object.assign(splitImportFn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
var POSITIVE = [
	"laba",
	"untung",
	"dividen",
	"ekspansi",
	"kontrak",
	"kerja sama",
	"kerjasama",
	"menguat",
	"meroket",
	"rekor",
	"buyback",
	"upgrade",
	"rekomendasi beli",
	"pertumbuhan",
	"positif",
	"di atas ekspektasi",
	"kalahkan",
	"capex",
	"oversubscribe",
	"breakout",
	"sentimen positif",
	"naik signifikan",
	"raih"
];
var NEGATIVE = [
	"rugi",
	"merugi",
	"gagal bayar",
	"default",
	"suspensi",
	"suspend",
	"fraud",
	"penipuan",
	"denda",
	"phk",
	"melemah",
	"koreksi dalam",
	"restatement",
	"investigasi",
	"gorengan",
	"unusual market",
	"delisting",
	"pkpu",
	"pailit",
	"korupsi",
	"kpk",
	"gagal",
	"turun tajam",
	"diragukan",
	"banjir",
	"kecelakaan"
];
function scoreHeadlines(headlines) {
	if (!headlines.length) return {
		sentiment: 50,
		tags: []
	};
	let acc = 50;
	const tags = [];
	for (const h of headlines) {
		const t = h.title.toLowerCase();
		for (const w of POSITIVE) if (t.includes(w)) {
			acc += 7;
			if (tags.length < 2) tags.push(w);
		}
		for (const w of NEGATIVE) if (t.includes(w)) {
			acc -= 11;
			if (tags.length < 3) tags.push(w);
		}
	}
	return {
		sentiment: Math.max(12, Math.min(88, acc)),
		tags
	};
}
function sentimentLabel(score) {
	if (score >= 68) return "positif";
	if (score >= 55) return "agak positif";
	if (score <= 32) return "negatif";
	if (score <= 45) return "agak negatif";
	return "netral";
}
function lastBarsSpark(bars, n = 24) {
	const closes = bars.map((b) => b.c).filter((c) => Number.isFinite(c));
	if (closes.length <= n) return closes;
	return closes.slice(-n);
}
function clamp(n, lo = 0, hi = 100) {
	return Math.min(hi, Math.max(lo, n));
}
function round(n, digits = 0) {
	const p = 10 ** digits;
	return Math.round(n * p) / p;
}
async function mapPool$1(items, limit, fn) {
	const out = new Array(items.length);
	let cursor = 0;
	async function worker() {
		while (true) {
			const i = cursor++;
			if (i >= items.length) return;
			out[i] = await fn(items[i]);
		}
	}
	await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
	return out;
}
function decodeXml(s) {
	return s.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1").replace(/&/g, "&").replace(/</g, "<").replace(/>/g, ">").replace(/"/g, "\"").replace(/&#39;/g, "'").replace(/'/g, "'");
}
function parseRss(xml, limit = 4) {
	const items = xml.split(/<item>/i).slice(1, limit + 1);
	const out = [];
	for (const item of items) {
		const title = item.match(/<title>([\s\S]*?)<\/title>/i)?.[1];
		const source = item.match(/<source[^>]*>([\s\S]*?)<\/source>/i)?.[1] ?? item.match(/<dc:creator>([\s\S]*?)<\/dc:creator>/i)?.[1] ?? "Berita";
		const date = item.match(/<pubDate>([\s\S]*?)<\/pubDate>/i)?.[1] ?? "";
		if (!title) continue;
		const clean = decodeXml(title).replace(/\s+/g, " ").trim();
		if (!clean) continue;
		out.push({
			title: clean.replace(/\s+-\s+[^-]+$/, ""),
			source: decodeXml(source).trim(),
			date: decodeXml(date).trim()
		});
	}
	return out;
}
var newsCache = /* @__PURE__ */ new Map();
var NEWS_TTL = 12e5;
async function fetchHeadlines(symbol, name) {
	const key = symbol;
	const hit = newsCache.get(key);
	if (hit && Date.now() - hit.at < NEWS_TTL) return hit.value;
	const url = `https://news.google.com/rss/search?q=${encodeURIComponent(`${symbol} saham`)}&hl=id&gl=ID&ceid=ID:id`;
	try {
		const res = await fetch(url, {
			headers: {
				"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
				Accept: "application/rss+xml, application/xml, text/xml"
			},
			signal: AbortSignal.timeout(2500)
		});
		if (!res.ok) {
			newsCache.set(key, {
				at: Date.now(),
				value: []
			});
			return [];
		}
		const xml = await res.text();
		const first = name.split(" ")[0].toUpperCase();
		const headlines = parseRss(xml, 4).filter((h) => {
			const t = h.title.toUpperCase();
			return t.includes(symbol) || t.includes(first) || t.includes("SAHAM") || t.includes("IHSG") || t.includes("BEI");
		});
		const value = headlines.length ? headlines : parseRss(xml, 3);
		newsCache.set(key, {
			at: Date.now(),
			value
		});
		return value;
	} catch {
		newsCache.set(key, {
			at: Date.now(),
			value: []
		});
		return [];
	}
}
async function fetchHeadlinesFor(stocks) {
	const rows = await mapPool$1(stocks, 6, (s) => fetchHeadlines(s.symbol, s.name));
	const map = /* @__PURE__ */ new Map();
	stocks.forEach((s, i) => map.set(s.symbol, rows[i] ?? []));
	return map;
}
var UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36";
var TTL_MS = 72e4;
var chartCache = /* @__PURE__ */ new Map();
function fromCache(entry) {
	if (!entry) return null;
	if (Date.now() - entry.at > TTL_MS) return null;
	return entry.value;
}
async function mapPool(items, limit, fn) {
	const out = new Array(items.length);
	let cursor = 0;
	async function worker() {
		while (true) {
			const i = cursor++;
			if (i >= items.length) return;
			out[i] = await fn(items[i], i);
		}
	}
	const n = Math.min(limit, items.length);
	await Promise.all(Array.from({ length: n }, worker));
	return out;
}
async function fetchJson(url, timeoutMs = 4e3) {
	try {
		const res = await fetch(url, {
			headers: {
				"User-Agent": UA,
				Accept: "application/json"
			},
			signal: AbortSignal.timeout(timeoutMs)
		});
		if (!res.ok) return null;
		return await res.json();
	} catch {
		return null;
	}
}
async function fetchChart(symbol, range = "6mo") {
	const y = yahooSymbol(symbol);
	const key = `${y}:${range}`;
	const hit = fromCache(chartCache.get(key));
	if (hit !== null) return hit;
	const result = (await fetchJson(`https://query2.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(y)}?range=${range}&interval=1d&events=div`, 4e3))?.chart?.result?.[0];
	if (!result?.timestamp?.length || !result.indicators?.quote?.[0]) {
		chartCache.set(key, {
			at: Date.now(),
			value: null
		});
		return null;
	}
	const q = result.indicators.quote[0];
	const bars = [];
	for (let i = 0; i < result.timestamp.length; i++) {
		const o = q.open?.[i];
		const h = q.high?.[i];
		const l = q.low?.[i];
		const c = q.close?.[i];
		const v = q.volume?.[i];
		if (![
			o,
			h,
			l,
			c
		].every((x) => typeof x === "number" && Number.isFinite(x))) continue;
		bars.push({
			t: result.timestamp[i] * 1e3,
			o,
			h,
			l,
			c,
			v: typeof v === "number" && Number.isFinite(v) ? v : 0
		});
	}
	if (bars.length < 12) {
		chartCache.set(key, {
			at: Date.now(),
			value: null
		});
		return null;
	}
	const meta = result.meta ?? {};
	const last = bars[bars.length - 1];
	const price = meta.regularMarketPrice ?? last.c;
	const prev = meta.chartPreviousClose ?? meta.previousClose ?? bars[bars.length - 2]?.c ?? last.c;
	const dividends = Object.values(result.events?.dividends ?? {}).map((d) => ({
		amount: d.amount ?? 0,
		date: (d.date ?? 0) * 1e3
	})).filter((d) => d.amount > 0).sort((a, b) => b.date - a.date);
	const bundle = {
		symbol: y.replace(/\.JK$/i, ""),
		name: meta.shortName ?? meta.longName ?? symbol,
		price,
		prevClose: prev,
		changePct: prev ? (price - prev) / prev * 100 : meta.regularMarketChangePercent ?? 0,
		volume: meta.regularMarketVolume ?? last.v,
		dayHigh: meta.regularMarketDayHigh ?? last.h,
		dayLow: meta.regularMarketDayLow ?? last.l,
		week52High: meta.fiftyTwoWeekHigh ?? Math.max(...bars.map((b) => b.h)),
		week52Low: meta.fiftyTwoWeekLow ?? Math.min(...bars.map((b) => b.l)),
		currency: meta.currency ?? "IDR",
		bars,
		dividends
	};
	chartCache.set(key, {
		at: Date.now(),
		value: bundle
	});
	return bundle;
}
async function fetchCharts(symbols) {
	try {
		return (await mapPool(symbols.slice(0, 12), 5, async (symbol) => fetchChart(symbol))).filter((r) => r !== null);
	} catch {
		return [];
	}
}
function jakartaParts(date = /* @__PURE__ */ new Date()) {
	const fmt = new Intl.DateTimeFormat("en-GB", {
		timeZone: "Asia/Jakarta",
		weekday: "short",
		hour: "2-digit",
		minute: "2-digit",
		hourCycle: "h23",
		year: "numeric",
		month: "2-digit",
		day: "2-digit"
	});
	const parts = Object.fromEntries(fmt.formatToParts(date).map((p) => [p.type, p.value]));
	const hour = Number(parts.hour);
	const minute = Number(parts.minute);
	const mins = hour * 60 + minute;
	const weekday = parts.weekday;
	return {
		hour,
		minute,
		mins,
		weekday,
		isWeekend: weekday === "Sat" || weekday === "Sun",
		parts
	};
}
function marketStatus() {
	const { mins, isWeekend } = jakartaParts();
	if (isWeekend) return {
		status: "closed",
		statusLabel: "Tutup (akhir pekan)"
	};
	if (mins < 540) return {
		status: "pre",
		statusLabel: "Pra-pembukaan"
	};
	if (mins >= 540 && mins < 690) return {
		status: "open",
		statusLabel: "Sesi 1"
	};
	if (mins >= 690 && mins < 810) return {
		status: "break",
		statusLabel: "Istirahat"
	};
	if (mins >= 810 && mins < 960) return {
		status: "open",
		statusLabel: "Sesi 2"
	};
	return {
		status: "closed",
		statusLabel: "Tutup"
	};
}
var TV_URL = "https://scanner.tradingview.com/indonesia/scan";
var COLUMNS = [
	"name",
	"description",
	"close",
	"change",
	"open",
	"high",
	"low",
	"volume",
	"Value.Traded",
	"RSI",
	"RSI|60",
	"SMA20",
	"SMA50",
	"SMA200",
	"EMA10",
	"MACD.macd",
	"MACD.signal",
	"ATR",
	"Mom",
	"relative_volume_10d_calc",
	"price_52_week_high",
	"price_52_week_low",
	"Perf.W",
	"Perf.1M",
	"Perf.3M",
	"Perf.6M",
	"market_cap_basic",
	"price_earnings_ttm",
	"price_book_ratio",
	"return_on_equity",
	"debt_to_equity",
	"dividends_yield_current",
	"earnings_per_share_diluted_yoy_growth_ttm",
	"sector",
	"industry",
	"Recommend.All",
	"Volatility.D"
];
var snapCache = null;
var marketCache = null;
var SNAP_TTL = 48e4;
var MARKET_TTL = 6e4;
function num(v) {
	return typeof v === "number" && Number.isFinite(v) ? v : null;
}
function str(v) {
	return typeof v === "string" ? v : v == null ? "" : String(v);
}
function asRoePct(v) {
	if (v == null) return null;
	const pct = Math.abs(v) <= 1 ? v * 100 : v;
	if (!Number.isFinite(pct)) return null;
	return Math.max(-80, Math.min(200, pct));
}
function asClamped(v, lo, hi) {
	if (v == null || !Number.isFinite(v)) return null;
	return Math.max(lo, Math.min(hi, v));
}
async function tvScan(body, timeoutMs = 1e4) {
	const res = await fetch(TV_URL, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
			Origin: "https://www.tradingview.com",
			Referer: "https://www.tradingview.com/"
		},
		body: JSON.stringify(body),
		signal: AbortSignal.timeout(timeoutMs)
	});
	if (!res.ok) throw new Error(`TradingView ${res.status}`);
	return res.json();
}
function parseRow(symbolRaw, d) {
	const get = (i) => d[i];
	const code = str(get(0)).toUpperCase() || symbolRaw.replace(/^IDX:/i, "").toUpperCase();
	if (!/^[A-Z]{4}$/.test(code)) return null;
	const price = num(get(2));
	if (price == null || price <= 0) return null;
	const changePct = num(get(3)) ?? 0;
	const prevClose = changePct !== -100 ? price / (1 + changePct / 100) : price;
	const overlay = UNIVERSE_BY_SYMBOL.get(code);
	const industry = str(get(34));
	const tvSector = str(get(33));
	const mcap = num(get(26));
	const pe = asClamped(num(get(27)), -50, 400);
	const pb = asClamped(num(get(28)), 0, 80);
	const roe = asRoePct(num(get(29)));
	const de = asClamped(num(get(30)), 0, 40);
	const divYield = asClamped(num(get(31)), 0, 40);
	const epsGrowth = asClamped(num(get(32)), -90, 120);
	return {
		symbol: code,
		name: overlay?.name ?? cleanName(str(get(1))) ?? code,
		sector: overlay?.sector ?? mapSector(tvSector, industry),
		industry,
		size: sizeFromMcap(mcap),
		flags: overlay?.flags ?? {},
		price,
		prevClose,
		changePct,
		open: num(get(4)) ?? price,
		high: num(get(5)) ?? price,
		low: num(get(6)) ?? price,
		volume: num(get(7)) ?? 0,
		value: num(get(8)) ?? price * (num(get(7)) ?? 0),
		rsi: num(get(9)),
		rsiHour: num(get(10)),
		sma20: num(get(11)),
		sma50: num(get(12)),
		sma200: num(get(13)),
		ema10: num(get(14)),
		macd: num(get(15)),
		macdSignal: num(get(16)),
		atr: num(get(17)),
		mom: num(get(18)),
		rvol: num(get(19)),
		week52High: num(get(20)),
		week52Low: num(get(21)),
		perfW: num(get(22)),
		perf1M: num(get(23)),
		perf3M: num(get(24)),
		perf6M: num(get(25)),
		recommend: num(get(35)),
		volatility: num(get(36)),
		fundamentals: {
			pe,
			pb,
			roe,
			de,
			divYield,
			epsGrowth,
			mcap
		}
	};
}
async function fetchIdxSnapshots() {
	if (snapCache && Date.now() - snapCache.at < SNAP_TTL) return snapCache.value;
	const raw = await tvScan({
		columns: [...COLUMNS],
		filter: [{
			left: "type",
			operation: "equal",
			right: "stock"
		}],
		options: { lang: "id" },
		markets: ["indonesia"],
		range: [0, 1e3],
		sort: {
			sortBy: "Value.Traded",
			sortOrder: "desc"
		},
		ignore_unknown_fields: true
	});
	const rows = [];
	for (const item of raw.data ?? []) {
		if (!item.d) continue;
		const parsed = parseRow(item.s ?? "", item.d);
		if (parsed) rows.push(parsed);
	}
	if (rows.length < 40) throw new Error("Data emiten BEI tidak lengkap");
	snapCache = {
		at: Date.now(),
		value: rows
	};
	return rows;
}
async function fetchIhsg() {
	if (marketCache && Date.now() - marketCache.at < MARKET_TTL) return marketCache.value;
	const { status, statusLabel } = marketStatus();
	try {
		const d = (await tvScan({
			symbols: { tickers: ["IDX:COMPOSITE"] },
			columns: [
				"name",
				"close",
				"change",
				"description"
			],
			ignore_unknown_fields: true
		}, 8e3)).data?.[0]?.d ?? [];
		const price = num(d[1]) ?? 0;
		const changePct = num(d[2]) ?? 0;
		const snapshot = {
			price,
			changePct,
			name: str(d[3]) || "IHSG",
			asOf: Date.now(),
			status,
			statusLabel,
			trend: changePct > .15 ? "naik" : changePct < -.15 ? "turun" : "datar"
		};
		marketCache = {
			at: Date.now(),
			value: snapshot
		};
		return snapshot;
	} catch {
		return {
			price: 0,
			changePct: 0,
			name: "IHSG",
			asOf: Date.now(),
			status,
			statusLabel,
			trend: "datar"
		};
	}
}
function indicatorsFromSnap(snap) {
	const macdHist = snap.macd != null && snap.macdSignal != null ? snap.macd - snap.macdSignal : null;
	const atr = snap.atr;
	const price = snap.price;
	const range = snap.week52High != null && snap.week52Low != null ? snap.week52High - snap.week52Low : 0;
	return {
		rsi: snap.rsi,
		rsiHour: snap.rsiHour,
		sma20: snap.sma20,
		sma50: snap.sma50,
		sma200: snap.sma200,
		ema9: snap.ema10,
		macd: snap.macd,
		macdHist,
		atr,
		atrPct: atr && price ? atr / price * 100 : snap.volatility,
		rvol: snap.rvol,
		roc10: snap.perfW,
		pos52w: range > 0 && snap.week52Low != null ? (price - snap.week52Low) / range * 100 : null,
		sma50Slope: snap.perf1M,
		sma200Slope: snap.perf6M
	};
}
function lerpScore(value, goodLow, goodHigh, hardLow, hardHigh) {
	if (value <= hardLow || value >= hardHigh) return 8;
	if (value >= goodLow && value <= goodHigh) return 88;
	if (value < goodLow) return 8 + (value - hardLow) / (goodLow - hardLow) * 80;
	return 8 + (hardHigh - value) / (hardHigh - goodHigh) * 80;
}
function technicalScore(strategy, ind, snap) {
	const reasons = [];
	const risks = [];
	const price = snap.price;
	let acc = 0;
	let w = 0;
	const add = (weight, pts) => {
		acc += weight * pts;
		w += weight;
	};
	const rsi = strategy === "intraday" ? ind.rsiHour ?? ind.rsi : ind.rsi;
	if (rsi != null) {
		const band = strategy === "intraday" ? [
			38,
			68,
			22,
			82
		] : strategy === "swing" ? [
			42,
			66,
			28,
			78
		] : [
			35,
			65,
			20,
			82
		];
		add(1.2, lerpScore(rsi, band[0], band[1], band[2], band[3]));
		if (rsi >= 45 && rsi <= 65) reasons.push(`RSI ${rsi.toFixed(0)} — momentum sehat`);
		else if (rsi > 72) risks.push(`RSI ${rsi.toFixed(0)} jenuh beli`);
		else if (rsi < 32) risks.push(`RSI ${rsi.toFixed(0)} lemah`);
	}
	if (ind.ema9 != null && strategy === "intraday") {
		const above = price >= ind.ema9;
		add(1.1, above ? 86 : 28);
		if (above) reasons.push("Harga di atas EMA10");
		else risks.push("Harga di bawah EMA10");
	}
	if (ind.sma20 != null) {
		const above = price >= ind.sma20;
		add(1, above ? 84 : 32);
		if (above) reasons.push("Di atas SMA20");
	}
	if (ind.sma50 != null) {
		const above = price >= ind.sma50;
		add(strategy === "intraday" ? .7 : 1.3, above ? 86 : 30);
		if (above && strategy !== "intraday") reasons.push("Tren menengah (SMA50) positif");
		else if (!above && strategy !== "intraday") risks.push("Masih di bawah SMA50");
	}
	if (ind.sma200 != null) {
		const above = price >= ind.sma200;
		add(strategy === "invest" ? 1.6 : strategy === "swing" ? .9 : .4, above ? 88 : 34);
		if (strategy === "invest") {
			if (above) reasons.push("Di atas SMA200 — tren panjang naik");
			else reasons.push("Di bawah SMA200 — potensi value, butuh konfirmasi");
		}
	}
	if (ind.sma50Slope != null) add(.7, clamp(50 + ind.sma50Slope * 1.4));
	if (ind.macdHist != null) {
		add(1, ind.macdHist > 0 ? 80 : 36);
		if (ind.macdHist > 0) reasons.push("MACD histogram positif");
		else if (strategy !== "intraday") risks.push("MACD belum konfirmasi");
	}
	if (ind.rvol != null) {
		if (strategy === "intraday") {
			add(1.4, clamp(30 + Math.min(ind.rvol, 4) * 18));
			if (ind.rvol >= 1.4) reasons.push(`Volume ${ind.rvol.toFixed(1)}× rata-rata`);
			else if (ind.rvol < .8) risks.push("Volume tipis");
		} else add(.6, clamp(40 + Math.min(ind.rvol, 3) * 12));
	}
	if (ind.roc10 != null) {
		if (strategy === "intraday") add(.9, lerpScore(ind.roc10, .4, 8, -12, 18));
		else if (strategy === "swing") add(.8, lerpScore(ind.roc10, 0, 10, -16, 22));
		else add(.4, lerpScore(ind.roc10, -6, 8, -30, 28));
	}
	if (ind.pos52w != null) {
		if (strategy === "intraday") add(.5, lerpScore(ind.pos52w, 55, 88, 15, 99));
		else if (strategy === "swing") add(.6, lerpScore(ind.pos52w, 40, 80, 10, 97));
		else add(1.1, lerpScore(ind.pos52w, 28, 72, 5, 96));
		if (strategy === "invest" && ind.pos52w > 88) risks.push("Dekat puncak 52 minggu");
		if (strategy === "invest" && ind.pos52w < 30) reasons.push("Masih diskon vs 52 minggu");
	}
	if (ind.atrPct != null) {
		if (strategy === "intraday") add(.6, lerpScore(ind.atrPct, 1.4, 4.2, .4, 12));
		else if (strategy === "swing") add(.5, lerpScore(ind.atrPct, 1.2, 3.8, .4, 10));
		else add(.7, lerpScore(ind.atrPct, .8, 2.8, .3, 8));
		if (strategy === "invest" && ind.atrPct > 6) risks.push("Volatilitas tinggi untuk investasi");
	}
	if (snap.recommend != null) add(.4, clamp(50 + snap.recommend * 40));
	if (snap.changePct <= -5 && strategy === "intraday") {
		add(.8, 18);
		risks.push("Koreksi harian dalam");
	}
	return {
		score: clamp(w > 0 ? acc / w : 50),
		reasons: reasons.slice(0, 4),
		risks: risks.slice(0, 3)
	};
}
function fundamentalScore(strategy, snap) {
	const reasons = [];
	const risks = [];
	const f = snap.fundamentals;
	let acc = 46;
	if (strategy === "intraday") {
		if (snap.value >= 2e10) {
			acc += 16;
			reasons.push("Likuiditas sesi kuat");
		} else if (snap.value >= 8e9) acc += 10;
		else if (snap.value >= 3e9) acc += 2;
		else {
			acc -= 16;
			risks.push("Nilai transaksi rendah");
		}
	} else if (snap.value >= 8e9) acc += 6;
	else if (snap.value < 1e9) {
		acc -= 8;
		risks.push("Likuiditas menengah ke bawah");
	}
	if (snap.size === "mega") acc += strategy === "invest" ? 10 : 6;
	else if (snap.size === "large") acc += strategy === "invest" ? 8 : 5;
	else if (snap.size === "small") {
		acc -= strategy === "invest" ? 12 : 3;
		if (strategy === "invest") risks.push("Kapitalisasi kecil");
	}
	if (snap.flags.lq45) {
		acc += strategy === "intraday" ? 5 : 8;
		if (strategy !== "intraday") reasons.push("Anggota LQ45");
	}
	if (snap.flags.idx30) acc += 3;
	if (snap.flags.soe && strategy === "invest") {
		acc += 3;
		reasons.push("BUMN / kualitas institusi");
	}
	if (f.pe != null && f.pe > 0) {
		const pePts = lerpScore(f.pe, 6, 18, 1, 55);
		acc += (strategy === "invest" ? .18 : .06) * (pePts - 50);
		if (strategy === "invest" && f.pe >= 6 && f.pe <= 16) reasons.push(`PE ${f.pe.toFixed(1)}× — valuasi masuk akal`);
		else if (strategy === "invest" && f.pe > 40) risks.push(`PE ${f.pe.toFixed(0)}× mahal`);
	} else if (strategy === "invest") acc -= 6;
	if (f.pb != null && f.pb > 0 && strategy !== "intraday") acc += .08 * (lerpScore(f.pb, .6, 2.4, .15, 12) - 50);
	if (f.roe != null) {
		if (f.roe >= 15) {
			acc += strategy === "invest" ? 12 : 5;
			if (strategy === "invest") reasons.push(`ROE ${f.roe.toFixed(0)}%`);
		} else if (f.roe >= 8) acc += strategy === "invest" ? 6 : 2;
		else if (f.roe < 0) {
			acc -= strategy === "invest" ? 12 : 4;
			if (strategy === "invest") risks.push("ROE negatif");
		}
	}
	if (f.divYield != null && f.divYield >= 2) {
		acc += strategy === "invest" ? Math.min(12, f.divYield) : strategy === "swing" ? 4 : 1;
		if (strategy === "invest" && f.divYield >= 3) reasons.push(`Imbal hasil dividen ${f.divYield.toFixed(1)}%`);
	} else if (strategy === "invest" && snap.flags.dividend) acc += 4;
	if (f.de != null && snap.sector !== "Perbankan" && strategy === "invest") {
		if (f.de > 2.2) {
			acc -= 8;
			risks.push("Utang relatif tinggi");
		} else if (f.de < .8) acc += 3;
	}
	if (f.epsGrowth != null && strategy !== "intraday") {
		if (f.epsGrowth >= 10) acc += 6;
		else if (f.epsGrowth < -15) acc -= 6;
	}
	if (snap.flags.shariah && strategy !== "intraday") acc += 2;
	if (snap.price < 50 && snap.size === "small" && snap.value < 5e9) {
		acc -= 14;
		risks.push("Harga rendah dan kurang likuid");
	}
	return {
		score: clamp(acc),
		reasons: reasons.slice(0, 3),
		risks: risks.slice(0, 2)
	};
}
function verdictOf(total) {
	if (total >= 68) return "beli";
	if (total >= 56) return "pertimbangkan";
	return "tunggu";
}
function levelsFor(strategy, snap, ind) {
	const atr = ind.atr && ind.atr > 0 ? ind.atr : snap.price * .02;
	const stopMul = strategy === "intraday" ? 1.05 : strategy === "swing" ? 1.7 : 2.4;
	const tgtMul = strategy === "intraday" ? 1.6 : strategy === "swing" ? 2.4 : 3.2;
	const below = [
		snap.sma20,
		snap.sma50,
		snap.sma200,
		snap.low,
		snap.week52Low
	].filter((n) => n != null && n < snap.price * .997);
	const above = [
		snap.sma20,
		snap.sma50,
		snap.high,
		snap.week52High
	].filter((n) => n != null && n > snap.price * 1.003);
	const support = below.length ? Math.max(...below) : snap.price - atr * stopMul;
	const resistance = above.length ? Math.min(...above) : snap.price + atr * tgtMul;
	return {
		support: round(support),
		resistance: round(resistance),
		stop: round(Math.min(support, snap.price - atr * stopMul)),
		target: round(Math.max(resistance, snap.price + atr * tgtMul))
	};
}
function scoreStock(strategy, snap) {
	const indicators = indicatorsFromSnap(snap);
	const t = technicalScore(strategy, indicators, snap);
	const f = fundamentalScore(strategy, snap);
	const weights = STRATEGIES[strategy].weights;
	const sentiment = 50;
	const total = clamp(t.score * weights.technical + f.score * weights.fundamental + sentiment * weights.sentiment);
	const reasons = [...t.reasons, ...f.reasons].filter((v, i, a) => a.indexOf(v) === i).slice(0, 5);
	const risks = [...t.risks, ...f.risks].filter((v, i, a) => a.indexOf(v) === i).slice(0, 4);
	return {
		symbol: snap.symbol,
		name: snap.name,
		sector: snap.sector,
		industry: snap.industry,
		size: snap.size,
		flags: snap.flags,
		price: snap.price,
		prevClose: snap.prevClose,
		changePct: snap.changePct,
		volume: snap.volume,
		value: snap.value,
		spark: [],
		week52High: snap.week52High,
		week52Low: snap.week52Low,
		scores: {
			total,
			technical: t.score,
			fundamental: f.score,
			sentiment
		},
		verdict: verdictOf(total),
		reasons,
		risks,
		levels: levelsFor(strategy, snap, indicators),
		indicators,
		fundamentals: snap.fundamentals
	};
}
function applySentiment(row, strategy, sentiment, thesis, extraRisks) {
	const weights = STRATEGIES[strategy].weights;
	const total = clamp(row.scores.technical * weights.technical + row.scores.fundamental * weights.fundamental + sentiment * weights.sentiment);
	return {
		...row,
		scores: {
			...row.scores,
			sentiment,
			total
		},
		verdict: verdictOf(total),
		thesis,
		headlines: [],
		risks: [...row.risks, ...extraRisks].filter((v, i, a) => a.indexOf(v) === i).slice(0, 4)
	};
}
function minValueFor(strategy) {
	if (strategy === "intraday") return 3e9;
	if (strategy === "swing") return 1e9;
	return 4e8;
}
function extractJson(text) {
	const raw = (text.match(/```(?:json)?\s*([\s\S]*?)```/i)?.[1] ?? text).trim();
	const start = raw.search(/[\[{]/);
	if (start < 0) return null;
	const sliced = raw.slice(start);
	try {
		return JSON.parse(sliced);
	} catch {
		const endObj = sliced.lastIndexOf("}");
		const endArr = sliced.lastIndexOf("]");
		const end = Math.max(endObj, endArr);
		if (end > 0) try {
			return JSON.parse(sliced.slice(0, end + 1));
		} catch {
			return null;
		}
		return null;
	}
}
var aiCache = /* @__PURE__ */ new Map();
var AI_TTL = 18e5;
async function scoreSentiment(input) {
	const apiKey = process.env.XAI_API_KEY;
	if (!apiKey || input.stocks.length === 0) return {
		enabled: false,
		rows: []
	};
	const cacheKey = `${input.strategy}:${input.stocks.map((s) => s.symbol).join(",")}`;
	const hit = aiCache.get(cacheKey);
	if (hit && Date.now() - hit.at < AI_TTL) return hit.value;
	const compact = input.stocks.slice(0, 8).map((s) => ({
		symbol: s.symbol,
		name: s.name,
		sector: s.sector,
		changePct: Number(s.changePct.toFixed(2)),
		rsi: s.rsi != null ? Math.round(s.rsi) : null,
		news: s.headlines.slice(0, 3).map((h) => h.title)
	}));
	const prompt = `Anda analis saham BEI. Strategi: ${input.strategy === "intraday" ? "intraday (tutup hari ini)" : input.strategy === "swing" ? "swing 5-20 hari" : "investasi jangka panjang"}. Kondisi pasar: ${input.market}.
Nilai sentimen berita + konteks emiten berikut (skala 0-100, 50 = netral).
Tulis thesis 1 kalimat bahasa Indonesia, nada tenang, bukan hype. Sebut risiko singkat jika ada.
Jangan rekomendasikan saham yang jelas kena skandal hukum/fraud.
Output JSON array saja, tanpa markdown:
[{"symbol":"BBCA","sentiment":62,"thesis":"...","risks":["..."]}]

Data:
${JSON.stringify(compact)}`;
	try {
		const res = await fetch("https://api.x.ai/v1/chat/completions", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${apiKey}`
			},
			signal: AbortSignal.timeout(7e3),
			body: JSON.stringify({
				model: "grok-4.5",
				temperature: .2,
				max_tokens: 900,
				messages: [{
					role: "system",
					content: "Anda analis ekuitas Indonesia. Jawab hanya JSON valid. Jangan menjanjikan profit."
				}, {
					role: "user",
					content: prompt
				}]
			})
		});
		if (!res.ok) return {
			enabled: false,
			rows: []
		};
		const parsed = extractJson((await res.json()).choices?.[0]?.message?.content ?? "");
		if (!Array.isArray(parsed)) {
			const value = {
				enabled: true,
				rows: []
			};
			aiCache.set(cacheKey, {
				at: Date.now(),
				value
			});
			return value;
		}
		const rows = [];
		for (const item of parsed) {
			if (!item || typeof item !== "object") continue;
			const rec = item;
			const symbol = String(rec.symbol ?? "").toUpperCase();
			if (!symbol) continue;
			const sentiment = Number(rec.sentiment);
			const thesis = String(rec.thesis ?? "").trim();
			const risks = Array.isArray(rec.risks) ? rec.risks.map((r) => String(r)).filter(Boolean).slice(0, 2) : [];
			rows.push({
				symbol,
				sentiment: Number.isFinite(sentiment) ? Math.min(100, Math.max(0, sentiment)) : 50,
				thesis,
				risks
			});
		}
		const value = {
			enabled: true,
			rows
		};
		aiCache.set(cacheKey, {
			at: Date.now(),
			value
		});
		return value;
	} catch {
		return {
			enabled: false,
			rows: []
		};
	}
}
function fallbackThesis(row, strategy, sentiment) {
	const head = row.reasons[0] ?? "Setup cukup rapi";
	const sent = sentimentLabel(sentiment);
	if (strategy === "intraday") return `${row.symbol} masuk radar sesi ini: ${head.toLowerCase()}. Sentimen berita ${sent}. Cocok hanya jika likuiditas tetap jaga sampai penutupan.`;
	if (strategy === "swing") return `${row.symbol} punya setup swing ${row.verdict === "beli" ? "yang rapi" : "yang masih perlu konfirmasi"}: ${head.toLowerCase()}. Sentimen ${sent}.`;
	return `${row.symbol} dinilai dari kualitas dan tren panjang: ${head.toLowerCase()}. Sentimen ${sent}. Posisi bertahap, bukan all-in.`;
}
var screenCache = /* @__PURE__ */ new Map();
var SCREEN_TTL = 24e4;
async function runScreening(input) {
	const strategy = input.strategy;
	const sector = input.sector && input.sector !== "Semua" ? input.sector : "Semua";
	const cacheKey = `v2:${strategy}:${sector}`;
	const hit = screenCache.get(cacheKey);
	if (hit && Date.now() - hit.at < SCREEN_TTL) return hit.value;
	const [market, snapshots] = await Promise.all([fetchIhsg(), fetchIdxSnapshots()]);
	const universe = snapshots.filter((s) => sector === "Semua" ? true : s.sector === sector);
	const minVal = minValueFor(strategy);
	const scored = [];
	let failed = snapshots.length - universe.length;
	for (const snap of universe) {
		if (snap.price <= 0 || snap.rsi == null && snap.sma20 == null) {
			failed += 1;
			continue;
		}
		if (!(snap.value >= minVal || strategy === "invest" && (snap.fundamentals.mcap ?? 0) >= 0x9184e72a000)) continue;
		if (strategy === "intraday" && (snap.rsi ?? 50) > 78) continue;
		scored.push(scoreStock(strategy, snap));
	}
	scored.sort((a, b) => b.scores.total - a.scores.total);
	const shortlist = scored.slice(0, 14);
	const [headlines, charts] = await Promise.all([fetchHeadlinesFor(shortlist.slice(0, 6).map((s) => ({
		symbol: s.symbol,
		name: s.name
	}))), fetchCharts(shortlist.map((s) => s.symbol))]);
	const chartMap = new Map(charts.map((c) => [c.symbol, c]));
	const withChart = shortlist.map((row) => {
		const chart = chartMap.get(row.symbol);
		if (!chart) return row;
		return {
			...row,
			spark: lastBarsSpark(chart.bars, 56),
			lastDiv: chart.dividends[0]
		};
	});
	const newsRows = withChart.map((s) => ({
		symbol: s.symbol,
		name: s.name,
		sector: s.sector,
		price: s.price,
		changePct: s.changePct,
		rsi: s.indicators.rsi,
		headlines: headlines.get(s.symbol) ?? []
	}));
	const sentiment = await scoreSentiment({
		strategy,
		market: `IHSG ${market.price.toFixed(0)} (${market.changePct >= 0 ? "+" : ""}${market.changePct.toFixed(2)}%), status ${market.statusLabel}`,
		stocks: newsRows
	});
	const sentMap = new Map(sentiment.rows.map((r) => [r.symbol, r]));
	const results = withChart.map((row) => {
		const news = headlines.get(row.symbol) ?? [];
		const heur = scoreHeadlines(news);
		const ai = sentMap.get(row.symbol);
		const sentimentScore = ai?.sentiment ?? heur.sentiment;
		const extraRisks = ai?.risks ?? [];
		const thesis = ai?.thesis && ai.thesis.trim() || fallbackThesis(row, strategy, sentimentScore);
		return {
			...applySentiment(row, strategy, sentimentScore, thesis, extraRisks),
			headlines: news
		};
	});
	results.sort((a, b) => b.scores.total - a.scores.total);
	const cutoff = strategy === "intraday" ? 54 : 52;
	let qualified = results.filter((r) => r.scores.total >= cutoff);
	if (qualified.length < 6) qualified = results.slice(0, 8);
	const note = market.trend === "turun" ? "IHSG sedang melemah — kurangi ukuran posisi dan utamakan saham paling likuid." : void 0;
	const value = {
		strategy,
		sector,
		asOf: Date.now(),
		market,
		scanned: snapshots.length,
		eligible: scored.length,
		failed,
		qualified: qualified.length,
		results: qualified.slice(0, 12),
		sentimentEnabled: sentiment.enabled,
		note
	};
	screenCache.set(cacheKey, {
		at: Date.now(),
		value
	});
	return value;
}
var strategySchema = _enum([
	"intraday",
	"swing",
	"invest"
]);
var getMarketOverview_createServerFn_handler = createServerRpc({
	id: "188d632fbf615078a692c25743dd576addb6c625e679120cf0a02b872af73ecd",
	name: "getMarketOverview",
	filename: "src/lib/screener/actions.ts"
}, (opts) => getMarketOverview.__executeServer(opts));
var getMarketOverview = createServerFn({ method: "GET" }).handler(getMarketOverview_createServerFn_handler, async () => {
	return fetchIhsg();
});
var runScreen_createServerFn_handler = createServerRpc({
	id: "6eaf54abdfd734364375eee1d24f9c131579fc8e6952e40428d59ffcf07f3b9f",
	name: "runScreen",
	filename: "src/lib/screener/actions.ts"
}, (opts) => runScreen.__executeServer(opts));
var runScreen = createServerFn({ method: "POST" }).validator((input) => object({
	strategy: strategySchema,
	sector: string().optional()
}).parse(input)).handler(runScreen_createServerFn_handler, async ({ data }) => {
	return runScreening(data);
});
//#endregion
export { getMarketOverview_createServerFn_handler, runScreen_createServerFn_handler };
