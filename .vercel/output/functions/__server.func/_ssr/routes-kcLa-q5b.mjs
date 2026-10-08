import { i as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { i as require_jsx_runtime, n as useQuery, t as useMutation } from "../_libs/react+tanstack__react-query.mjs";
import { n as STRATEGIES, r as STRATEGY_ORDER, t as SECTORS } from "./strategies-BJmMjwBP.mjs";
import { t as MOSAIC } from "./universe-CuRQ4irm.mjs";
import { n as create, t as persist } from "../_libs/zustand.mjs";
import { a as formatLots, c as formatPrice, h as useDesk, i as formatJakarta, l as formatRoe, m as runScreen, o as formatMultiple, r as formatIDR, s as formatPct, t as formatCompactIDR, u as getMarketOverview } from "./format-CtGhOwOb.mjs";
import { a as Search, c as Bell, i as Star, l as ArrowUpRight, n as Wallet, s as LoaderCircle, t as X } from "../_libs/lucide-react.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { n as Button, r as cn, t as AppShell } from "./app-shell-CQ7g93Be.mjs";
import { t as Badge } from "./badge-Bov-DEDP.mjs";
import { t as Input } from "./input-BszirhD1.mjs";
import { n as Route$2 } from "./router-DCMqvfuV.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-kcLa-q5b.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function RangeBar({ low, high, value, className }) {
	if (low == null || high == null || high <= low) return null;
	const pct = Math.min(100, Math.max(0, (value - low) / (high - low) * 100));
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: cn("space-y-1.5", className),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-baseline justify-between text-xs text-muted-foreground",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "font-mono tabular-nums",
					children: formatPrice(low)
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "52 minggu" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "font-mono tabular-nums",
					children: formatPrice(high)
				})
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "relative h-1 rounded-full bg-secondary",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "absolute top-1/2 size-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary",
				style: { left: `${pct}%` }
			})
		})]
	});
}
function ScoreRing({ value, size = 52, className }) {
	const r = 18;
	const c = 2 * Math.PI * r;
	const pct = Math.min(100, Math.max(0, value));
	const dash = pct / 100 * c;
	const tone = pct >= 72 ? "var(--color-up)" : pct >= 58 ? "var(--color-warn)" : "var(--color-muted-foreground)";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: cn("relative grid place-items-center", className),
		style: {
			width: size,
			height: size
		},
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
			viewBox: "0 0 44 44",
			className: "size-full -rotate-90",
			"aria-hidden": "true",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
				cx: "22",
				cy: "22",
				r,
				fill: "none",
				stroke: "var(--color-border)",
				strokeWidth: "3.5"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
				cx: "22",
				cy: "22",
				r,
				fill: "none",
				stroke: tone,
				strokeWidth: "3.5",
				strokeLinecap: "round",
				strokeDasharray: `${dash} ${c}`
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "absolute font-mono text-[13px] font-medium tabular-nums text-foreground",
			children: Math.round(pct)
		})]
	});
}
function Sparkline({ values, className, up }) {
	if (values.length < 2) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: cn("h-8", className) });
	const min = Math.min(...values);
	const span = Math.max(...values) - min || 1;
	const w = 120;
	const h = 36;
	const pts = values.map((v, i) => {
		const x = i / (values.length - 1) * w;
		const y = h - (v - min) / span * 32 - 2;
		return `${x.toFixed(1)},${y.toFixed(1)}`;
	}).join(" ");
	const last = values[values.length - 1];
	const first = values[0];
	const positive = up ?? last >= first;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("svg", {
		viewBox: `0 0 ${w} ${h}`,
		className: cn("h-8 w-[7.5rem] overflow-visible", className),
		"aria-hidden": "true",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("polyline", {
			fill: "none",
			stroke: positive ? "var(--color-up)" : "var(--color-down)",
			strokeWidth: "1.6",
			strokeLinejoin: "round",
			strokeLinecap: "round",
			points: pts
		})
	});
}
function Separator({ className }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: cn("h-px w-full bg-border", className),
		role: "separator"
	});
}
var useScreener = create()(persist((set, get) => ({
	strategy: "swing",
	sector: "Semua",
	query: "",
	sort: "score",
	verdictFilter: "all",
	result: null,
	selected: null,
	watchlist: [],
	error: null,
	setStrategy: (strategy) => set({ strategy }),
	setSector: (sector) => set({ sector }),
	setQuery: (query) => set({ query }),
	setSort: (sort) => set({ sort }),
	setVerdictFilter: (verdictFilter) => set({ verdictFilter }),
	setResult: (result) => set({
		result,
		selected: result?.results[0]?.symbol ?? null,
		error: null,
		verdictFilter: "all"
	}),
	setSelected: (selected) => set({ selected }),
	setError: (error) => set({ error }),
	toggleWatch: (symbol) => {
		const cur = get().watchlist;
		set({ watchlist: cur.includes(symbol) ? cur.filter((s) => s !== symbol) : [...cur, symbol] });
	}
}), {
	name: "saring-v2",
	partialize: (s) => ({
		watchlist: s.watchlist,
		strategy: s.strategy
	})
}));
function FactorBar({ label, value }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-1.5",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-baseline justify-between text-xs",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-muted-foreground",
				children: label
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "font-mono tabular-nums text-foreground",
				children: Math.round(value)
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "h-1 overflow-hidden rounded-full bg-secondary",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: cn("h-full rounded-full transition-[width] duration-500 ease-out", value >= 72 ? "bg-up" : value >= 58 ? "bg-warn" : "bg-muted-foreground/50"),
				style: { width: `${Math.min(100, Math.max(0, value))}%` }
			})
		})]
	});
}
var VERDICT_COPY$1 = {
	beli: "Layak beli",
	pertimbangkan: "Pertimbangkan",
	tunggu: "Tunggu konfirmasi"
};
function StockDetail({ stock, onClose }) {
	const strategy = useScreener((s) => s.strategy);
	const watchlist = useScreener((s) => s.watchlist);
	const toggleWatch = useScreener((s) => s.toggleWatch);
	const saved = watchlist.includes(stock.symbol);
	const weights = STRATEGIES[strategy].weights;
	const up = stock.changePct >= 0;
	const rr = stock.price > stock.levels.stop ? (stock.levels.target - stock.price) / (stock.price - stock.levels.stop) : 0;
	const f = stock.fundamentals;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex h-full flex-col",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-start justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap items-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "font-display text-2xl font-medium tracking-tight text-foreground",
						children: stock.symbol
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
						variant: stock.verdict,
						children: VERDICT_COPY$1[stock.verdict]
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-0.5 text-sm text-muted-foreground",
					children: stock.name
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-1",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "ghost",
						size: "icon",
						className: "size-11",
						"aria-label": saved ? "Hapus dari watchlist" : "Simpan ke watchlist",
						onClick: () => toggleWatch(stock.symbol),
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Star, { className: cn("size-4", saved && "fill-primary text-primary") })
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "ghost",
						size: "icon",
						className: "size-11",
						onClick: onClose,
						"aria-label": "Tutup",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-4" })
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-4 flex items-end justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "font-mono text-3xl font-medium tracking-tight tabular-nums",
					children: formatPrice(stock.price)
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: cn("mt-1 font-mono text-sm tabular-nums", up ? "text-up" : "text-down"),
					children: formatPct(stock.changePct)
				})] }), stock.spark.length > 2 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkline, {
					values: stock.spark,
					up,
					className: "h-10 w-36"
				}) : null]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RangeBar, {
				className: "mt-4",
				low: stock.week52Low,
				high: stock.week52High,
				value: stock.price
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-5 text-sm leading-relaxed text-foreground/90",
				children: stock.thesis
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-5 grid grid-cols-3 gap-2",
				children: [
					{
						k: "Stop",
						v: formatPrice(stock.levels.stop)
					},
					{
						k: "Target",
						v: formatPrice(stock.levels.target)
					},
					{
						k: "R:R",
						v: rr ? `${rr.toFixed(1)}×` : "—"
					}
				].map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rounded-xl bg-secondary px-3 py-2.5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs uppercase tracking-wide text-muted-foreground",
						children: item.k
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 font-mono text-sm tabular-nums",
						children: item.v
					})]
				}, item.k))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Separator, { className: "my-5" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FactorBar, {
						label: `Teknikal · ${Math.round(weights.technical * 100)}%`,
						value: stock.scores.technical
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FactorBar, {
						label: `Fundamental · ${Math.round(weights.fundamental * 100)}%`,
						value: stock.scores.fundamental
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FactorBar, {
						label: `Sentimen · ${Math.round(weights.sentiment * 100)}%`,
						value: stock.scores.sentiment
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-5 grid grid-cols-2 gap-x-4 gap-y-2 text-sm",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Meta, {
						label: "Sektor",
						value: stock.sector
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Meta, {
						label: "RSI",
						value: stock.indicators.rsi != null ? stock.indicators.rsi.toFixed(0) : "—"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Meta, {
						label: "RVOL",
						value: stock.indicators.rvol != null ? `${stock.indicators.rvol.toFixed(1)}×` : "—"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Meta, {
						label: "Posisi 52w",
						value: stock.indicators.pos52w != null ? `${stock.indicators.pos52w.toFixed(0)}%` : "—"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Meta, {
						label: "Nilai",
						value: `Rp ${formatCompactIDR(stock.value)}`
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Meta, {
						label: "Support",
						value: formatPrice(stock.levels.support)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Meta, {
						label: "PE",
						value: formatMultiple(f.pe)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Meta, {
						label: "PB",
						value: formatMultiple(f.pb)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Meta, {
						label: "ROE",
						value: formatRoe(f.roe)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Meta, {
						label: "Dividen",
						value: f.divYield != null ? `${f.divYield.toFixed(1)}%` : "—"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Meta, {
						label: "Kap.",
						value: f.mcap ? `Rp ${formatCompactIDR(f.mcap)}` : "—"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Meta, {
						label: "DER",
						value: formatMultiple(f.de)
					})
				]
			}),
			stock.flags.lq45 || stock.flags.dividend || stock.flags.soe || stock.flags.shariah ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-4 flex flex-wrap gap-1.5",
				children: [
					stock.flags.lq45 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, { children: "LQ45" }) : null,
					stock.flags.idx30 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, { children: "IDX30" }) : null,
					stock.flags.soe ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, { children: "BUMN" }) : null,
					stock.flags.dividend ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, { children: "Dividen" }) : null,
					stock.flags.shariah ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, { children: "Syariah" }) : null
				]
			}) : null,
			stock.reasons.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs uppercase tracking-wide text-muted-foreground",
					children: "Alasan"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "mt-2 space-y-1.5 text-sm text-foreground/90",
					children: stock.reasons.map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "flex gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "mt-2 size-1 shrink-0 rounded-full bg-up" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: r })]
					}, r))
				})]
			}) : null,
			stock.risks.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs uppercase tracking-wide text-muted-foreground",
					children: "Risiko"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "mt-2 space-y-1.5 text-sm text-foreground/90",
					children: stock.risks.map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "flex gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "mt-2 size-1 shrink-0 rounded-full bg-down" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: r })]
					}, r))
				})]
			}) : null,
			stock.headlines.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs uppercase tracking-wide text-muted-foreground",
					children: "Berita"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "mt-2 space-y-2",
					children: stock.headlines.slice(0, 3).map((h) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "text-sm leading-snug",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-foreground/90",
							children: h.title
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-0.5 text-xs text-muted-foreground",
							children: h.source
						})]
					}, h.title))
				})]
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DeskActions, {
				stock,
				strategy
			})
		]
	});
}
function DeskActions({ stock, strategy }) {
	const addAlert = useDesk((s) => s.addAlert);
	const addPosition = useDesk((s) => s.addPosition);
	const [lots, setLots] = (0, import_react.useState)("1");
	const [openBuy, setOpenBuy] = (0, import_react.useState)(false);
	const alertAt = (kind, value, label) => {
		addAlert({
			symbol: stock.symbol,
			name: stock.name,
			kind,
			value
		});
		toast.message(`Alert ${stock.symbol}`, { description: `${label} ${formatPrice(value)}` });
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
			shares: n * 100,
			avgPrice: stock.price,
			strategy,
			stop: stock.levels.stop,
			target: stock.levels.target
		});
		setOpenBuy(false);
		toast.message(`${stock.symbol} masuk portofolio`, { description: `${formatLots(n * 100)} @ ${formatPrice(stock.price)} · ${formatIDR(n * 100 * stock.price)}` });
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mt-6 space-y-3",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "grid grid-cols-2 gap-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
				variant: "subtle",
				size: "sm",
				className: "h-11",
				onClick: () => alertAt("above", stock.levels.target, "di atas target"),
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bell, { className: "size-4" }), "Alert target"]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
				variant: "subtle",
				size: "sm",
				className: "h-11",
				onClick: () => alertAt("below", stock.levels.stop, "di bawah stop"),
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bell, { className: "size-4" }), "Alert stop"]
			})]
		}), openBuy ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "rounded-2xl bg-secondary p-3",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
					className: "text-xs uppercase tracking-wide text-muted-foreground",
					htmlFor: "lot-buy",
					children: "Lot (100 lembar)"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-2 flex gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						id: "lot-buy",
						type: "number",
						min: .01,
						value: lots,
						onChange: (e) => setLots(e.target.value),
						className: "h-11"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						className: "h-11",
						onClick: buy,
						children: "Beli"
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-2 text-xs text-muted-foreground",
					children: ["Estimasi ", formatIDR((Number(lots) || 0) * 100 * stock.price)]
				})
			]
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
			className: "h-11 w-full",
			onClick: () => setOpenBuy(true),
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Wallet, { className: "size-4" }), "Masuk portofolio"]
		})]
	});
}
function Meta({ label, value }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex items-baseline justify-between gap-2",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "text-muted-foreground",
			children: label
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "font-mono text-xs tabular-nums",
			children: value
		})]
	});
}
var STEPS = [
	"Mengambil papan BEI — teknikal dan fundamental…",
	"Menyaring likuiditas sesuai strategi…",
	"Memindai headline dan sentimen berita…",
	"Menyusun peringkat kandidat beli…"
];
var VERDICT_COPY = {
	beli: "Beli",
	pertimbangkan: "Timbang",
	tunggu: "Tunggu"
};
var SORT_OPTIONS = [
	{
		id: "score",
		label: "Skor"
	},
	{
		id: "change",
		label: "%"
	},
	{
		id: "value",
		label: "Nilai"
	},
	{
		id: "rsi",
		label: "RSI"
	}
];
var VERDICT_FILTERS = [
	{
		id: "all",
		label: "Semua"
	},
	{
		id: "beli",
		label: "Beli"
	},
	{
		id: "pertimbangkan",
		label: "Timbang"
	}
];
function HomeView({ initialMarket }) {
	const strategy = useScreener((s) => s.strategy);
	const sector = useScreener((s) => s.sector);
	const query = useScreener((s) => s.query);
	const sort = useScreener((s) => s.sort);
	const verdictFilter = useScreener((s) => s.verdictFilter);
	const result = useScreener((s) => s.result);
	const selected = useScreener((s) => s.selected);
	const watchlist = useScreener((s) => s.watchlist);
	const error = useScreener((s) => s.error);
	const setStrategy = useScreener((s) => s.setStrategy);
	const setSector = useScreener((s) => s.setSector);
	const setQuery = useScreener((s) => s.setQuery);
	const setSort = useScreener((s) => s.setSort);
	const setVerdictFilter = useScreener((s) => s.setVerdictFilter);
	const setResult = useScreener((s) => s.setResult);
	const setSelected = useScreener((s) => s.setSelected);
	const setError = useScreener((s) => s.setError);
	const toggleWatch = useScreener((s) => s.toggleWatch);
	const [step, setStep] = (0, import_react.useState)(0);
	const [watchOnly, setWatchOnly] = (0, import_react.useState)(false);
	const marketQuery = useQuery({
		queryKey: ["ihsg"],
		queryFn: () => getMarketOverview(),
		initialData: initialMarket,
		refetchInterval: 9e4
	});
	const mutation = useMutation({
		mutationFn: () => runScreen({ data: {
			strategy,
			sector
		} }),
		onSuccess: (data) => {
			setResult(data);
			toast.message(`Selesai memindai ${data.scanned} emiten`, { description: `${data.results.length} saham masuk radar ${STRATEGIES[strategy].label.toLowerCase()}.` });
			const desk = useDesk.getState();
			if (!desk.screenPing) return;
			const beli = data.results.filter((r) => r.verdict === "beli");
			const saved = useScreener.getState().watchlist;
			const hits = beli.filter((r) => saved.includes(r.symbol));
			if (hits.length) {
				const body = hits.map((r) => r.symbol).join(", ");
				desk.pushNotice({
					title: `${hits.length} watchlist masuk beli`,
					body,
					kind: "screen",
					symbol: hits[0]?.symbol
				});
			} else if (beli.length) desk.pushNotice({
				title: `${beli.length} saham radar beli`,
				body: `${STRATEGIES[strategy].label}: ${beli.slice(0, 5).map((r) => r.symbol).join(", ")}`,
				kind: "screen"
			});
		},
		onError: () => {
			setError("Screening gagal. Coba beberapa saat lagi.");
		}
	});
	(0, import_react.useEffect)(() => {
		if (!mutation.isPending) return;
		setStep(0);
		const id = window.setInterval(() => setStep((s) => (s + 1) % STEPS.length), 1800);
		return () => window.clearInterval(id);
	}, [mutation.isPending]);
	const market = result?.market ?? marketQuery.data;
	const selectedStock = result?.results.find((r) => r.symbol === selected) ?? null;
	const filtered = (0, import_react.useMemo)(() => {
		const rows = result?.results ?? [];
		const q = query.trim().toUpperCase();
		const next = rows.filter((r) => {
			if (watchOnly && !watchlist.includes(r.symbol)) return false;
			if (verdictFilter !== "all" && r.verdict !== verdictFilter) return false;
			if (!q) return true;
			return r.symbol.includes(q) || r.name.toUpperCase().includes(q) || r.sector.toUpperCase().includes(q);
		});
		next.sort((a, b) => {
			if (sort === "change") return b.changePct - a.changePct;
			if (sort === "value") return b.value - a.value;
			if (sort === "rsi") return (b.indicators.rsi ?? 0) - (a.indicators.rsi ?? 0);
			return b.scores.total - a.scores.total;
		});
		return next;
	}, [
		result,
		query,
		watchOnly,
		watchlist,
		sort,
		verdictFilter
	]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AppShell, {
		market,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
				className: "saring-enter-2 mt-8 grid gap-3 md:grid-cols-3",
				children: STRATEGY_ORDER.map((id) => {
					const item = STRATEGIES[id];
					const active = strategy === id;
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						onClick: () => setStrategy(id),
						className: cn("rounded-3xl p-4 text-left shadow-[var(--shadow-border)] transition-[background-color,box-shadow,transform] duration-200 ease-out", "hover:shadow-[var(--shadow-border-hover)] active:scale-[0.99]", active ? "bg-primary text-primary-foreground" : "bg-card text-foreground"),
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-baseline justify-between gap-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "font-display text-xl tracking-tight",
									children: item.label
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: cn("font-mono text-xs uppercase tracking-wide", active ? "text-primary-foreground/70" : "text-muted-foreground"),
									children: item.horizon
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: cn("mt-2 text-sm leading-relaxed", active ? "text-primary-foreground/80" : "text-muted-foreground"),
								children: item.blurb
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: cn("mt-4 flex h-1 overflow-hidden rounded-full", active ? "bg-primary-foreground/15" : "bg-secondary"),
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: cn("h-full", active ? "bg-primary-foreground" : "bg-foreground/70"),
										style: { flexGrow: item.weights.technical }
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: cn("h-full", active ? "bg-primary-foreground/60" : "bg-foreground/40"),
										style: { flexGrow: item.weights.fundamental }
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: cn("h-full", active ? "bg-primary-foreground/30" : "bg-foreground/20"),
										style: { flexGrow: item.weights.sentiment }
									})
								]
							})
						]
					}, id);
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "saring-enter-3 mt-6 flex flex-col gap-3 lg:flex-row lg:items-center",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "relative min-w-0 flex-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-muted-foreground" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							value: query,
							onChange: (e) => setQuery(e.target.value),
							placeholder: "Cari kode, nama, atau sektor",
							className: "pl-11",
							"aria-label": "Cari emiten"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
						className: "sr-only",
						htmlFor: "sektor",
						children: "Sektor"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
						id: "sektor",
						value: sector,
						onChange: (e) => setSector(e.target.value),
						className: "h-11 rounded-full bg-secondary px-4 text-sm text-foreground shadow-[var(--shadow-border)] focus-visible:ring-2 focus-visible:ring-ring/70 focus-visible:outline-none",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: "Semua",
							children: "Semua sektor"
						}), SECTORS.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: s,
							children: s
						}, s))]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						className: "h-11 min-w-[11rem]",
						onClick: () => mutation.mutate(),
						disabled: mutation.isPending,
						children: [mutation.isPending ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-4 animate-spin" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowUpRight, { className: "size-4" }), mutation.isPending ? "Menyaring…" : "Jalankan screening"]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-3 text-sm text-muted-foreground",
				children: [
					"Seluruh papan BEI · teknikal, fundamental, dan sentimen berita · strategi",
					" ",
					STRATEGIES[strategy].label.toLowerCase()
				]
			}),
			mutation.isPending ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoadingPanel, {
				step,
				strategy
			}) : null,
			error && !mutation.isPending ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-6 rounded-2xl bg-down/10 px-4 py-3 text-sm text-down",
				children: error
			}) : null,
			!mutation.isPending && result ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-6 grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_22rem]",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-wrap items-center justify-between gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-sm text-muted-foreground",
							children: [
								result.qualified,
								" kandidat dari ",
								result.scanned,
								" emiten",
								` · ${result.eligible} lolos likuiditas`,
								result.asOf ? ` · ${formatJakarta(result.asOf)}` : ""
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							onClick: () => setWatchOnly((v) => !v),
							className: cn("inline-flex h-11 items-center gap-1.5 rounded-full px-3 text-sm transition-colors duration-150", watchOnly ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Star, { className: cn("size-3.5", watchOnly && "fill-current") }), "Tersimpan"]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-3 flex flex-wrap items-center gap-2",
						children: [
							VERDICT_FILTERS.map((f) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								onClick: () => setVerdictFilter(f.id),
								className: cn("inline-flex h-9 items-center rounded-full px-3 text-sm transition-colors duration-150", verdictFilter === f.id ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"),
								children: f.label
							}, f.id)),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "mx-1 text-muted-foreground",
								children: "·"
							}),
							SORT_OPTIONS.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								onClick: () => setSort(s.id),
								className: cn("inline-flex h-9 items-center rounded-full px-3 text-sm transition-colors duration-150", sort === s.id ? "bg-accent text-foreground" : "text-muted-foreground hover:text-foreground"),
								children: s.label
							}, s.id))
						]
					}),
					result.note ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-3 rounded-2xl bg-warn/10 px-4 py-3 text-sm text-warn",
						children: result.note
					}) : null,
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "mt-3 space-y-2",
						children: filtered.map((row, i) => {
							const active = row.symbol === selected;
							const up = row.changePct >= 0;
							const saved = watchlist.includes(row.symbol);
							return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: cn("flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left shadow-[var(--shadow-border)] transition-[background-color,box-shadow] duration-150 sm:px-4", active ? "bg-accent" : "bg-card hover:shadow-[var(--shadow-border-hover)]"),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									type: "button",
									onClick: () => setSelected(row.symbol),
									className: "flex min-w-0 flex-1 items-center gap-3",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "hidden w-5 font-mono text-xs text-muted-foreground tabular-nums sm:block",
											children: String(i + 1).padStart(2, "0")
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScoreRing, {
											value: row.scores.total,
											size: 44
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "min-w-0 flex-1",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "flex flex-wrap items-center gap-2",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "font-medium tracking-tight",
													children: row.symbol
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
													variant: row.verdict,
													children: VERDICT_COPY[row.verdict]
												})]
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "truncate text-sm text-muted-foreground",
												children: row.name
											})]
										}),
										row.spark.length > 2 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkline, {
											values: row.spark,
											up,
											className: "hidden h-8 w-24 shrink-0 md:block"
										}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "hidden w-28 shrink-0 md:block",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RangeBar, {
												low: row.week52Low,
												high: row.week52High,
												value: row.price
											})
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "shrink-0 text-right",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "font-mono text-sm tabular-nums",
												children: formatPrice(row.price)
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: cn("font-mono text-xs tabular-nums", up ? "text-up" : "text-down"),
												children: formatPct(row.changePct)
											})]
										})
									]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									className: "grid size-11 shrink-0 place-items-center rounded-full text-muted-foreground hover:text-foreground",
									"aria-label": saved ? "Hapus dari watchlist" : "Simpan",
									onClick: () => toggleWatch(row.symbol),
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Star, { className: cn("size-4", saved && "fill-primary text-primary") })
								})]
							}) }, row.symbol);
						})
					}),
					filtered.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-8 text-sm text-muted-foreground",
						children: "Tidak ada emiten yang cocok dengan saringan ini."
					}) : null
				] }), selectedStock ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					className: "fixed inset-0 z-40 bg-background/70 lg:hidden",
					"aria-label": "Tutup detail",
					onClick: () => setSelected(null)
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
					className: "fixed inset-x-0 bottom-0 z-50 max-h-[86vh] overflow-y-auto rounded-t-3xl bg-card p-5 shadow-[var(--shadow-border)] lg:sticky lg:top-5 lg:z-0 lg:max-h-[calc(100dvh-2.5rem)] lg:rounded-3xl",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "mx-auto mb-3 h-1 w-10 rounded-full bg-border lg:hidden" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StockDetail, {
						stock: selectedStock,
						onClose: () => setSelected(null)
					})]
				})] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("aside", {
					className: "hidden rounded-3xl bg-card p-6 text-sm text-muted-foreground shadow-[var(--shadow-border)] lg:block",
					children: "Pilih emiten untuk melihat thesis, level, dan pecahan skor."
				})]
			}) : !mutation.isPending ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
				strategy,
				onRun: () => mutation.mutate()
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("footer", {
				className: "mt-16 max-w-2xl text-xs leading-relaxed text-muted-foreground",
				children: ["Saring memindai emiten BEI dari data pasar publik: indikator teknikal, fundamental (PE, ROE, dividen, kapitalisasi), dan sentimen berita. Ini bukan saran investasi, ajakan membeli, atau jaminan imbal hasil. Selalu verifikasi ke sumber resmi dan sesuaikan dengan profil risiko Anda.", result && !result.sentimentEnabled ? " Analisis sentimen AI tidak aktif pada sesi ini — skor berita memakai headline." : ""]
			})
		]
	});
}
function LoadingPanel({ step, strategy }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mt-10 rounded-3xl bg-card px-5 py-8 shadow-[var(--shadow-border)] sm:px-8",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "font-display text-2xl tracking-tight",
				children: "Memindai papan BEI"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "shimmer-text mt-2 text-sm",
				children: STEPS[step]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-6 grid grid-cols-3 gap-2 sm:grid-cols-6",
				children: MOSAIC.map((symbol, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "rounded-xl bg-secondary px-2 py-2 text-center font-mono text-xs text-muted-foreground",
					style: { opacity: .35 + (i + step) % 5 * .12 },
					children: symbol
				}, symbol))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-5 text-sm text-muted-foreground",
				children: [
					"Strategi ",
					STRATEGIES[strategy].label,
					" · seluruh emiten likuid. Biasanya 5–10 detik."
				]
			})
		]
	});
}
function EmptyState({ strategy, onRun }) {
	const item = STRATEGIES[strategy];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mt-10 rounded-3xl bg-card px-5 py-8 shadow-[var(--shadow-border)] sm:px-8",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "font-display text-3xl tracking-tight",
				children: "Saring dulu, baru beli."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground",
				children: item.blurb
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "mt-5 grid gap-2 sm:grid-cols-2",
				children: item.looksFor.map((line) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "flex gap-2 text-sm text-foreground/90",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "mt-2 size-1 shrink-0 rounded-full bg-primary" }), line]
				}, line))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("details", {
				className: "mt-6 max-w-xl text-sm text-muted-foreground",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("summary", {
					className: "cursor-pointer text-foreground",
					children: "Bagaimana skor dihitung"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 leading-relaxed",
					children: "Setiap emiten dinilai 0–100 dari tiga faktor sesuai strategi: teknikal (RSI, SMA, MACD, volume relatif), fundamental (PE, ROE, dividen, kapitalisasi, likuiditas), dan sentimen berita. Hanya yang cukup likuid yang naik ke daftar kandidat."
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
				className: "mt-7",
				onClick: onRun,
				children: ["Jalankan screening", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowUpRight, { className: "size-4" })]
			})
		]
	});
}
function Home() {
	const market = Route$2.useLoaderData();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HomeView, { initialMarket: market });
}
//#endregion
export { Home as component };
