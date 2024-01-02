import { read_article } from "../actions";
import EditorClient from "./EditorClient";

type EditorServerProps = {
    params: { slug: string };
    searchParams?: Record<string, string | string[] | undefined>;
};

export default async function EditorServer({ searchParams }: EditorServerProps) {
    async function get_article() {
        if (!searchParams) return

        const pathname = searchParams.pathname ?? ''
        if (typeof pathname !== "string") return
        const response = await read_article({ pathname })
        return response.data
    }

    const article = await get_article();

    console.log("from server", article?.id)

    return (
        <EditorClient article={article} />
    )
}