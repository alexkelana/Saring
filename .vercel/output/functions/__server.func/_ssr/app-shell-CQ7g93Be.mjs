import { i as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { m as useRouterState, x as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { i as require_jsx_runtime, n as useQuery } from "../_libs/react+tanstack__react-query.mjs";
import { c as formatPrice, h as useDesk, i as formatJakarta, s as formatPct, u as getMarketOverview } from "./format-CtGhOwOb.mjs";
import { c as Bell } from "../_libs/lucide-react.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { t as Slot } from "../_libs/radix-ui__react-slot.mjs";
import { n as clsx, t as cva } from "../_libs/class-variance-authority+clsx.mjs";
import { t as twMerge } from "../_libs/tailwind-merge.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/app-shell-CQ7g93Be.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function cn(...inputs) {
	return twMerge(clsx(inputs));
}
var buttonVariants = cva("inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-medium transition-[background-color,color,box-shadow,transform,opacity] duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/70 disabled:pointer-events-none disabled:opacity-40 active:not-disabled:scale-[0.96] [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0", {
	variants: {
		variant: {
			default: "bg-primary text-primary-foreground hover:bg-primary/90",
			outline: "bg-transparent text-foreground shadow-[var(--shadow-border)] hover:shadow-[var(--shadow-border-hover)] hover:bg-accent",
			ghost: "bg-transparent text-muted-foreground hover:bg-accent hover:text-foreground",
			subtle: "bg-secondary text-secondary-foreground hover:bg-accent"
		},
		size: {
			default: "h-11 px-5",
			sm: "h-9 px-3.5 text-[13px]",
			lg: "h-12 px-6",
			icon: "size-11"
		}
	},
	defaultVariants: {
		variant: "default",
		size: "default"
	}
});
function Button({ className, variant, size, asChild = false, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(asChild ? Slot : "button", {
		className: cn(buttonVariants({
			variant,
			size,
			className
		})),
		...props
	});
}
var KIND_LABEL = {
	above: "di atas",
	below: "di bawah",
	change: "gerak ≥"
};
function NoticeBell() {
	const [open, setOpen] = (0, import_react.useState)(false);
	const [tab, setTab] = (0, import_react.useState)("inbox");
	const notices = useDesk((s) => s.notices);
	const alerts = useDesk((s) => s.alerts);
	const screenPing = useDesk((s) => s.screenPing);
	const unread = (0, import_react.useMemo)(() => notices.filter((n) => !n.read).length, [notices]);
	const markAllRead = useDesk((s) => s.markAllRead);
	const markRead = useDesk((s) => s.markRead);
	const clearNotices = useDesk((s) => s.clearNotices);
	const removeAlert = useDesk((s) => s.removeAlert);
	const toggleAlert = useDesk((s) => s.toggleAlert);
	const setScreenPing = useDesk((s) => s.setScreenPing);
	const requestPush = async () => {
		if (typeof Notification === "undefined") {
			toast.message("Browser ini tidak mendukung notifikasi sistem.");
			return;
		}
		const perm = await Notification.requestPermission();
		toast.message(perm === "granted" ? "Notifikasi browser aktif." : "Izin notifikasi ditolak.");
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
		type: "button",
		onClick: () => {
			setOpen((v) => !v);
			if (!open) setTab("inbox");
		},
		className: "relative grid size-11 place-items-center rounded-full bg-card text-foreground shadow-[var(--shadow-border)] hover:shadow-[var(--shadow-border-hover)]",
		"aria-label": unread ? `${unread} notifikasi belum dibaca` : "Notifikasi",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bell, { className: "size-4" }), unread > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "absolute top-2 right-2 size-2 rounded-full bg-up" }) : null]
	}), open ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
		type: "button",
		className: "fixed inset-0 z-40 bg-background/70",
		"aria-label": "Tutup notifikasi",
		onClick: () => setOpen(false)
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "fixed inset-x-3 top-20 z-50 max-h-[min(72vh,36rem)] overflow-y-auto rounded-3xl bg-card p-4 shadow-[var(--shadow-border)] sm:inset-x-auto sm:right-6 sm:w-[24rem]",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center justify-between gap-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "font-display text-xl tracking-tight",
				children: "Notifikasi"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex gap-1",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					className: cn("h-9 rounded-full px-3 text-sm", tab === "inbox" ? "bg-primary text-primary-foreground" : "text-muted-foreground"),
					onClick: () => setTab("inbox"),
					children: "Kotak"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					className: cn("h-9 rounded-full px-3 text-sm", tab === "alerts" ? "bg-primary text-primary-foreground" : "text-muted-foreground"),
					onClick: () => setTab("alerts"),
					children: "Alert"
				})]
			})]
		}), tab === "inbox" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-4 space-y-3",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap gap-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "ghost",
							size: "sm",
							onClick: markAllRead,
							disabled: !unread,
							children: "Tandai dibaca"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "ghost",
							size: "sm",
							onClick: clearNotices,
							disabled: !notices.length,
							children: "Hapus"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "ghost",
							size: "sm",
							onClick: () => void requestPush(),
							children: "Izin browser"
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
					className: "flex items-center justify-between gap-3 rounded-2xl bg-secondary px-3 py-2.5 text-sm",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Beritahu hasil screening beli" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						type: "checkbox",
						checked: screenPing,
						onChange: (e) => setScreenPing(e.target.checked),
						className: "size-4 accent-primary"
					})]
				}),
				notices.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "py-8 text-sm text-muted-foreground",
					children: "Belum ada notifikasi. Pasang alert harga, atau jalankan screening."
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "space-y-2",
					children: notices.map((n) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						className: cn("w-full rounded-2xl px-3 py-3 text-left shadow-[var(--shadow-border)]", n.read ? "bg-secondary/60" : "bg-accent"),
						onClick: () => markRead(n.id),
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm font-medium",
								children: n.title
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1 text-sm leading-relaxed text-muted-foreground",
								children: n.body
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1 font-mono text-xs text-muted-foreground",
								children: formatJakarta(n.at)
							})
						]
					}) }, n.id))
				})
			]
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-4 space-y-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted-foreground",
				children: "Alert dipantau saat app terbuka. Dari detail saham, pasang alert di target atau stop."
			}), alerts.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "py-8 text-sm text-muted-foreground",
				children: "Belum ada alert harga."
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "space-y-2",
				children: alerts.map((a) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "flex items-center gap-2 rounded-2xl bg-secondary px-3 py-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "min-w-0 flex-1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "font-medium",
								children: a.symbol
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "text-sm text-muted-foreground",
								children: [
									KIND_LABEL[a.kind],
									" ",
									a.kind === "change" ? `${a.value}%` : formatPrice(a.value)
								]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							className: cn("h-9 rounded-full px-3 text-sm", a.enabled ? "bg-up/15 text-up" : "text-muted-foreground"),
							onClick: () => toggleAlert(a.id),
							children: a.enabled ? "On" : "Off"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							className: "h-9 rounded-full px-3 text-sm text-muted-foreground hover:text-foreground",
							onClick: () => removeAlert(a.id),
							children: "Hapus"
						})
					]
				}, a.id))
			})]
		})]
	})] }) : null] });
}
var NAV = [
	{
		to: "/",
		label: "Saring",
		exact: true
	},
	{
		to: "/portfolio",
		label: "Portofolio",
		exact: false
	},
	{
		to: "/backtest",
		label: "Backtest",
		exact: false
	}
];
function AppShell({ children, market }) {
	const snap = useQuery({
		queryKey: ["ihsg"],
		queryFn: () => getMarketOverview(),
		initialData: market,
		refetchInterval: 9e4
	}).data;
	const pathname = useRouterState({ select: (s) => s.location.pathname });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "relative mx-auto min-h-dvh w-full max-w-[1320px] px-4 pb-16 pt-5 sm:px-6 lg:px-8",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
			className: "saring-enter flex flex-col gap-4",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs font-medium uppercase tracking-[0.22em] text-muted-foreground",
					children: "Screener saham BEI"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "mt-1 font-display text-4xl italic leading-none tracking-tight sm:text-5xl",
					children: "saring"
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NoticeBell, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MarketChip, {
						price: snap?.price,
						changePct: snap?.changePct,
						statusLabel: snap?.statusLabel,
						asOf: snap?.asOf
					})]
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
				className: "flex flex-wrap items-center gap-1.5",
				"aria-label": "Bagian aplikasi",
				children: NAV.map((item) => {
					const active = item.exact ? pathname === item.to : pathname === item.to || pathname.startsWith(`${item.to}/`);
					return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: item.to,
						className: cn("inline-flex h-11 items-center rounded-full px-4 text-sm transition-[background-color,color] duration-150", active ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"),
						children: item.label
					}, item.to);
				})
			})]
		}), children]
	});
}
function MarketChip({ price, changePct, statusLabel, asOf }) {
	const up = (changePct ?? 0) >= 0;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-2xl bg-card px-4 py-3 shadow-[var(--shadow-border)]",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-baseline gap-2",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-xs uppercase tracking-wide text-muted-foreground",
					children: "IHSG"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "font-mono text-lg tabular-nums",
					children: price ? formatPrice(price) : "—"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: cn("font-mono text-sm tabular-nums", up ? "text-up" : "text-down"),
					children: changePct != null ? formatPct(changePct) : ""
				})
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
			className: "mt-0.5 text-xs text-muted-foreground",
			children: [statusLabel ?? "Memuat", asOf ? ` · ${formatJakarta(asOf)}` : ""]
		})]
	});
}
//#endregion
export { Button as n, cn as r, AppShell as t };
