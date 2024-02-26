import { read_article } from "../actions";
import EditorClient from "./editor_client";
import { save_article } from "../actions";
import { useMemo } from "react";

type EditorServerProps = {
    params: { slug: string };
    searchParams?: Record<string, string | string[] | undefined>;
};

export default async function EditorServer({ searchParams }: EditorServerProps) {
    // TODO: triggers too early
    const article = await useMemo(async () => {
        if (!searchParams) return

        const url = searchParams.url ?? ''
        if (typeof url !== "string") return
        console.error("READING FROM EDITOR SERVER")
        const decoded = decodeURIComponent(url)
        const response = await read_article({ url: decoded })
        return response.data
    }, [searchParams?.url]);

    return (
        <EditorClient article={article} save_article={save_article} />
    )
}