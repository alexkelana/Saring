//#region node_modules/.nitro/vite/services/ssr/assets/universe-C_BugJ9r.js
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
function stock(symbol, name, sector, size, flagStr) {
	const flags = {};
	for (const ch of flagStr) {
		if (ch === "L") flags.lq45 = true;
		if (ch === "I") flags.idx30 = true;
		if (ch === "S") flags.shariah = true;
		if (ch === "D") flags.dividend = true;
		if (ch === "B") flags.soe = true;
	}
	return {
		symbol,
		name,
		sector,
		size,
		flags
	};
}
/** Overlay nama, sektor, dan flag untuk emiten yang sudah dikenal. */
var UNIVERSE = [
	stock("BBCA", "Bank Central Asia", "Perbankan", "mega", "LID"),
	stock("BBRI", "Bank Rakyat Indonesia", "Perbankan", "mega", "LIDB"),
	stock("BMRI", "Bank Mandiri", "Perbankan", "mega", "LIDB"),
	stock("BBNI", "Bank Negara Indonesia", "Perbankan", "large", "LIDB"),
	stock("BRIS", "Bank Syariah Indonesia", "Perbankan", "large", "LISB"),
	stock("BBTN", "Bank Tabungan Negara", "Perbankan", "mid", "LB"),
	stock("BTPS", "Bank BTPN Syariah", "Perbankan", "mid", "SD"),
	stock("ARTO", "Bank Jago", "Perbankan", "mid", "L"),
	stock("PNBN", "Bank Panin", "Perbankan", "mid", "D"),
	stock("NISP", "Bank OCBC NISP", "Perbankan", "mid", "D"),
	stock("BNGA", "Bank CIMB Niaga", "Perbankan", "mid", "D"),
	stock("BDMN", "Bank Danamon", "Perbankan", "mid", "D"),
	stock("BJBR", "Bank BJB", "Perbankan", "mid", "DB"),
	stock("BJTM", "Bank Jatim", "Perbankan", "mid", "DB"),
	stock("BNLI", "Bank Permata", "Perbankan", "mid", "D"),
	stock("MEGA", "Bank Mega", "Perbankan", "mid", "D"),
	stock("BANK", "Bank Aladin Syariah", "Perbankan", "small", "S"),
	stock("BBYB", "Bank Neo Commerce", "Perbankan", "small", ""),
	stock("TLKM", "Telkom Indonesia", "Telekomunikasi", "mega", "LIDB"),
	stock("EXCL", "XLSmart", "Telekomunikasi", "large", "LD"),
	stock("ISAT", "Indosat", "Telekomunikasi", "large", "LD"),
	stock("TOWR", "Sarana Menara Nusantara", "Telekomunikasi", "large", "LID"),
	stock("TBIG", "Tower Bersama", "Telekomunikasi", "large", "LD"),
	stock("MTEL", "Dayamitra Telekomunikasi", "Telekomunikasi", "large", "LDB"),
	stock("ICBP", "Indofood CBP", "Konsumer", "large", "LID"),
	stock("INDF", "Indofood Sukses Makmur", "Konsumer", "large", "LID"),
	stock("UNVR", "Unilever Indonesia", "Konsumer", "large", "LID"),
	stock("MYOR", "Mayora Indah", "Konsumer", "large", "LID"),
	stock("GOOD", "Garudafood", "Konsumer", "mid", "SD"),
	stock("ROTI", "Nippon Indosari", "Konsumer", "mid", "SD"),
	stock("ULTJ", "Ultrajaya", "Konsumer", "mid", "SD"),
	stock("CLEO", "Sariguna Primatirta", "Konsumer", "mid", "S"),
	stock("DLTA", "Delta Djakarta", "Konsumer", "mid", "D"),
	stock("MLBI", "Multi Bintang", "Konsumer", "mid", "D"),
	stock("STTP", "Siantar Top", "Konsumer", "mid", "D"),
	stock("GGRM", "Gudang Garam", "Konsumer", "large", "LD"),
	stock("HMSP", "HM Sampoerna", "Konsumer", "large", "LID"),
	stock("CPIN", "Charoen Pokphand", "Konsumer", "large", "LID"),
	stock("JPFA", "Japfa Comfeed", "Konsumer", "mid", "LD"),
	stock("CAMP", "Campina Ice Cream", "Konsumer", "small", "S"),
	stock("ASII", "Astra International", "Otomotif", "mega", "LID"),
	stock("UNTR", "United Tractors", "Otomotif", "large", "LID"),
	stock("AUTO", "Astra Otoparts", "Otomotif", "mid", "D"),
	stock("SMSM", "Selamat Sempurna", "Otomotif", "mid", "SD"),
	stock("GJTL", "Gajah Tunggal", "Otomotif", "mid", ""),
	stock("IMAS", "Indomobil Sukses", "Otomotif", "mid", ""),
	stock("ADRO", "Alamtri Resources", "Tambang", "large", "LID"),
	stock("PTBA", "Bukit Asam", "Tambang", "large", "LIDB"),
	stock("ITMG", "Indo Tambangraya", "Tambang", "large", "LID"),
	stock("HRUM", "Harum Energy", "Tambang", "mid", "LD"),
	stock("BYAN", "Bayan Resources", "Tambang", "mega", "LD"),
	stock("BREN", "Barito Renewables", "Energi", "mega", "L"),
	stock("BUMI", "Bumi Resources", "Tambang", "mid", ""),
	stock("INCO", "Vale Indonesia", "Tambang", "large", "LIS"),
	stock("ANTM", "Aneka Tambang", "Tambang", "large", "LISB"),
	stock("TINS", "Timah", "Tambang", "mid", "LB"),
	stock("MDKA", "Merdeka Copper Gold", "Tambang", "large", "LI"),
	stock("BRMS", "Bumi Resources Minerals", "Tambang", "mid", "L"),
	stock("NCKL", "Trimegah Bangun Persada", "Tambang", "large", "L"),
	stock("AMMN", "Amman Mineral", "Tambang", "mega", "LI"),
	stock("PSAB", "J Resources", "Tambang", "small", ""),
	stock("MEDC", "Medco Energi", "Energi", "large", "LD"),
	stock("MBAP", "Mitrabara Adiperdana", "Tambang", "mid", "D"),
	stock("GEMS", "Golden Energy Mines", "Tambang", "large", "D"),
	stock("ADMR", "Adaro Minerals", "Tambang", "large", "L"),
	stock("PGAS", "Perusahaan Gas Negara", "Energi", "large", "LDB"),
	stock("AKRA", "AKR Corporindo", "Energi", "large", "LID"),
	stock("PGEO", "Pertamina Geothermal", "Energi", "large", "LSB"),
	stock("CUAN", "Petrindo Jaya Kreasi", "Energi", "large", "L"),
	stock("DSSA", "Dian Swastatika Sentosa", "Energi", "large", ""),
	stock("RAJA", "Rukun Raharja", "Energi", "mid", ""),
	stock("BSSR", "Baramulti Suksessarana", "Energi", "mid", "D"),
	stock("TOBA", "TBS Energi Utama", "Energi", "mid", ""),
	stock("ESSA", "ESSAindo", "Energi", "mid", "L"),
	stock("BSDE", "Bumi Serpong Damai", "Properti", "large", "LD"),
	stock("CTRA", "Ciputra Development", "Properti", "large", "LD"),
	stock("SMRA", "Summarecon Agung", "Properti", "mid", "LD"),
	stock("PWON", "Pakuwon Jati", "Properti", "large", "LD"),
	stock("DMAS", "Puradelta Lestari", "Properti", "mid", "D"),
	stock("LPKR", "Lippo Karawaci", "Properti", "mid", ""),
	stock("APLN", "Agung Podomoro", "Properti", "small", ""),
	stock("JRPT", "Jaya Real Property", "Properti", "mid", "D"),
	stock("SSIA", "Surya Semesta", "Properti", "mid", ""),
	stock("KIJA", "Kawasan Industri Jababeka", "Properti", "mid", ""),
	stock("PANI", "Pantai Indah Kapuk Dua", "Properti", "large", "L"),
	stock("WIKA", "Wijaya Karya", "Konstruksi", "mid", "B"),
	stock("ADHI", "Adhi Karya", "Konstruksi", "mid", "B"),
	stock("PTPP", "PP (Persero)", "Konstruksi", "mid", "B"),
	stock("WTON", "Wijaya Karya Beton", "Konstruksi", "small", "B"),
	stock("TOTL", "Total Bangun Persada", "Konstruksi", "small", "D"),
	stock("SMGR", "Semen Indonesia", "Industri", "large", "LIDB"),
	stock("INTP", "Indocement", "Industri", "large", "LID"),
	stock("SMCB", "Solusi Bangun Indonesia", "Industri", "mid", ""),
	stock("INKP", "Indah Kiat Pulp", "Industri", "large", "LI"),
	stock("TKIM", "Pabrik Kertas Tjiwi Kimia", "Industri", "large", "L"),
	stock("BRPT", "Barito Pacific", "Industri", "large", "LI"),
	stock("TPIA", "Chandra Asri Pacific", "Industri", "mega", "LI"),
	stock("KRAS", "Krakatau Steel", "Industri", "mid", "B"),
	stock("FASW", "Fajar Surya Wisesa", "Industri", "mid", ""),
	stock("IMPC", "Impack Pratama", "Industri", "mid", "S"),
	stock("KLBF", "Kalbe Farma", "Kesehatan", "large", "LID"),
	stock("SIDO", "Sido Muncul", "Kesehatan", "large", "LISD"),
	stock("KAEF", "Kimia Farma", "Kesehatan", "small", "SB"),
	stock("TSPC", "Tempo Scan Pacific", "Kesehatan", "mid", "D"),
	stock("DVLA", "Darya-Varia", "Kesehatan", "mid", "D"),
	stock("MIKA", "Mitra Keluarga", "Kesehatan", "large", "LD"),
	stock("SILO", "Siloam International", "Kesehatan", "large", "L"),
	stock("HEAL", "Medikaloka Hermina", "Kesehatan", "mid", "L"),
	stock("PRDA", "Prodia Widyahusada", "Kesehatan", "mid", "D"),
	stock("SOHO", "Soho Global Health", "Kesehatan", "mid", ""),
	stock("GOTO", "GoTo Gojek Tokopedia", "Teknologi", "mega", "LI"),
	stock("BUKA", "Bukalapak", "Teknologi", "mid", "L"),
	stock("EMTK", "Elang Mahkota Teknologi", "Teknologi", "large", "L"),
	stock("BELI", "Global Digital Niaga", "Teknologi", "mid", ""),
	stock("DCII", "DCI Indonesia", "Teknologi", "large", ""),
	stock("WIFI", "Solusi Sinergi Digital", "Teknologi", "small", ""),
	stock("EDGE", "Indointernet", "Teknologi", "small", ""),
	stock("MCAS", "M Cash Integrasi", "Teknologi", "small", ""),
	stock("NFCX", "NFC Indonesia", "Teknologi", "small", ""),
	stock("MTDL", "Metrodata Electronics", "Teknologi", "mid", "D"),
	stock("AMRT", "Sumber Alfaria Trijaya", "Ritel", "mega", "LID"),
	stock("MIDI", "Midi Utama Indonesia", "Ritel", "mid", "D"),
	stock("ERAA", "Erajaya Swasembada", "Ritel", "mid", "LD"),
	stock("MAPA", "MAP Aktif Adiperkasa", "Ritel", "large", "L"),
	stock("MAPI", "Mitra Adiperkasa", "Ritel", "large", "LD"),
	stock("ACES", "Ace Hardware Indonesia", "Ritel", "mid", "LD"),
	stock("LPPF", "Matahari Department Store", "Ritel", "mid", "D"),
	stock("MGRO", "Mahkota Group", "Ritel", "small", ""),
	stock("AALI", "Astra Agro Lestari", "Perkebunan", "mid", "SD"),
	stock("LSIP", "PP London Sumatra", "Perkebunan", "mid", "SD"),
	stock("TAPG", "Triputra Agro Persada", "Perkebunan", "mid", "SD"),
	stock("SSMS", "Sawit Sumbermas", "Perkebunan", "mid", "S"),
	stock("DSNG", "Dharma Satya Nusantara", "Perkebunan", "mid", "S"),
	stock("SIMP", "Salim Ivomas", "Perkebunan", "mid", "S"),
	stock("BFIN", "BFI Finance", "Keuangan", "mid", "D"),
	stock("ADMF", "Adira Dinamika Multifinance", "Keuangan", "mid", "D"),
	stock("PNIN", "Paninvest", "Keuangan", "mid", ""),
	stock("ASRM", "Asuransi Ramayana", "Keuangan", "small", "D"),
	stock("CFIN", "Clipan Finance", "Keuangan", "small", "D"),
	stock("WOMF", "Wahana Ottomitra", "Keuangan", "small", ""),
	stock("JSMR", "Jasa Marga", "Infrastruktur", "large", "LIDB"),
	stock("CMNP", "Citra Marga Nusaphala", "Infrastruktur", "mid", "D"),
	stock("POWR", "Cikarang Listrindo", "Infrastruktur", "mid", "D"),
	stock("BIRD", "Blue Bird", "Transportasi", "mid", "D"),
	stock("ASSA", "Adi Sarana Armada", "Transportasi", "mid", ""),
	stock("TMAS", "Temas", "Transportasi", "mid", "D"),
	stock("SMDR", "Samudera Indonesia", "Transportasi", "mid", "D"),
	stock("GIAA", "Garuda Indonesia", "Transportasi", "small", "B"),
	stock("SCMA", "Surya Citra Media", "Media", "mid", "D"),
	stock("MNCN", "Media Nusantara Citra", "Media", "mid", ""),
	stock("FILM", "MD Pictures", "Media", "mid", ""),
	stock("MSIN", "MNC Studios", "Media", "small", "")
];
var UNIVERSE_BY_SYMBOL = new Map(UNIVERSE.map((s) => [s.symbol, s]));
var MOSAIC = [
	"BBCA",
	"BBRI",
	"BMRI",
	"TLKM",
	"ASII",
	"AMMN",
	"GOTO",
	"BREN",
	"ICBP",
	"UNVR",
	"ADRO",
	"KLBF"
];
function yahooSymbol(symbol) {
	return symbol.endsWith(".JK") ? symbol : `${symbol}.JK`;
}
//#endregion
export { UNIVERSE_BY_SYMBOL as a, sizeFromMcap as c, STRATEGY_ORDER as i, yahooSymbol as l, SECTORS as n, cleanName as o, STRATEGIES as r, mapSector as s, MOSAIC as t };
