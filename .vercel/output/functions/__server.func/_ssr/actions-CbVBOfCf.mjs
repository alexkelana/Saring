import { n as TSS_SERVER_FUNCTION, t as createServerFn } from "./ssr.mjs";
import { a as yahooSymbol, i as UNIVERSE, n as STRATEGIES } from "./universe-DbDHsdq7.mjs";
import { a as string, i as object, t as _enum } from "../_libs/zod.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/actions-CbVBOfCf.js
var createServerRpc = (serverFnMeta, splitImportFn) => {
	const url = "/_serverFn/" + serverFnMeta.id;
	return Object.assign(splitImportFn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
function finite(values) {
	return values.filter((v) => typeof v === "number" && Number.isFinite(v));
}
function sma(values, period) {
	if (values.length < period) return null;
	let sum = 0;
	for (let i = values.length - period; i < values.length; i++) sum += values[i];
	return sum / period;
}
function smaAt(values, period, offset = 0) {
	const end = values.length - offset;
	if (end < period) return null;
	let sum = 0;
	for (let i = end - period; i < end; i++) sum += values[i];
	return sum / period;
}
function emaSeries(values, period) {
	if (values.length < period) return null;
	const k = 2 / (period + 1);
	const out = new Array(values.length);
	let acc = 0;
	for (let i = 0; i < period; i++) acc += values[i];
	acc /= period;
	for (let i = 0; i < period - 1; i++) out[i] = acc;
	out[period - 1] = acc;
	for (let i = period; i < values.length; i++) {
		acc = values[i] * k + acc * (1 - k);
		out[i] = acc;
	}
	return out;
}
function ema(values, period) {
	const series = emaSeries(values, period);
	return series ? series[series.length - 1] : null;
}
function rsi(values, period = 14) {
	if (values.length < period + 1) return null;
	let avgG = 0;
	let avgL = 0;
	for (let i = 1; i <= period; i++) {
		const d = values[i] - values[i - 1];
		if (d >= 0) avgG += d;
		else avgL -= d;
	}
	avgG /= period;
	avgL /= period;
	for (let i = period + 1; i < values.length; i++) {
		const d = values[i] - values[i - 1];
		const g = d > 0 ? d : 0;
		const l = d < 0 ? -d : 0;
		avgG = (avgG * (period - 1) + g) / period;
		avgL = (avgL * (period - 1) + l) / period;
	}
	if (avgL === 0) return 100;
	return 100 - 100 / (1 + avgG / avgL);
}
function macdLast(values) {
	const e12 = emaSeries(values, 12);
	const e26 = emaSeries(values, 26);
	if (!e12 || !e26) return null;
	const line = [];
	for (let i = 25; i < values.length; i++) line.push(e12[i] - e26[i]);
	const sig = emaSeries(line, 9);
	if (!sig) return null;
	const macd = line[line.length - 1];
	const signal = sig[sig.length - 1];
	return {
		macd,
		signal,
		hist: macd - signal
	};
}
function atr(bars, period = 14) {
	if (bars.length < period + 1) return null;
	const trs = [];
	for (let i = 1; i < bars.length; i++) {
		const b = bars[i];
		const prev = bars[i - 1];
		trs.push(Math.max(b.h - b.l, Math.abs(b.h - prev.c), Math.abs(b.l - prev.c)));
	}
	return sma(trs, period);
}
function roc(values, period) {
	if (values.length <= period) return null;
	const prev = values[values.length - 1 - period];
	if (prev === 0) return null;
	return (values[values.length - 1] - prev) / prev * 100;
}
function computeIndicators(chart) {
	const closes = finite(chart.bars.map((b) => b.c));
	const volumes = finite(chart.bars.map((b) => b.v));
	const lastVol = volumes[volumes.length - 1] ?? chart.volume;
	const avgVol = sma(volumes.slice(0, -1), Math.min(20, Math.max(5, volumes.length - 1)));
	const macd = macdLast(closes);
	const sma50Now = sma(closes, 50);
	const sma50Prev = smaAt(closes, 50, 5);
	const sma200Now = sma(closes, 200);
	const sma200Prev = smaAt(closes, 200, 10);
	const atrVal = atr(chart.bars, 14);
	const price = chart.price || closes[closes.length - 1] || 0;
	const range = chart.week52High - chart.week52Low;
	return {
		rsi: rsi(closes, 14),
		sma20: sma(closes, 20),
		sma50: sma50Now,
		sma200: sma200Now,
		ema9: ema(closes, 9),
		macd: macd?.macd ?? null,
		macdHist: macd?.hist ?? null,
		atr: atrVal,
		atrPct: atrVal && price ? atrVal / price * 100 : null,
		rvol: avgVol && avgVol > 0 ? lastVol / avgVol : null,
		roc10: roc(closes, 10),
		pos52w: range > 0 ? (price - chart.week52Low) / range * 100 : null,
		sma50Slope: sma50Now && sma50Prev && sma50Prev !== 0 ? (sma50Now - sma50Prev) / sma50Prev * 100 : null,
		sma200Slope: sma200Now && sma200Prev && sma200Prev !== 0 ? (sma200Now - sma200Prev) / sma200Prev * 100 : null
	};
}
function lastBarsSpark(bars, n = 24) {
	const closes = bars.map((b) => b.c).filter((c) => Number.isFinite(c));
	if (closes.length <= n) return closes;
	return closes.slice(-n);
}
function nearestSupport(bars, price) {
	const window = bars.slice(-40);
	const lows = window.map((b) => b.l).filter((v) => v < price * .995);
	if (!lows.length) {
		const min = Math.min(...window.map((b) => b.l));
		return Number.isFinite(min) ? min : price * .97;
	}
	return Math.max(...lows);
}
function nearestResistance(bars, price) {
	const window = bars.slice(-40);
	const highs = window.map((b) => b.h).filter((v) => v > price * 1.005);
	if (!highs.length) {
		const max = Math.max(...window.map((b) => b.h));
		return Number.isFinite(max) ? max : price * 1.03;
	}
	return Math.min(...highs);
}
function clamp(n, lo = 0, hi = 100) {
	return Math.min(hi, Math.max(lo, n));
}
function round(n, digits = 0) {
	const p = 10 ** digits;
	return Math.round(n * p) / p;
}
function lerpScore(value, goodLow, goodHigh, hardLow, hardHigh) {
	if (value <= hardLow || value >= hardHigh) return 8;
	if (value >= goodLow && value <= goodHigh) return 88;
	if (value < goodLow) return 8 + (value - hardLow) / (goodLow - hardLow) * 80;
	return 8 + (hardHigh - value) / (hardHigh - goodHigh) * 80;
}
function technicalScore(strategy, ind, chart) {
	const reasons = [];
	const risks = [];
	const price = chart.price;
	let acc = 0;
	let w = 0;
	const add = (weight, pts) => {
		acc += weight * pts;
		w += weight;
	};
	if (ind.rsi != null) {
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
		add(1.2, lerpScore(ind.rsi, band[0], band[1], band[2], band[3]));
		if (ind.rsi >= 45 && ind.rsi <= 65) reasons.push(`RSI ${ind.rsi.toFixed(0)} — momentum sehat`);
		else if (ind.rsi > 72) risks.push(`RSI ${ind.rsi.toFixed(0)} jenuh beli`);
		else if (ind.rsi < 35) risks.push(`RSI ${ind.rsi.toFixed(0)} lemah`);
	}
	if (ind.ema9 != null && strategy === "intraday") {
		const above = price >= ind.ema9;
		add(1.1, above ? 86 : 28);
		if (above) reasons.push("Harga di atas EMA9");
		else risks.push("Harga di bawah EMA9");
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
	if (ind.sma50Slope != null) add(.8, clamp(50 + ind.sma50Slope * 18));
	if (ind.macdHist != null) {
		add(1, ind.macdHist > 0 ? 80 : 36);
		if (ind.macdHist > 0) reasons.push("MACD histogram positif");
		else if (strategy !== "intraday") risks.push("MACD belum konfirmasi");
	}
	if (ind.rvol != null) {
		if (strategy === "intraday") {
			add(1.4, clamp(30 + (ind.rvol - .6) * 40));
			if (ind.rvol >= 1.4) reasons.push(`Volume ${ind.rvol.toFixed(1)}× rata-rata`);
			else if (ind.rvol < .8) risks.push("Volume tipis");
		} else add(.7, clamp(40 + (ind.rvol - .7) * 25));
	}
	if (ind.roc10 != null) {
		if (strategy === "intraday") add(.9, lerpScore(ind.roc10, .4, 6, -8, 14));
		else if (strategy === "swing") add(.8, lerpScore(ind.roc10, 0, 8, -12, 18));
		else add(.4, lerpScore(ind.roc10, -4, 6, -20, 22));
	}
	if (ind.pos52w != null) {
		if (strategy === "intraday") add(.5, lerpScore(ind.pos52w, 55, 88, 15, 99));
		else if (strategy === "swing") add(.6, lerpScore(ind.pos52w, 40, 80, 10, 97));
		else add(1.1, lerpScore(ind.pos52w, 28, 72, 5, 96));
		if (strategy === "invest" && ind.pos52w > 88) risks.push("Dekat puncak 52 minggu");
		if (strategy === "invest" && ind.pos52w < 30) reasons.push("Masih diskon vs 52 minggu");
	}
	if (ind.atrPct != null) {
		if (strategy === "intraday") add(.6, lerpScore(ind.atrPct, 1.4, 4.2, .4, 9));
		else if (strategy === "swing") add(.5, lerpScore(ind.atrPct, 1.2, 3.8, .4, 8));
		else add(.7, lerpScore(ind.atrPct, .8, 2.8, .3, 7));
		if (strategy === "invest" && ind.atrPct > 5) risks.push("Volatilitas tinggi untuk investasi");
	}
	if (chart.changePct <= -5 && strategy === "intraday") {
		add(.8, 18);
		risks.push("Koreksi harian dalam");
	}
	return {
		score: clamp(w > 0 ? acc / w : 50),
		reasons: reasons.slice(0, 4),
		risks: risks.slice(0, 3)
	};
}
function fundamentalScore(strategy, meta, chart, ind) {
	const reasons = [];
	const risks = [];
	let acc = 48;
	const value = chart.price * chart.volume;
	if (strategy === "intraday") {
		if (value >= 2e10) {
			acc += 18;
			reasons.push("Likuiditas sesi kuat");
		} else if (value >= 8e9) acc += 10;
		else if (value >= 3e9) acc += 2;
		else {
			acc -= 16;
			risks.push("Nilai transaksi rendah");
		}
	} else if (value >= 8e9) acc += 8;
	else if (value < 15e8) {
		acc -= 10;
		risks.push("Likuiditas menengah ke bawah");
	}
	if (meta.size === "mega") acc += strategy === "invest" ? 16 : 8;
	else if (meta.size === "large") acc += strategy === "invest" ? 12 : 6;
	else if (meta.size === "mid") acc += strategy === "invest" ? 2 : 4;
	else {
		acc -= strategy === "invest" ? 14 : 4;
		if (strategy === "invest") risks.push("Kapitalisasi kecil");
	}
	if (meta.flags.lq45) {
		acc += strategy === "intraday" ? 6 : 10;
		if (strategy !== "intraday") reasons.push("Anggota LQ45");
	}
	if (meta.flags.idx30) acc += 4;
	if (meta.flags.soe && strategy === "invest") {
		acc += 4;
		reasons.push("BUMN / kualitas institusi");
	}
	const lastDiv = chart.dividends[0];
	if (lastDiv && Date.now() - lastDiv.date < 3456e7 || meta.flags.dividend) {
		acc += strategy === "invest" ? 12 : strategy === "swing" ? 6 : 2;
		if (strategy === "invest" && lastDiv) {
			const yieldPct = lastDiv.amount / chart.price * 100;
			reasons.push(`Dividen terakhir ${round(yieldPct, 1)}% dari harga`);
		}
	} else if (strategy === "invest") acc -= 4;
	if (meta.flags.shariah && strategy !== "intraday") acc += 3;
	if (chart.price < 50) {
		acc -= 22;
		risks.push("Harga sangat rendah — risiko gorengan");
	} else if (chart.price < 120 && meta.size === "small") acc -= 8;
	if (ind.sma200Slope != null && strategy === "invest") acc += clamp(ind.sma200Slope * 8, -8, 10);
	return {
		score: clamp(acc),
		reasons: reasons.slice(0, 3),
		risks: risks.slice(0, 2)
	};
}
function verdictOf(total) {
	if (total >= 72) return "beli";
	if (total >= 58) return "pertimbangkan";
	return "tunggu";
}
function levelsFor(strategy, chart, ind) {
	const atr = ind.atr ?? chart.price * .02;
	const stopMul = strategy === "intraday" ? 1.05 : strategy === "swing" ? 1.7 : 2.4;
	const tgtMul = strategy === "intraday" ? 1.6 : strategy === "swing" ? 2.4 : 3.2;
	const support = nearestSupport(chart.bars, chart.price);
	const resistance = nearestResistance(chart.bars, chart.price);
	return {
		support: round(support),
		resistance: round(resistance),
		stop: round(Math.min(support, chart.price - atr * stopMul)),
		target: round(Math.max(resistance, chart.price + atr * tgtMul))
	};
}
function scoreStock(strategy, meta, chart) {
	const indicators = computeIndicators(chart);
	const t = technicalScore(strategy, indicators, chart);
	const f = fundamentalScore(strategy, meta, chart, indicators);
	const weights = STRATEGIES[strategy].weights;
	const sentiment = 50;
	const total = clamp(t.score * weights.technical + f.score * weights.fundamental + sentiment * weights.sentiment);
	const reasons = [...t.reasons, ...f.reasons].filter((v, i, a) => a.indexOf(v) === i).slice(0, 5);
	const risks = [...t.risks, ...f.risks].filter((v, i, a) => a.indexOf(v) === i).slice(0, 4);
	const lastDiv = chart.dividends[0];
	return {
		symbol: meta.symbol,
		name: meta.name,
		sector: meta.sector,
		size: meta.size,
		flags: meta.flags,
		price: chart.price,
		prevClose: chart.prevClose,
		changePct: chart.changePct,
		volume: chart.volume,
		value: chart.price * chart.volume,
		spark: lastBarsSpark(chart.bars, 56),
		scores: {
			total,
			technical: t.score,
			fundamental: f.score,
			sentiment
		},
		verdict: verdictOf(total),
		reasons,
		risks,
		levels: levelsFor(strategy, chart, indicators),
		indicators,
		lastDiv
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
	if (strategy === "intraday") return 25e8;
	if (strategy === "swing") return 12e8;
	return 6e8;
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
			signal: AbortSignal.timeout(3500)
		});
		if (!res.ok) {
			newsCache.set(key, {
				at: Date.now(),
				value: []
			});
			return [];
		}
		const xml = await res.text();
		const headlines = parseRss(xml, 4).filter((h) => {
			const t = h.title.toUpperCase();
			return t.includes(symbol) || t.includes(name.split(" ")[0].toUpperCase()) || t.includes("SAHAM") || t.includes("IHSG") || t.includes("BEI");
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
async function scoreSentiment(input) {
	const apiKey = process.env.XAI_API_KEY;
	if (!apiKey || input.stocks.length === 0) return {
		enabled: false,
		rows: []
	};
	const compact = input.stocks.map((s) => ({
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
			signal: AbortSignal.timeout(22e3),
			body: JSON.stringify({
				model: "grok-4.5",
				temperature: .2,
				max_tokens: 1600,
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
		if (!Array.isArray(parsed)) return {
			enabled: true,
			rows: []
		};
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
		return {
			enabled: true,
			rows
		};
	} catch {
		return {
			enabled: false,
			rows: []
		};
	}
}
var UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36";
var TTL_MS = 72e4;
var chartCache = /* @__PURE__ */ new Map();
var marketCache = null;
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
async function fetchJson(url, timeoutMs = 9e3) {
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
async function fetchChart(symbol, range = "1y") {
	const y = yahooSymbol(symbol);
	const key = `${y}:${range}`;
	const hit = fromCache(chartCache.get(key));
	if (hit !== null) return hit;
	const result = (await fetchJson(`https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(y)}?range=${range}&interval=1d&events=div`))?.chart?.result?.[0];
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
	if (bars.length < 20) {
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
	return (await mapPool(symbols, 14, async (symbol) => fetchChart(symbol))).filter((r) => r !== null);
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
async function fetchIhsg() {
	const hit = fromCache(marketCache);
	if (hit) return hit;
	const meta = (await fetchJson("https://query1.finance.yahoo.com/v8/finance/chart/%5EJKSE?range=5d&interval=1d", 8e3))?.chart?.result?.[0]?.meta;
	const { status, statusLabel } = marketStatus();
	const price = meta?.regularMarketPrice ?? 0;
	const prev = meta?.chartPreviousClose ?? 0;
	const changePct = prev ? (price - prev) / prev * 100 : meta?.regularMarketChangePercent ?? 0;
	const snapshot = {
		price,
		changePct,
		name: meta?.shortName ?? "IHSG",
		asOf: (meta?.regularMarketTime ?? Math.floor(Date.now() / 1e3)) * 1e3,
		status,
		statusLabel,
		trend: changePct > .15 ? "naik" : changePct < -.15 ? "turun" : "datar"
	};
	marketCache = {
		at: Date.now(),
		value: snapshot
	};
	return snapshot;
}
function fallbackThesis(row, strategy) {
	const head = row.reasons[0] ?? "Setup teknikal cukup rapi";
	if (strategy === "intraday") return `${row.symbol} masuk radar sesi ini: ${head.toLowerCase()}. Cocok hanya jika likuiditas tetap jaga sampai penutupan.`;
	if (strategy === "swing") return `${row.symbol} punya setup swing ${row.verdict === "beli" ? "yang rapi" : "yang masih perlu konfirmasi"}: ${head.toLowerCase()}.`;
	return `${row.symbol} dinilai dari kualitas dan tren panjang: ${head.toLowerCase()}. Posisi bertahap, bukan all-in.`;
}
async function runScreening(input) {
	const strategy = input.strategy;
	const sector = input.sector && input.sector !== "Semua" ? input.sector : "Semua";
	const universe = UNIVERSE.filter((s) => sector === "Semua" ? true : s.sector === sector);
	const [market, charts] = await Promise.all([fetchIhsg(), fetchCharts(universe.map((s) => s.symbol))]);
	const bySymbol = new Map(universe.map((s) => [s.symbol, s]));
	const minVal = minValueFor(strategy);
	const scored = [];
	let failed = universe.length - charts.length;
	for (const chart of charts) {
		const meta = bySymbol.get(chart.symbol);
		if (!meta) continue;
		if (chart.price <= 0) {
			failed += 1;
			continue;
		}
		const row = scoreStock(strategy, meta, chart);
		if (row.value < minVal && !(meta.flags.lq45 && strategy === "invest")) continue;
		if (strategy === "intraday" && (row.indicators.rsi ?? 50) > 78) continue;
		scored.push(row);
	}
	scored.sort((a, b) => b.scores.total - a.scores.total);
	const shortlist = scored.slice(0, 14);
	const headlines = await fetchHeadlinesFor(shortlist.slice(0, 8).map((s) => ({
		symbol: s.symbol,
		name: s.name
	})));
	const sentiment = await scoreSentiment({
		strategy,
		market: `IHSG ${market.price.toFixed(0)} (${market.changePct >= 0 ? "+" : ""}${market.changePct.toFixed(2)}%), status ${market.statusLabel}`,
		stocks: shortlist.map((s) => ({
			symbol: s.symbol,
			name: s.name,
			sector: s.sector,
			price: s.price,
			changePct: s.changePct,
			rsi: s.indicators.rsi,
			headlines: headlines.get(s.symbol) ?? []
		}))
	});
	const sentMap = new Map(sentiment.rows.map((r) => [r.symbol, r]));
	const results = shortlist.map((row) => {
		const s = sentMap.get(row.symbol);
		return {
			...applySentiment(row, strategy, s?.sentiment ?? row.scores.sentiment, s?.thesis || fallbackThesis(row, strategy), s?.risks ?? []),
			headlines: headlines.get(row.symbol) ?? []
		};
	});
	results.sort((a, b) => b.scores.total - a.scores.total);
	const cutoff = strategy === "intraday" ? 54 : 52;
	let qualified = results.filter((r) => r.scores.total >= cutoff);
	if (qualified.length < 6) qualified = results.slice(0, 8);
	const note = market.trend === "turun" ? "IHSG sedang melemah — kurangi ukuran posisi dan utamakan saham paling likuid." : void 0;
	return {
		strategy,
		sector,
		asOf: Date.now(),
		market,
		scanned: universe.length,
		failed,
		qualified: qualified.length,
		results: qualified.slice(0, 12),
		sentimentEnabled: sentiment.enabled,
		note
	};
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
