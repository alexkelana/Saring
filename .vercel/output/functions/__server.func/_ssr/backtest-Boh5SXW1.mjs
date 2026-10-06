import { i as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { i as require_jsx_runtime, t as useMutation } from "../_libs/react+tanstack__react-query.mjs";
import { n as STRATEGIES, r as STRATEGY_ORDER, t as SECTORS } from "./strategies-BJmMjwBP.mjs";
import { c as formatPrice, n as formatDateShort, p as runBacktestFn, r as formatIDR, s as formatPct } from "./format-CtGhOwOb.mjs";
import { l as ArrowUpRight, s as LoaderCircle } from "../_libs/lucide-react.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { n as Button, r as cn, t as AppShell } from "./app-shell-CQ7g93Be.mjs";
import { t as Badge } from "./badge-Bov-DEDP.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/backtest-Boh5SXW1.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function EquityChart({ series, className }) {
	if (series.length < 2) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: cn("h-40 rounded-2xl bg-secondary", className) });
	const values = series.map((p) => p.v);
	const min = Math.min(...values);
	const span = Math.max(...values) - min || 1;
	const w = 640;
	const h = 220;
	const pad = 8;
	const coords = series.map((p, i) => {
		return {
			x: pad + i / (series.length - 1) * 624,
			y: pad + (1 - (p.v - min) / span) * 204,
			p
		};
	});
	const line = coords.map((c, i) => `${i === 0 ? "M" : "L"}${c.x.toFixed(1)} ${c.y.toFixed(1)}`).join(" ");
	const area = `${line} L${coords[coords.length - 1].x.toFixed(1)} 212 L${coords[0].x.toFixed(1)} 212 Z`;
	const start = values[0];
	const last = values[values.length - 1];
	const up = last >= start;
	const ret = (last - start) / start * 100;
	const stroke = up ? "var(--color-up)" : "var(--color-down)";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: cn("rounded-3xl bg-card p-4 shadow-[var(--shadow-border)] sm:p-5", className),
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-baseline justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs uppercase tracking-wide text-muted-foreground",
					children: "Kurva ekuitas"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: cn("font-mono text-sm tabular-nums", up ? "text-up" : "text-down"),
					children: formatPct(ret)
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
				viewBox: `0 0 ${w} ${h}`,
				className: "mt-3 h-44 w-full",
				role: "img",
				"aria-label": "Kurva ekuitas backtest",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
					d: area,
					fill: stroke,
					opacity: "0.14"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
					d: line,
					fill: "none",
					stroke,
					strokeWidth: "2.2",
					strokeLinejoin: "round",
					strokeLinecap: "round"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-1 flex justify-between text-xs text-muted-foreground",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: formatDateShort(series[0].t) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: formatDateShort(series[series.length - 1].t) })]
			})
		]
	});
}
var LOOKBACKS = [
	{
		id: "6mo",
		label: "6 bulan"
	},
	{
		id: "1y",
		label: "1 tahun"
	},
	{
		id: "2y",
		label: "2 tahun"
	}
];
var EXIT_LABEL = {
	target: "Target",
	stop: "Stop",
	time: "Waktu",
	signal: "Sinyal"
};
function BacktestView() {
	const [strategy, setStrategy] = (0, import_react.useState)("swing");
	const [lookback, setLookback] = (0, import_react.useState)("1y");
	const [sector, setSector] = (0, import_react.useState)("Semua");
	const [result, setResult] = (0, import_react.useState)(null);
	const mutation = useMutation({
		mutationFn: () => runBacktestFn({ data: {
			strategy,
			lookback,
			sector
		} }),
		onSuccess: (data) => {
			setResult(data);
			toast.message(`Backtest ${STRATEGIES[strategy].label} selesai`, { description: `${data.metrics.trades} transaksi di ${data.used} emiten.` });
		},
		onError: () => {
			toast.message("Backtest gagal. Coba beberapa saat lagi.");
		}
	});
	const item = STRATEGIES[strategy];
	const m = result?.metrics;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppShell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "saring-enter-2 mt-8",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs uppercase tracking-wide text-muted-foreground",
				children: "Simulasi historis"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "font-display text-3xl tracking-tight",
				children: "Backtest"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground",
				children: [
					"Menjalankan aturan ",
					item.label.toLowerCase(),
					" di emiten likuid BEI, modal virtual Rp 100 juta, biaya 0,15% per sisi. Bukan jaminan kinerja masa depan."
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-6 grid gap-3 md:grid-cols-3",
				children: STRATEGY_ORDER.map((id) => {
					const s = STRATEGIES[id];
					const active = strategy === id;
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						onClick: () => setStrategy(id),
						className: cn("rounded-3xl p-4 text-left shadow-[var(--shadow-border)] transition-[background-color,box-shadow] duration-200", active ? "bg-primary text-primary-foreground" : "bg-card text-foreground"),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "font-display text-xl tracking-tight",
							children: s.label
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: cn("mt-1 text-sm", active ? "text-primary-foreground/75" : "text-muted-foreground"),
							children: s.horizon
						})]
					}, id);
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-5 flex flex-col gap-3 lg:flex-row lg:items-center",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex flex-wrap gap-1.5",
						children: LOOKBACKS.map((l) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: () => setLookback(l.id),
							className: cn("inline-flex h-11 items-center rounded-full px-4 text-sm", lookback === l.id ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"),
							children: l.label
						}, l.id))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
						className: "sr-only",
						htmlFor: "bt-sektor",
						children: "Sektor"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
						id: "bt-sektor",
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
						children: [mutation.isPending ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-4 animate-spin" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowUpRight, { className: "size-4" }), mutation.isPending ? "Mensimulasi…" : "Jalankan backtest"]
					})
				]
			}),
			mutation.isPending ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-8 rounded-3xl bg-card px-5 py-8 shadow-[var(--shadow-border)]",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "font-display text-2xl tracking-tight",
					children: "Mengambil history papan"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "shimmer-text mt-2 text-sm",
					children: "Sinyal, fill, stop, dan target dihitung per sesi…"
				})]
			}) : null,
			result && m && !mutation.isPending ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-8 space-y-5",
				children: [
					result.note ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "rounded-2xl bg-warn/10 px-4 py-3 text-sm text-warn",
						children: result.note
					}) : null,
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid gap-3 sm:grid-cols-2 lg:grid-cols-4",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
								label: "Imbal hasil",
								value: formatPct(m.totalReturn),
								tone: m.totalReturn >= 0 ? "up" : "down"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
								label: "Win rate",
								value: `${m.winRate.toFixed(0)}%`,
								sub: `${m.wins} menang / ${m.losses} kalah`
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
								label: "Max drawdown",
								value: formatPct(-Math.abs(m.maxDrawdown)),
								tone: "down"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
								label: "Vs IHSG",
								value: m.vsBuyHold == null ? "—" : formatPct(m.vsBuyHold),
								tone: m.vsBuyHold == null ? void 0 : m.vsBuyHold >= 0 ? "up" : "down",
								sub: "alpha vs buy-hold"
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid gap-3 sm:grid-cols-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
								label: "Transaksi",
								value: String(m.trades),
								sub: `hold ${m.avgHoldDays.toFixed(1)} hari`
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
								label: "Profit factor",
								value: m.profitFactor >= 20 ? "∞" : m.profitFactor.toFixed(2),
								sub: `avg ${formatPct(m.avgWin)} / ${formatPct(m.avgLoss)}`
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
								label: "Ekuitas akhir",
								value: formatIDR(m.finalEquity),
								sub: `dari ${formatIDR(m.startEquity)}`
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(EquityChart, { series: result.equity }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid gap-5 lg:grid-cols-[minmax(0,1fr)_18rem]",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs uppercase tracking-wide text-muted-foreground",
								children: "Transaksi terakhir"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
								className: "mt-3 space-y-2",
								children: result.trades.map((t, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
									className: "flex flex-wrap items-center justify-between gap-2 rounded-2xl bg-card px-4 py-3 shadow-[var(--shadow-border)]",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-center gap-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "font-medium",
											children: t.symbol
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
											variant: t.retPct >= 0 ? "up" : "down",
											children: EXIT_LABEL[t.exitReason]
										})]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "mt-0.5 text-xs text-muted-foreground",
										children: [
											formatDateShort(t.entryDate),
											" → ",
											formatDateShort(t.exitDate),
											" · ",
											t.holdDays,
											"h ·",
											" ",
											formatPrice(t.entry),
											" → ",
											formatPrice(t.exit)
										]
									})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: cn("font-mono text-sm tabular-nums", t.retPct >= 0 ? "text-up" : "text-down"),
										children: formatPct(t.retPct)
									})]
								}, `${t.symbol}-${t.entryDate}-${i}`))
							}),
							result.trades.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-6 text-sm text-muted-foreground",
								children: "Tidak ada sinyal yang terpenuhi di periode ini."
							}) : null
						] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs uppercase tracking-wide text-muted-foreground",
							children: "Kontributor"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
							className: "mt-3 space-y-2",
							children: result.bySymbol.map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
								className: "rounded-2xl bg-secondary px-3 py-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-baseline justify-between gap-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "font-medium",
										children: row.symbol
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: cn("font-mono text-sm tabular-nums", row.retPct >= 0 ? "text-up" : "text-down"),
										children: formatPct(row.retPct)
									})]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "mt-0.5 text-xs text-muted-foreground",
									children: [
										row.trades,
										" tx · win ",
										row.winRate.toFixed(0),
										"%"
									]
								})]
							}, row.symbol))
						})] })]
					})
				]
			}) : !mutation.isPending ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-8 rounded-3xl bg-card px-5 py-8 shadow-[var(--shadow-border)] sm:px-8",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-display text-2xl tracking-tight",
						children: "Uji dulu, baru taruh modal."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "mt-5 grid gap-2 sm:grid-cols-2",
						children: item.looksFor.map((line) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
							className: "flex gap-2 text-sm",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "mt-2 size-1 shrink-0 rounded-full bg-primary" }), line]
						}, line))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						className: "mt-7",
						onClick: () => mutation.mutate(),
						children: ["Jalankan backtest", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowUpRight, { className: "size-4" })]
					})
				]
			}) : null
		]
	}) });
}
function Metric({ label, value, sub, tone }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-3xl bg-card px-4 py-4 shadow-[var(--shadow-border)]",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs uppercase tracking-wide text-muted-foreground",
				children: label
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: cn("mt-2 font-mono text-xl tabular-nums", tone === "up" && "text-up", tone === "down" && "text-down"),
				children: value
			}),
			sub ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-xs text-muted-foreground",
				children: sub
			}) : null
		]
	});
}
var SplitComponent = BacktestView;
//#endregion
export { SplitComponent as component };
