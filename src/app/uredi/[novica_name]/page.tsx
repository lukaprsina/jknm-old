import EditorClient from "./editor_client";
import { withParamValidation } from "next-typesafe-url/app/hoc";
import type { InferPagePropsType } from "next-typesafe-url";
import { Route, type RouteType } from "./routeType";
import {
  HydrationBoundary,
  QueryClient,
  dehydrate,
} from "@tanstack/react-query";
import { get_article_by_url } from "~/server/articles";
import { ServerError } from "~/lib/server_error";

type PageProps = InferPagePropsType<RouteType>;

async function EditorServer({ routeParams }: PageProps) {
  const queryClient = new QueryClient();
  const novica_name = decodeURIComponent(routeParams.novica_name);

  await queryClient.prefetchQuery({
    queryKey: ["editor_article", novica_name],
    queryFn: async () => {
      if (typeof novica_name !== "string") return null;

      const article = await get_article_by_url({ url: novica_name });
      // console.log("read_article_safe", { novica_name, article })
      if (!article.data || article.serverError || article.validationErrors)
        throw new ServerError("Zod error", { ...article });

      return article.data;
    },
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <EditorClient />
    </HydrationBoundary>
  );
}

export default withParamValidation(EditorServer, Route);
