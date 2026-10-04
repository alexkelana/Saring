import { createFileRoute } from "@tanstack/react-router";
import { HomeView } from "@/components/screener/home-view";
import { getMarketOverview } from "@/lib/screener/actions";

export const Route = createFileRoute("/")({
  loader: () => getMarketOverview(),
  component: Home,
});

function Home() {
  const market = Route.useLoaderData();
  return <HomeView initialMarket={market} />;
}
