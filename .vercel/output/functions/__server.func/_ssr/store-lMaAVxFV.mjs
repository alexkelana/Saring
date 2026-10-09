import { i as require_jsx_runtime } from "../_libs/react+tanstack__react-query.mjs";
import { n as create, t as persist } from "../_libs/zustand.mjs";
import { t as cva } from "../_libs/class-variance-authority+clsx.mjs";
import { i as cn } from "./input-DVtXPBQL.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/store-lMaAVxFV.js
var import_jsx_runtime = require_jsx_runtime();
var badgeVariants = cva("inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium tracking-wide uppercase", {
	variants: { variant: {
		default: "bg-secondary text-muted-foreground",
		beli: "bg-up/15 text-up",
		pertimbangkan: "bg-warn/15 text-warn",
		tunggu: "bg-secondary text-muted-foreground",
		up: "bg-up/15 text-up",
		down: "bg-down/15 text-down"
	} },
	defaultVariants: { variant: "default" }
});
function Badge({ className, variant, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: cn(badgeVariants({ variant }), className),
		...props
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
	radar: null,
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
		verdictFilter: "all",
		radar: result ? {
			strategy: result.strategy,
			rows: result.results.map((r) => ({
				symbol: r.symbol,
				name: r.name,
				verdict: r.verdict
			}))
		} : get().radar
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
		strategy: s.strategy,
		radar: s.radar
	})
}));
//#endregion
export { useScreener as n, Badge as t };
