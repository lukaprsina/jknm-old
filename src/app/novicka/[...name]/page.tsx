import path from "path"
import { read_article } from "~/app/actions"
import { useMemo } from "react"
import { MDXRemote } from "next-mdx-remote/rsc"
import { custom_mdx_components } from "src/mdx-components"
import { type Metadata } from "next"

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
    const response = await useMemo(async () => {
        const pathname = path.join(...params.name)
        console.error("READING FROM ARTICLE PAGE", pathname)
        const response = await read_article({ url: decodeURIComponent(pathname) })
        return response
    }, [params.name]);

    return <div className="container">
        {(response.data) ? <>
            <MDXRemote
                source={response.data.content}
                components={custom_mdx_components}
            />
        </>
            : <p>Not found</p>}
    </div>

}