import EditorClient from "./editor_client";
import { withParamValidation } from "next-typesafe-url/app/hoc";
import type { InferPagePropsType } from "next-typesafe-url";
import { Route, type RouteType } from "./routeType";
import { HydrationBoundary, QueryClient, dehydrate } from "@tanstack/react-query";
import { read_article_safe } from "~/lib/query_helpers";

type PageProps = InferPagePropsType<RouteType>;

async function EditorServer({ routeParams }: PageProps) {
    const queryClient = new QueryClient()

    await queryClient.prefetchQuery({
        queryKey: ["editor_article", routeParams.article_url],
        queryFn: async () => await read_article_safe(routeParams.article_url),
    })

    return (
        <HydrationBoundary state={(dehydrate(queryClient))}>
            <EditorClient />
        </HydrationBoundary>
    )
}


export default withParamValidation(EditorServer, Route);