import { read_article } from "~/server/data_layer/articles"
import { read_article_safe } from "~/lib/query_helpers"
import { type Metadata } from "next"
import ResponsiveShell from "~/components/responsive_shell"
import { getServerAuthSession } from "~/server/auth"
import type { InferPagePropsType } from "next-typesafe-url";
import { Route, type RouteType } from "./routeType";
import { withParamValidation } from "next-typesafe-url/app/hoc"
import { HydrationBoundary, QueryClient, dehydrate, useQuery } from "@tanstack/react-query"
import ClientArticle from "./client"

type PageProps = InferPagePropsType<RouteType>;

type ArticleType = {
    params: { novicka_name: string }
}

// TODO: maybe search params do better, because react_devtools_backend_compact.js.map
// and other junk ddoses server 
export async function generateMetadata(
    { params }: ArticleType,
): Promise<Metadata> {
    const response = await read_article({ url: params.novicka_name })
    return {
        title: response.data?.title
    }
}

async function Article({ routeParams }: PageProps) {
    const session = await getServerAuthSession()
    const queryClient = new QueryClient()

    queryClient.prefetchQuery({
        queryKey: ["editor_article", routeParams.novicka_name],
        queryFn: async () => await read_article_safe(routeParams.novicka_name),
    })
    // const article = await read_article({ url: routeParams.novicka_name })    

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <ResponsiveShell editable={true} user={session?.user}>
                <div className="prose lg:prose-lg dark:prose-invert container">
                    <ClientArticle />
                </div>
            </ResponsiveShell>
        </HydrationBoundary>
    )
}

export default withParamValidation(Article, Route)