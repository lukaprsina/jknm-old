"use client"

import { useQuery } from "@tanstack/react-query"
import { MDXRemote } from "next-mdx-remote/rsc"
import { useRouteParams } from "next-typesafe-url/app";
import { custom_mdx_components } from "~/mdx-components"
import { read_article_safe } from "~/lib/query_helpers"
import { Route } from "./routeType";

export default function ClientArticle() {
    const routeParams = useRouteParams(Route.routeParams);

    const query = useQuery({
        queryKey: ["editor_article", routeParams.data?.novicka_name],
        queryFn: async () => await read_article_safe(routeParams.data?.novicka_name),
    })

    if (query.isPending) return <p>Loading...</p>
    if (query.isError) return <p>Error...</p>

    return <>
        {(query && query.data) ? <>
            <MDXRemote
                source={query.data.content}
                components={custom_mdx_components}
            />
        </>
            : <p>Article not found</p>}
    </>
}