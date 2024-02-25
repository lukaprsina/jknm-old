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
import { useRouter, useSearchParams } from "next/navigation";
import useForwardedRef from "~/lib/useForwardedRef";
import type { EditorPropsJoined } from "./EditorClient";
import { sanitize_for_fs } from "~/lib/fs";
import { fromMarkdown } from "mdast-util-from-markdown"
import { toMarkdown } from "mdast-util-to-markdown"
import type { Parent, Code } from "mdast";
import path from "path";
import Link from "next/link";
import { Button } from "~/components/ui/button";
import { DrawerDialogDemo } from "~/components/publish_drawer";
import { useTheme } from "next-themes";
import "./InitializedMDXEditor.module.css"
import clsx from "clsx";

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
    const theme = useTheme()

    useEffect(() => {
        if (!article) return
        setUrl(article.url)
        setTitle(article.title)
        console.log("setting markdown", article)
        innerRef.current?.setMarkdown(article.content)
    }, [article])

    async function rename_and_save() {
        if (!innerRef.current || !article) return

        const markdown = innerRef.current?.getMarkdown()
        if (!markdown) return;

        const { markdown: new_markdown, title: new_title } = traverse_tree(markdown)
        if (typeof new_title !== "string")
            throw new Error("No title found")

        const new_url = sanitize_for_fs(new_title)
        console.warn({ new_title, new_url })
        setTitle(new_title)
        setUrl(new_url)


        const result = await save_article({
            id: article.id,
            url: new_url,
            title: new_title,
            content: new_markdown,
            published
        })

        console.log("saved", result)

        if (!result.serverError && !result.validationErrors) {
            router.push(`/edit?url=${new_url}`)
        }
    }

    function traverse_tree(markdown: string) {
        const tree = fromMarkdown(markdown, {})
        let heading: string | undefined;

        function find_heading(node: Parent | Code) {
            if (typeof heading !== "undefined" || node.type === "code") {
                return;
            }
            node = node as Parent

            for (const child of node.children) {
                if (Object.keys(child).includes("children")) {
                    find_heading(child as Parent);
                }

                if (child.type == "heading" && child.depth == 1) {
                    if (child.children.length == 1 && child.children[0]?.type == "text") {
                        heading = child.children[0].value
                    }
                }
            }
        }

        function change_images(node: Parent | Code) {
            if (node.type === "code") {
                return;
            }
            node = node as Parent

            for (const child of node.children) {
                if (Object.keys(child).includes("children")) {
                    change_images(child as Parent);
                }

                if (child.type == "image" && typeof heading === "string") {
                    child.url = change_url(heading, child.url)
                    console.log("image found", child)
                }
            }
        }

        find_heading(tree)
        change_images(tree)

        return {
            markdown: toMarkdown(tree, {}),
            title: heading
        }
    }

    return <div className="container">
        <div className="flex space-x-2 flex-end">
            <Button
                variant="outline"
                onClick={async () => await rename_and_save()}
            >
                Shrani
            </Button>
            <DrawerDialogDemo
                onClick={async () => {
                    await rename_and_save()
                }}
                title={title}
                url={url}
            />
            <Button asChild variant="outline">
                <Link
                    className="no-underline"
                    href={`/novicka/${search_params.get("url") ?? ""}`}
                    target="_blank"
                >
                    Obišči stran
                </Link>
            </Button>
        </div>

        <div className="border-2 border-primary/25 rounded-md">
            <MDXEditor
                plugins={allPlugins(markdown ?? "", search_params.get("url") ?? undefined)}
                {...props}
                markdown={markdown ?? ""}
                className={clsx(theme.theme === "dark" ? "dark-theme dark-editor" : "")}

                contentEditableClassName="max-w-full"
                ref={editorRef}
            />
        </div>
        <div style={{ height: "70px" }} />
    </div>

}