import { type RouteType as Route_0 } from "~/app/isci/[search_string]/routeType";
import { type RouteType as Route_1 } from "~/app/novicka/[novicka_name]/routeType";
import { type RouteType as Route_2 } from "~/app/uredi/[article_url]/routeType";
import type { InferRoute, StaticRoute } from "next-typesafe-url";

declare module "@@@next-typesafe-url" {

  interface DynamicRouter {
    "/isci/[search_string]": InferRoute<Route_0>;
    "/novicka/[novicka_name]": InferRoute<Route_1>;
    "/uredi/[article_url]": InferRoute<Route_2>;
  }

  interface StaticRouter {
    "/": StaticRoute;
    "/racun": StaticRoute;
    "/testing": StaticRoute;
  }
}