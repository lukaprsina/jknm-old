"use server"

import { read_article } from "~/app/actions"
import { MDXRemote } from "next-mdx-remote/rsc"
import { custom_mdx_components } from "src/mdx-components"
import { type Metadata } from "next"
import ResponsiveShell from "~/app/responsive_shell"
import { getServerAuthSession } from "~/server/auth"
import type { InferPagePropsType } from "next-typesafe-url";
import { Route, type RouteType } from "./routeType";
import { withParamValidation } from "next-typesafe-url/app/hoc"

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
    const article = await read_article({ url: routeParams.novicka_name })

    return (
        <ResponsiveShell editable={true} user={session?.user}>
            <div className="prose lg:prose-lg dark:prose-invert container">
                {(article.data) ? <>
                    <MDXRemote
                        source={article.data.content}
                        components={custom_mdx_components}
                    />
                </>
                    : <p>Not found</p>}
            </div>
        </ResponsiveShell>
    )
}

export default withParamValidation(Article, Route)