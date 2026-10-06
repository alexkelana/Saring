//#region node_modules/.nitro/vite/services/ssr/assets/strategies-BJmMjwBP.js
function mapSector(tvSector, industry) {
	const ind = (industry || "").toLowerCase();
	const sec = (tvSector || "").toLowerCase();
	if (/bank/.test(ind)) return "Perbankan";
	if (/real estate|reit/.test(ind)) return "Properti";
	if (/engineering & construction|construction materials|building products/.test(ind)) return "Konstruksi";
	if (/wireless|telecommunication|cable\/satellite/.test(ind)) return "Telekomunikasi";
	if (/coal|integrated oil|oil & gas|oilfield|oil refining/.test(ind)) return "Energi";
	if (/precious metals|other metals|steel|aluminum|metal fabrication/.test(ind)) return "Tambang";
	if (/agricultural commodities|farming/.test(ind)) return "Perkebunan";
	if (/motor vehicle|auto parts|trucks\/construction\/farm/.test(ind)) return "Otomotif";
	if (/hospital|pharmaceutical|biotech|medical|nursing/.test(ind)) return "Kesehatan";
	if (/packaged software|information technology|internet software|data processing|computer communications|semiconductor|electronics\/appliances/.test(ind)) return "Teknologi";
	if (/specialty stores|food retail|department stores|apparel\/footwear retail|electronics\/appliance stores|home improvement/.test(ind)) return "Ritel";
	if (/wholesale distributors/.test(ind)) return "Ritel";
	if (/marine shipping|airlines|trucking|railroads|other transportation|air freight/.test(ind)) return "Transportasi";
	if (/electric utilities|alternative power|water utilities|gas distributors/.test(ind)) return "Infrastruktur";
	if (/movies|broadcasting|publishing|entertainment/.test(ind)) return "Media";
	if (/insurance|finance\/rental|investment banks|financial conglomerate|savings banks/.test(ind)) return "Keuangan";
	if (/food:|beverages:|household\/personal|tobacco|consumer sundries/.test(ind) || /hotels\/resorts|restaurants/.test(ind)) return "Konsumer";
	if (sec.includes("finance")) return "Keuangan";
	if (sec.includes("energy minerals")) return "Energi";
	if (sec.includes("non-energy minerals")) return "Tambang";
	if (sec.includes("health")) return "Kesehatan";
	if (sec.includes("technology") || sec.includes("electronic")) return "Teknologi";
	if (sec.includes("communications")) return "Telekomunikasi";
	if (sec.includes("retail") || sec.includes("distribution")) return "Ritel";
	if (sec.includes("transport")) return "Transportasi";
	if (sec.includes("utilities")) return "Infrastruktur";
	if (sec.includes("consumer")) return "Konsumer";
	return "Industri";
}
function sizeFromMcap(mcap) {
	if (mcap == null || mcap <= 0) return "small";
	if (mcap >= 0x5af3107a4000) return "mega";
	if (mcap >= 2e13) return "large";
	if (mcap >= 3e12) return "mid";
	return "small";
}
function cleanName(raw) {
	return raw.replace(/^PT\s+/i, "").replace(/\s+Tbk\.?$/i, "").replace(/\s+/g, " ").trim();
}
var SECTORS = [
	"Perbankan",
	"Keuangan",
	"Telekomunikasi",
	"Konsumer",
	"Otomotif",
	"Tambang",
	"Energi",
	"Properti",
	"Konstruksi",
	"Industri",
	"Kesehatan",
	"Teknologi",
	"Ritel",
	"Perkebunan",
	"Transportasi",
	"Infrastruktur",
	"Media"
];
var STRATEGIES = {
	intraday: {
		id: "intraday",
		label: "Intraday",
		horizon: "Sesi hari ini",
		blurb: "Momentum, volume relatif, dan likuiditas untuk posisi yang ditutup sebelum penutupan bursa.",
		looksFor: [
			"Nilai transaksi harian tinggi",
			"RSI 40–70, bukan jenuh beli",
			"Harga di atas EMA10 / SMA20",
			"Volume di atas rata-rata 10 hari"
		],
		weights: {
			technical: .62,
			fundamental: .13,
			sentiment: .25
		}
	},
	swing: {
		id: "swing",
		label: "Swing",
		horizon: "5–20 hari",
		blurb: "Tren harian, breakout, dan konfirmasi volume untuk holding beberapa sesi hingga beberapa minggu.",
		looksFor: [
			"Harga di atas SMA20 dan SMA50",
			"MACD histogram menguat",
			"RSI 45–65",
			"Sentimen berita tidak negatif"
		],
		weights: {
			technical: .45,
			fundamental: .25,
			sentiment: .3
		}
	},
	invest: {
		id: "invest",
		label: "Investasi",
		horizon: "Bulanan–tahunan",
		blurb: "Kualitas bisnis, tren jangka panjang, dan valuasi relatif — bukan trading harian.",
		looksFor: [
			"Tren SMA50 / SMA200 naik",
			"PE dan ROE masuk akal",
			"Riwayat dividen atau imbal hasil",
			"Tidak overextended dari 52-minggu"
		],
		weights: {
			technical: .28,
			fundamental: .44,
			sentiment: .28
		}
	}
};
var STRATEGY_ORDER = [
	"intraday",
	"swing",
	"invest"
];
//#endregion
export { mapSector as a, cleanName as i, STRATEGIES as n, sizeFromMcap as o, STRATEGY_ORDER as r, SECTORS as t };
