import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { runScreening } from "./screen";
import { fetchIhsg } from "./yahoo";

const strategySchema = z.enum(["intraday", "swing", "invest"]);

export const getMarketOverview = createServerFn({ method: "GET" }).handler(async () => {
  return fetchIhsg();
});

export const runScreen = createServerFn({ method: "POST" })
  .validator((input: unknown) =>
    z
      .object({
        strategy: strategySchema,
        sector: z.string().optional(),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    return runScreening(data);
  });
