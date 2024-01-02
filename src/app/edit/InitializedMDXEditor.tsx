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
import { Box, Button, Flex, TextInput } from "@mantine/core";
import { useRouter, useSearchParams } from "next/navigation";
import useForwardedRef from "~/lib/useForwardedRef";
import type { EditorPropsJoined } from "./EditorClient";
import path from "path";

const imageUploadHandler = async (image: File, pathname?: string): Promise<string> => {
    if (typeof pathname == "undefined") throw new Error("No pathname")

    const form = new FormData()
    form.append("file", image)
    form.append("pathname", pathname)

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

const allPlugins = (diffMarkdown: string, pathname?: string) => [
    toolbarPlugin({ toolbarContents: () => <Toolbar /> }),
    listsPlugin(),
    quotePlugin(),
    headingsPlugin(),
    linkPlugin(),
    linkDialogPlugin(),
    imagePlugin({ imageUploadHandler: (image) => imageUploadHandler(image, pathname) }),
    tablePlugin(),
    thematicBreakPlugin(),
    frontmatterPlugin(),
    directivesPlugin({ directiveDescriptors: [AdmonitionDirectiveDescriptor] }),
    diffSourcePlugin({ viewMode: 'rich-text', diffMarkdown }),
    markdownShortcutPlugin(),
]

export default function InitializedMDXEditor({
    editorRef,
    article,
    markdown,
    save_article,
    ...props
}: { editorRef: ForwardedRef<MDXEditorMethods> | null } & EditorPropsJoined<MDXEditorProps>) {
    const [title, setTitle] = useState<string>("")
    const [pathname, setPathname] = useState<string>("")
    const innerRef = useForwardedRef(editorRef);
    const search_params = useSearchParams()
    const router = useRouter()

    useEffect(() => {
        if (!article) return
        setPathname(path.dirname(article.pathname))
        setTitle(article.title)
        innerRef.current?.setMarkdown(article.content)
    }, [article])

    return <>
        <Flex align="flex-end" columnGap="md">
            <TextInput
                label="Pathname"
                w={200}
                value={pathname}
                onChange={(event) => setPathname(event.currentTarget.value)}
            />
            <TextInput
                label="Title"
                w={200}
                value={title}
                onChange={(event) => setTitle(event.currentTarget.value)}
            />
            <Button
                onClick={async () => {
                    if (!pathname || !innerRef.current || !article) return

                    const result = await save_article({
                        id: article.id,
                        pathname,
                        title,
                        content: innerRef.current.getMarkdown(),
                    })

                    console.log("saved", result)
                    if (result.data)
                        router.push(`/article/${result.data}`)
                }}
            >
                Save
            </Button>
        </Flex>

        <Box style={{ marginTop: "2.25rem", height: "100%", border: "1px solid black" }}>
            <MDXEditor
                plugins={allPlugins(markdown ?? "", search_params.get("pathname") ?? undefined)}
                {...props}
                markdown={markdown ?? ""}
                contentEditableClassName="prose max-w-full"
                ref={editorRef}
            />
        </Box>
    </>

}