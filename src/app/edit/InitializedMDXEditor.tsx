"use client"

import { useEffect, type ForwardedRef, useState } from "react";
import {
    MDXEditor,
    toolbarPlugin,
    listsPlugin,
    quotePlugin,
    headingsPlugin,
    linkPlugin,
    linkDialogPlugin,
    imagePlugin,
    tablePlugin,
    thematicBreakPlugin,
    frontmatterPlugin,
    directivesPlugin,
    AdmonitionDirectiveDescriptor,
    diffSourcePlugin,
    markdownShortcutPlugin,
    type MDXEditorMethods,
    type MDXEditorProps,
} from '@mdxeditor/editor'
import { Toolbar } from "./Toolbar";
import { Box, Button, TextInput } from "@mantine/core";
import { useSearchParams } from "next/navigation";
import { create_or_update_article, create_temporary, read_article } from "../actions";
import type { Article } from "@prisma/client";
import useForwardedRef from "~/lib/useForwardedRef";

const imageUploadHandler = async (image: File): Promise<string> => {
    console.log(image.name)
    const form = new FormData()
    form.append("file", image)

    const image_response = await fetch("/api/file", {
        method: "POST",
        body: form,
    })

    if (image_response.ok) {
        const image_json = await image_response.json() as { location: string }

        return image_json.location
    } else {
        throw new Error("Failed to upload image")
    }
}

const allPlugins = (diffMarkdown: string) => [
    toolbarPlugin({ toolbarContents: () => <Toolbar /> }),
    listsPlugin(),
    quotePlugin(),
    headingsPlugin(),
    linkPlugin(),
    linkDialogPlugin(),
    imagePlugin({ imageUploadHandler }),
    tablePlugin(),
    thematicBreakPlugin(),
    frontmatterPlugin(),
    directivesPlugin({ directiveDescriptors: [AdmonitionDirectiveDescriptor] }),
    diffSourcePlugin({ viewMode: 'rich-text', diffMarkdown }),
    markdownShortcutPlugin(),
]

export default function InitializedMDXEditor({
    editorRef,
    ...props
}: { editorRef: ForwardedRef<MDXEditorMethods> | null } & MDXEditorProps) {
    const search_params = useSearchParams()
    const [article, setArticle] = useState<Article | undefined>()
    const [title, setTitle] = useState<string>("")
    const innerRef = useForwardedRef(editorRef);

    useEffect(() => {
        const create_and_set = async () => {
            const response = await create_temporary({})
            setArticle(response.data)
        }

        const read_and_set = async (input: {
            pathname: string;
        }) => {
            const response = await read_article(input)
            setArticle(response.data)
        }

        if (search_params.get("action") === "create") {
            void create_and_set()
        } else if (search_params.get("action") === "edit") {
            const pathname = search_params.get("pathname")
            if (!pathname) return
            void read_and_set({ pathname })
        }
    }, [])

    useEffect(() => {
        console.log({ article })
        if (article?.title)
            setTitle(article.title)
    })

    return <>
        <TextInput
            label="Title"
            w={500}
            value={title}
            onChange={(event) => setTitle(event.currentTarget.value)}
        />
        <Button
            onClick={async () => {
                const pathname = search_params.get("pathname")

                console.log(innerRef)
                if (!pathname || !innerRef.current) return


                const result = await create_or_update_article({
                    pathname,
                    title,
                    content: innerRef.current.getMarkdown(),
                })
                console.log(result)
            }}
        >
            Save
        </Button>
        <Box style={{ marginTop: "2.25rem" }}>
            <MDXEditor
                plugins={allPlugins(props.markdown)}
                {...props}
                contentEditableClassName="prose max-w-full"
                ref={editorRef}
            />
        </Box>
    </>

}