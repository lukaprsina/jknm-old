"use client"

import {
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
} from 'modified-editor'
import { Toolbar } from "./toolbar";
import { WEB_FILESYSTEM_PREFIX, sanitize_for_fs } from "~/lib/fs";
import path from "path";
import { fromMarkdown } from "mdast-util-from-markdown"
import { toMarkdown } from "mdast-util-to-markdown"
import type { Parent, Code } from "mdast";

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

export const allPlugins = (diffMarkdown: string, url?: string) => [
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

export const IMAGE_FS_PREFIX = `/${WEB_FILESYSTEM_PREFIX}/`

export function change_url(current_url: string, previous_url: string) {
    if (!previous_url.startsWith(IMAGE_FS_PREFIX)) return previous_url
    const name = path.basename(previous_url)
    return path.join(IMAGE_FS_PREFIX, current_url, name)
}

export function traverse_tree(markdown: string) {
    const tree = fromMarkdown(markdown, {})

    function find_heading(node: Parent | Code): string | undefined {
        node = node as Parent

        for (const child of node.children) {
            if (Object.keys(child).includes("children")) {
                const heading = find_heading(child as Parent);
                if (typeof heading == "string")
                    return heading
            }

            if (child.type == "heading" && child.depth == 1) {
                if (child.children.length == 1 && child.children[0]?.type == "text") {
                    return child.children[0].value
                }
            }
        }

        return
    }

    const image_urls: string[] = []

    function change_images(node: Parent | Code, new_url: string) {
        if (node.type === "code") {
            return;
        }
        node = node as Parent

        for (const child of node.children) {
            if (Object.keys(child).includes("children")) {
                change_images(child as Parent, new_url);
            }

            if (child.type == "image" && typeof new_url === "string") {
                child.url = change_url(new_url, child.url)
                image_urls.push(child.url)
            }
        }
    }

    const heading = find_heading(tree)
    if (typeof heading === "undefined") throw new Error("No heading found")
    const new_url = sanitize_for_fs(heading)

    change_images(tree, new_url)

    return {
        markdown: toMarkdown(tree, {}),
        new_title: heading,
        image_urls
    }
}

export function update_state(markdown: string) {
    const { markdown: new_markdown, new_title, image_urls } = traverse_tree(markdown)
    if (typeof new_title !== "string")
        throw new Error("No title found")

    const new_url = sanitize_for_fs(new_title)

    return {
        new_markdown,
        new_title,
        new_url,
        image_urls
    }
}