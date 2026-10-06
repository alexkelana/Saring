import { i as require_jsx_runtime } from "../_libs/react+tanstack__react-query.mjs";
import { t as cva } from "../_libs/class-variance-authority+clsx.mjs";
import { r as cn } from "./app-shell-CQ7g93Be.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/badge-Bov-DEDP.js
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
//#endregion
export { Badge as t };
