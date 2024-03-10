import EditorClient from "./editor_client";
import { withParamValidation } from "next-typesafe-url/app/hoc";
import type { InferPagePropsType } from "next-typesafe-url";
import { Route, type RouteType } from "./routeType";
import { HydrationBoundary, QueryClient, dehydrate } from "@tanstack/react-query";
import { read_article } from "~/server/data_layer/articles";
import { ServerError } from "~/lib/server_error";

type PageProps = InferPagePropsType<RouteType>;

async function EditorServer({ routeParams }: PageProps) {
    const queryClient = new QueryClient()
    const article_url = decodeURIComponent(routeParams.article_url)

    await queryClient.prefetchQuery({
        queryKey: ["editor_article", article_url],
        queryFn: async () => {
            if (typeof article_url !== "string") return null

            const article = await read_article({ url: article_url })
            // console.log("read_article_safe", { article_url, article })
            if (!article.data || article.serverError || article.validationErrors)
                throw new ServerError("Zod error", { ...article })

            return article.data
        }
    })

    return (
        <HydrationBoundary state={(dehydrate(queryClient))}>
            <EditorClient />
        </HydrationBoundary>
    )
}


export default withParamValidation(EditorServer, Route);