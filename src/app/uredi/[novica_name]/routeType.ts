import { type DynamicRoute } from "next-typesafe-url";
import { z } from "zod";

export const Route = {
  routeParams: z.object({
    novica_name: z.string(),
  }),
  searchParams: z.object({
    nastavitve: z.boolean().optional(),
  }),
} satisfies DynamicRoute;
export type RouteType = typeof Route;
