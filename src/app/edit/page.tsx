import { read_article } from "../actions";
import EditorClient from "./EditorClient";
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

        const pathname = searchParams.pathname ?? ''
        if (typeof pathname !== "string") return
        console.error("READING FROM EDITOR SERVER")
        const response = await read_article({ pathname })
        return response.data
    }, [searchParams?.pathname]);

    return (
        <EditorClient article={article} save_article={save_article} />
    )
}