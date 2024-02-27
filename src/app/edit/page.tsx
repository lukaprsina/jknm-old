import { read_article } from "../actions";
import EditorClient from "./editor_client";

type EditorServerProps = {
    params: { slug: string };
    searchParams?: Record<string, string | string[] | undefined>;
};

export default async function EditorServer({ searchParams }: EditorServerProps) {
    const url = searchParams?.url

    if (typeof url !== "string") return (
        <div>Not found</div>
    )

    const decoded = decodeURIComponent(url)
    const response = await read_article({ url: decoded })

    return (
        <EditorClient article={response.data} />
    )

}