import { type DynamicRoute } from "next-typesafe-url";
import { z } from "zod";

export const Route = {
  routeParams: z.object({
    novicka_name: z.string(),
  }),
} satisfies DynamicRoute;

export type RouteType = typeof Route;
