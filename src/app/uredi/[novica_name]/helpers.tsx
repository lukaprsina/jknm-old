"use client";

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
} from '@mdxeditor/editor'
// } from '@lukaprsina/mdxeditor'
// } from "modified-editor";
import { Toolbar } from "./toolbar";
import { WEB_FILESYSTEM_PREFIX, sanitize_for_fs } from "~/lib/fs";
import path from "path";
import { fromMarkdown } from "mdast-util-from-markdown";
import { toMarkdown } from "mdast-util-to-markdown";
import { toString as markdownToString } from "mdast-util-to-string";
import type { Parent, Code } from "mdast";
import { SaveArticleType } from "~/server/data_layer/articles";

const imageUploadHandler = async (
  image: File,
  url?: string,
): Promise<string | undefined> => {
  if (!image) throw new Error("No image");
  if (typeof url == "undefined") throw new Error("No url");

  const form = new FormData();
  form.append("file", image);
  form.append("url", url);

  const image_response = await fetch("/api/file", {
    method: "POST",
    body: form,
  });

  if (image_response.ok) {
    const image_json = (await image_response.json()) as { location: string };
    return image_json.location;
  } else {
    throw new Error("Failed to upload image");
  }
};

export function allPlugins(diffMarkdown: string, url?: string) {
  return [
    toolbarPlugin({ toolbarContents: () => <Toolbar /> }),
    headingsPlugin(),
    listsPlugin(),
    quotePlugin(),
    linkPlugin(),
    linkDialogPlugin(),
    imagePlugin({
      imageUploadHandler: async (image) => {
        const imageUrl = await imageUploadHandler(image, url);
        return imageUrl || '';
      },
    }),
    tablePlugin(),
    thematicBreakPlugin(),
    frontmatterPlugin(),
    directivesPlugin({ directiveDescriptors: [AdmonitionDirectiveDescriptor] }),
    diffSourcePlugin({ viewMode: "rich-text", diffMarkdown }),
    markdownShortcutPlugin(),
  ];
}

export const IMAGE_FS_PREFIX = `/${WEB_FILESYSTEM_PREFIX}/`;

export function change_url(previous_url: string, current_url: string) {
  if (!previous_url.startsWith(IMAGE_FS_PREFIX)) return previous_url;
  const name = path.basename(previous_url);
  return path.join(IMAGE_FS_PREFIX, current_url, name);
}

export function recurse_article(markdown: string, forced_title: string | undefined, forced_url: string | undefined) {
  const tree = fromMarkdown(markdown);

  function find_heading(node: Parent | Code): string | undefined {
    node = node as Parent;

    for (const child of node.children) {
      if (Object.keys(child).includes("children")) {
        const heading = find_heading(child as Parent);
        if (typeof heading == "string") return heading;
      }

      if (child.type == "heading" && child.depth == 1) {
        const heading_md = markdownToString(child);
        if (heading_md.length > 0) return heading_md;
      }
    }

    return;
  }

  const image_urls: string[] = [];

  function change_images(node: Parent | Code, new_url: string) {
    if (node.type === "code") {
      return;
    }
    node = node as Parent;

    for (const child of node.children) {
      if (Object.keys(child).includes("children")) {
        change_images(child as Parent, new_url);
      }

      if (child.type == "image" && typeof new_url === "string") {
        child.url = change_url(child.url, new_url);
        image_urls.push(child.url);
      }
    }
  }

  let new_url = forced_url;
  let new_title = forced_title;
  if (typeof new_title !== "string") new_title = find_heading(tree);

  // if no heading is found, generate a new one
  if (typeof new_title !== "string") {
    const now = new Date();
    new_title = `untitled-${now.getTime()}`;
  }

  if (typeof new_url !== "string") new_url = sanitize_for_fs(new_title);


  change_images(tree, new_url);
  const new_markdown = toMarkdown(tree).trim();

  return {
    new_markdown,
    new_title,
    new_url,
    image_urls,
  };
}