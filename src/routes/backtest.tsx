import { createFileRoute } from "@tanstack/react-router";
import { BacktestView } from "@/components/screener/backtest-view";

export const Route = createFileRoute("/backtest")({
  component: BacktestView,
});
