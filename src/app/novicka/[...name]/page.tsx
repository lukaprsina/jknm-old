import path from "path"
import { read_article } from "~/app/actions"
import { MDXRemote } from "next-mdx-remote/rsc"
import { custom_mdx_components } from "src/mdx-components"
import { type Metadata } from "next"
import ResponsiveShell from "~/app/responsive_shell"
import { getServerAuthSession } from "~/server/auth"

type ArticleType = {
    params: { name: string[] }
}

export async function generateMetadata(
    { params }: ArticleType,
): Promise<Metadata> {
    const pathname = path.join(...params.name)
    const response = await read_article({ url: decodeURIComponent(pathname) })
    return {
        title: response.data?.title
    }
}

export default async function Article({ params }: ArticleType) {
    const session = await getServerAuthSession()
    const pathname = path.join(...params.name)
    const article = await read_article({ url: decodeURIComponent(pathname) })

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