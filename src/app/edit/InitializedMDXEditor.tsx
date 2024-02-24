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
    // } from '@mdxeditor/editor'
    // } from '@lukaprsina/mdxeditor'
} from 'modified-editor'
import { Toolbar } from "./Toolbar";
import { Box, Button, Checkbox, Flex, TextInput } from "@mantine/core";
import { useRouter, useSearchParams } from "next/navigation";
import useForwardedRef from "~/lib/useForwardedRef";
import type { EditorPropsJoined } from "./EditorClient";
import { sanitize_for_fs } from "~/lib/fs";
import { fromMarkdown } from "mdast-util-from-markdown"
import { toMarkdown } from "mdast-util-to-markdown"
import type { Parent, Code } from "mdast";
import path from "path";
import Link from "next/link";

const imageUploadHandler = async (image: File, url?: string): Promise<string | undefined> => {
    if (!image) throw new Error("No image");
    if (typeof url == "undefined") throw new Error("No url")

    const form = new FormData()
    form.append("file", image)
    form.append("url", url)

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

const allPlugins = (diffMarkdown: string, url?: string) => [
    toolbarPlugin({ toolbarContents: () => <Toolbar /> }),
    listsPlugin(),
    quotePlugin(),
    headingsPlugin(),
    linkPlugin(),
    linkDialogPlugin(),
    imagePlugin({ imageUploadHandler: (image) => imageUploadHandler(image, url) }),
    tablePlugin(),
    thematicBreakPlugin(),
    frontmatterPlugin(),
    directivesPlugin({ directiveDescriptors: [AdmonitionDirectiveDescriptor] }),
    diffSourcePlugin({ viewMode: 'rich-text', diffMarkdown }),
    markdownShortcutPlugin(),
]

function change_url(current_url: string, previous_url: string) {
    if (!previous_url.startsWith("/fs/")) return previous_url
    const name = path.basename(previous_url)
    return path.join("/fs/", current_url, name)
}

export default function InitializedMDXEditor({
    editorRef,
    article,
    markdown,
    save_article,
    ...props
}: { editorRef: ForwardedRef<MDXEditorMethods> | null } & EditorPropsJoined<MDXEditorProps>) {
    const [title, setTitle] = useState<string>("")
    const [url, setUrl] = useState<string>("")
    const [published, setPublished] = useState<boolean>(false)
    const innerRef = useForwardedRef(editorRef);
    const search_params = useSearchParams()
    const router = useRouter()

    useEffect(() => {
        if (!article) return
        setUrl(article.url)
        setTitle(article.title)
        console.log("setting markdown", article)
        innerRef.current?.setMarkdown(article.content)
    }, [article])

    useEffect(() => {
        setUrl(sanitize_for_fs(title))
    }, [title])

    const rename_images = (current_url: string) => {
        const markdown = innerRef.current?.getMarkdown()
        if (!markdown) return
        console.log(markdown, fromMarkdown)
        const tree = fromMarkdown(markdown, {})

        function traverse_tree(node: Parent | Code) {
            if (node.type === "code") {
                return;
            }
            node = node as Parent

            for (const child of node.children) {
                if (child.type == "image") {
                    child.url = change_url(current_url, child.url)
                    console.log("image found", child)
                }

                if (Object.keys(child).includes("children")) {
                    traverse_tree(child as Parent);
                }
            }
        }

        traverse_tree(tree)

        return toMarkdown(tree, {})
    }

    return <>
        <Flex align="flex-end" columnGap="md">
            <TextInput
                label="Url"
                disabled
                w={200}
                value={url}
                onChange={(event) => setUrl(event.currentTarget.value)}
            />
            <TextInput
                label="Title"
                w={200}
                value={title}
                onChange={(event) => setTitle(event.currentTarget.value)}
            />
            <Button
                className="prose"
                onClick={async () => {
                    if (!url || !innerRef.current || !article) return

                    const content = rename_images(url)
                    const result = await save_article({
                        id: article.id,
                        url,
                        title,
                        content,
                        published
                    })

                    console.log("saved", result)

                    if (!result.serverError && !result.validationErrors) {
                        router.push(`/edit?url=${url}`)
                    }
                }}
            >
                Save
            </Button>
            <Checkbox
                checked={published}
                onChange={(event) => setPublished(event.currentTarget.checked)}
                label="Published"
            />
            <Link
                href={`/novicka/${search_params.get("url") ?? ""}`}
                target="_blank"
            >
                View page
            </Link>
        </Flex>

        <Box style={{ marginTop: "2.25rem", border: "1px solid black" }}>
            <MDXEditor
                plugins={allPlugins(markdown ?? "", search_params.get("url") ?? undefined)}
                {...props}
                markdown={markdown ?? ""}
                className=""
                contentEditableClassName="prose lg:prose-xl max-w-full"
                ref={editorRef}
            />
        </Box>
        <Box style={{ height: "70px" }} />
    </>

}