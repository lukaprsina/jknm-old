import { read_article } from "../actions";
import EditorClient from "./EditorClient";
import { save_article } from "../actions";

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

    return (
        <EditorClient article={article} save_article={save_article} />
    )
}