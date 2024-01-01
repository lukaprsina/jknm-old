import { Box, Title } from "@mantine/core"
import path from "path"
import { read_article } from "~/app/actions"

type ArticleType = {
    params: { name: string[] }
}

export default async function Article({ params }: ArticleType) {
    async function get_content() {
        const data = await read_article({ pathname: path.join(...params.name) })
        return data
    }

    const content = await get_content()

    return <>
        {(content.data) ? <Box>
            <Title >{content.data.title}</Title>
            <Box
                dangerouslySetInnerHTML={{ __html: content.data.content ?? "Not loaded" }}
            />
        </Box> :
            <p>Not found</p>}
    </>
}