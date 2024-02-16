import { Box, Title } from "@mantine/core"
import path from "path"
import { read_article } from "~/app/actions"
import CachedMDX from "./CachedMDX"
import { useMemo } from "react"

type ArticleType = {
    params: { name: string[] }
}

export default async function Article({ params }: ArticleType) {
    const response = await useMemo(async () => {
        console.error("READING FROM ARTICLE PAGE")
        const response = await read_article({ pathname: path.join(...params.name) })
        return response
    }, [params.name]);

    return <>
        {(response.data) ? <Box className="prose lg:prose-xl">
            <Title >{response.data.title}</Title>
            {response.data.cached ?
                <>
                    <small>cached</small>
                    <CachedMDX content={response.data.cached} />
                </> :
                <Box
                    dangerouslySetInnerHTML={{ __html: response.data.content ?? "Not loaded" }}
                />
            }
        </Box> :
            <p>Not found</p>}
    </>
}