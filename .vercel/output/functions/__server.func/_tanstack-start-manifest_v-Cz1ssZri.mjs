//#region node_modules/.nitro/vite/services/ssr/assets/_tanstack-start-manifest_v-Cz1ssZri.js
var tsrStartManifest = () => ({ routes: {
	__root__: {
		filePath: "/workspace/src/routes/__root.tsx",
		children: [
			"/",
			"/backtest",
			"/portfolio"
		],
		preloads: ["/assets/index-uhTr30yH.js"],
		scripts: [{ attrs: {
			type: "module",
			async: !0,
			src: "/assets/index-uhTr30yH.js"
		} }]
	},
	"/": {
		filePath: "/workspace/src/routes/index.tsx",
		children: void 0,
		preloads: [
			"/assets/routes-JFJrLEBs.js",
			"/assets/universe-CuG-yWG0.js",
			"/assets/sectors-DXwuk9xu.js"
		]
	},
	"/backtest": {
		filePath: "/workspace/src/routes/backtest.tsx",
		children: void 0,
		preloads: [
			"/assets/backtest-BIcSRO_o.js",
			"/assets/universe-CuG-yWG0.js",
			"/assets/sectors-DXwuk9xu.js"
		]
	},
	"/portfolio": {
		filePath: "/workspace/src/routes/portfolio.tsx",
		children: void 0,
		preloads: ["/assets/portfolio-CqBP0tim.js", "/assets/universe-CuG-yWG0.js"]
	}
} });
//#endregion
export { tsrStartManifest };
