import { i as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { i as require_jsx_runtime, n as useQuery, t as useMutation } from "../_libs/react+tanstack__react-query.mjs";
import { n as UNIVERSE } from "./universe-CuRQ4irm.mjs";
import { a as formatLots, c as formatPrice, d as getQuotes, f as positionMetrics, h as useDesk, r as formatIDR, s as formatPct, t as formatCompactIDR } from "./format-CtGhOwOb.mjs";
import { o as Plus } from "../_libs/lucide-react.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { n as Button, r as cn, t as AppShell } from "./app-shell-CQ7g93Be.mjs";
import { t as Input } from "./input-BszirhD1.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/portfolio-BlSBuQGH.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function PortfolioView() {
	const positions = useDesk((s) => s.positions);
	const closed = useDesk((s) => s.closed);
	const addPosition = useDesk((s) => s.addPosition);
	const sellPosition = useDesk((s) => s.sellPosition);
	const [adding, setAdding] = (0, import_react.useState)(false);
	const [confirmId, setConfirmId] = (0, import_react.useState)(null);
	const symbols = (0, import_react.useMemo)(() => positions.map((p) => p.symbol), [positions]);
	const quotes = useQuery({
		queryKey: [
			"quotes",
			"portfolio",
			symbols.join(",")
		],
		queryFn: () => getQuotes({ data: { symbols } }),
		enabled: symbols.length > 0,
		refetchInterval: 9e4
	});
	const bySym = (0, import_react.useMemo)(() => new Map((quotes.data ?? []).map((q) => [q.symbol, q])), [quotes.data]);
	const totals = (0, import_react.useMemo)(() => {
		let cost = 0;
		let value = 0;
		for (const p of positions) {
			const m = positionMetrics(p, bySym.get(p.symbol)?.price);
			cost += m.cost;
			value += m.value;
		}
		const pnl = value - cost;
		const pct = cost ? pnl / cost * 100 : 0;
		const realized = closed.reduce((a, t) => a + (t.exitPrice - t.avgPrice) * t.shares, 0);
		return {
			cost,
			value,
			pnl,
			pct,
			realized
		};
	}, [
		positions,
		bySym,
		closed
	]);
	const sectors = (0, import_react.useMemo)(() => {
		const map = /* @__PURE__ */ new Map();
		for (const p of positions) {
			const v = positionMetrics(p, bySym.get(p.symbol)?.price).value;
			map.set(p.sector, (map.get(p.sector) ?? 0) + v);
		}
		return [...map.entries()].sort((a, b) => b[1] - a[1]);
	}, [positions, bySym]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppShell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "saring-enter-2 mt-8",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-end justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs uppercase tracking-wide text-muted-foreground",
					children: "Tracker"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "font-display text-3xl tracking-tight",
					children: "Portofolio"
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					onClick: () => setAdding((v) => !v),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "size-4" }), "Tambah posisi"]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-6 grid gap-3 sm:grid-cols-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "Nilai pasar",
						value: positions.length ? formatIDR(totals.value) : "—"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "P/L terbuka",
						value: positions.length ? formatIDR(totals.pnl) : "—",
						tone: totals.pnl > 0 ? "up" : totals.pnl < 0 ? "down" : void 0,
						sub: positions.length ? formatPct(totals.pct) : void 0
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "Realized",
						value: closed.length ? formatIDR(totals.realized) : "—",
						tone: totals.realized > 0 ? "up" : totals.realized < 0 ? "down" : void 0
					})
				]
			}),
			adding ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AddForm, {
				onCancel: () => setAdding(false),
				onAdd: (row) => {
					addPosition(row);
					setAdding(false);
					toast.message(`${row.symbol} masuk portofolio`, { description: `${formatLots(row.shares)} @ ${formatPrice(row.avgPrice)}` });
				}
			}) : null,
			sectors.length > 1 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-6",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs uppercase tracking-wide text-muted-foreground",
						children: "Alokasi sektor"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-2 flex h-2 overflow-hidden rounded-full bg-secondary",
						children: sectors.map(([name, v], i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "h-full bg-foreground",
							style: {
								width: `${v / Math.max(1, totals.value) * 100}%`,
								opacity: 1 - i * .14
							},
							title: name
						}, name))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-2 flex flex-wrap gap-3 text-xs text-muted-foreground",
						children: sectors.map(([name, v]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
							name,
							" ",
							(v / Math.max(1, totals.value) * 100).toFixed(0),
							"%"
						] }, name))
					})
				]
			}) : null,
			positions.length === 0 && !adding ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-8 rounded-3xl bg-card px-5 py-8 shadow-[var(--shadow-border)] sm:px-8",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "font-display text-2xl tracking-tight",
					children: "Belum ada posisi."
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground",
					children: "Tambah manual, atau dari hasil screening buka emiten lalu ketuk Masuk portofolio. 1 lot = 100 lembar."
				})]
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "mt-6 space-y-2",
				children: positions.map((p) => {
					const q = bySym.get(p.symbol);
					const m = positionMetrics(p, q?.price);
					const up = m.pnl >= 0;
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "rounded-3xl bg-card px-4 py-4 shadow-[var(--shadow-border)] sm:px-5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-wrap items-start justify-between gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex flex-wrap items-center gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "font-medium tracking-tight",
									children: p.symbol
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-sm text-muted-foreground",
									children: p.name
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "mt-1 text-sm text-muted-foreground",
								children: [
									formatLots(p.shares),
									" · avg ",
									formatPrice(p.avgPrice),
									p.stop ? ` · stop ${formatPrice(p.stop)}` : "",
									p.target ? ` · target ${formatPrice(p.target)}` : ""
								]
							})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "text-right",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "font-mono text-lg tabular-nums",
									children: q ? formatPrice(q.price) : "—"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: cn("font-mono text-sm tabular-nums", up ? "text-up" : "text-down"),
									children: [
										formatIDR(m.pnl),
										" · ",
										formatPct(m.pct)
									]
								})]
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-3 flex flex-wrap items-center justify-between gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "text-xs text-muted-foreground",
								children: [
									"Nilai ",
									formatCompactIDR(m.value),
									" · modal ",
									formatCompactIDR(m.cost),
									q ? ` · ${formatPct(q.changePct)} hari ini` : ""
								]
							}), confirmId === p.id ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									size: "sm",
									variant: "subtle",
									onClick: () => {
										const px = q?.price ?? p.avgPrice;
										sellPosition(p.id, p.shares, px);
										setConfirmId(null);
										toast.message(`${p.symbol} terjual`, { description: `${formatLots(p.shares)} @ ${formatPrice(px)}` });
									},
									children: "Konfirmasi jual"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									size: "sm",
									variant: "ghost",
									onClick: () => setConfirmId(null),
									children: "Batal"
								})]
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								size: "sm",
								variant: "ghost",
								onClick: () => setConfirmId(p.id),
								children: "Jual"
							})]
						})]
					}, p.id);
				})
			}),
			closed.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-10",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs uppercase tracking-wide text-muted-foreground",
					children: "Riwayat jual"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "mt-3 space-y-2",
					children: closed.slice(0, 12).map((t) => {
						const pnl = (t.exitPrice - t.avgPrice) * t.shares;
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
							className: "flex items-baseline justify-between gap-3 rounded-2xl bg-secondary px-4 py-3 text-sm",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
								t.symbol,
								" · ",
								formatLots(t.shares)
							] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: cn("font-mono tabular-nums", pnl >= 0 ? "text-up" : "text-down"),
								children: formatIDR(pnl)
							})]
						}, t.id);
					})
				})]
			}) : null
		]
	}) });
}
function Stat({ label, value, sub, tone }) {
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
				className: "mt-1 font-mono text-xs text-muted-foreground",
				children: sub
			}) : null
		]
	});
}
function AddForm({ onCancel, onAdd }) {
	const [q, setQ] = (0, import_react.useState)("");
	const [lots, setLots] = (0, import_react.useState)("1");
	const [price, setPrice] = (0, import_react.useState)("");
	const [picked, setPicked] = (0, import_react.useState)(null);
	const matches = (0, import_react.useMemo)(() => {
		const s = q.trim().toUpperCase();
		if (s.length < 1) return [];
		return UNIVERSE.filter((u) => u.symbol.includes(s) || u.name.toUpperCase().includes(s)).slice(0, 6);
	}, [q]);
	const quoteMut = useMutation({
		mutationFn: (symbol) => getQuotes({ data: { symbols: [symbol] } }),
		onSuccess: (rows) => {
			const px = rows[0]?.price;
			if (px) setPrice(String(Math.round(px)));
		}
	});
	const choose = (u) => {
		setPicked(u);
		setQ(u.symbol);
		quoteMut.mutate(u.symbol);
	};
	const submit = () => {
		if (!picked) {
			toast.message("Pilih kode emiten dulu.");
			return;
		}
		const lotN = Number(lots);
		const px = Number(price);
		if (!Number.isFinite(lotN) || lotN <= 0) {
			toast.message("Lot tidak valid.");
			return;
		}
		if (!Number.isFinite(px) || px <= 0) {
			toast.message("Harga tidak valid.");
			return;
		}
		onAdd({
			symbol: picked.symbol,
			name: picked.name,
			sector: picked.sector,
			shares: lotN * 100,
			avgPrice: px
		});
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mt-6 rounded-3xl bg-card p-4 shadow-[var(--shadow-border)] sm:p-5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "font-display text-xl tracking-tight",
				children: "Posisi baru"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-4 grid gap-3 sm:grid-cols-[1fr_7rem_8rem_auto]",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "relative",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							value: q,
							onChange: (e) => {
								setQ(e.target.value);
								setPicked(null);
							},
							placeholder: "Kode atau nama",
							"aria-label": "Cari emiten",
							autoComplete: "off"
						}), matches.length && !picked ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
							className: "absolute z-10 mt-1 w-full overflow-hidden rounded-2xl bg-popover shadow-[var(--shadow-border)]",
							children: matches.map((u) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								className: "flex w-full items-baseline justify-between gap-2 px-4 py-2.5 text-left text-sm hover:bg-accent",
								onClick: () => choose(u),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "font-medium",
									children: u.symbol
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "truncate text-muted-foreground",
									children: u.name
								})]
							}) }, u.symbol))
						}) : null]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						type: "number",
						min: .01,
						step: 1,
						value: lots,
						onChange: (e) => setLots(e.target.value),
						"aria-label": "Lot",
						placeholder: "Lot"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						type: "number",
						min: 1,
						value: price,
						onChange: (e) => setPrice(e.target.value),
						"aria-label": "Harga rata-rata",
						placeholder: "Harga"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							onClick: submit,
							children: "Simpan"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "ghost",
							onClick: onCancel,
							children: "Batal"
						})]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 text-xs text-muted-foreground",
				children: "1 lot = 100 lembar. Harga terisi otomatis dari papan."
			})
		]
	});
}
var SplitComponent = PortfolioView;
//#endregion
export { SplitComponent as component };
