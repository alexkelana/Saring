import { createFileRoute } from "@tanstack/react-router";
import { PortfolioView } from "@/components/screener/portfolio-view";

export const Route = createFileRoute("/portfolio")({
  component: PortfolioView,
});
