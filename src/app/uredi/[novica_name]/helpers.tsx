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
} from "@mdxeditor/editor";
// } from '@lukaprsina/mdxeditor'
// } from "modified-editor";
import { Toolbar } from "./toolbar";
import { WEB_FILESYSTEM_PREFIX, title_to_url } from "~/lib/fs";
import path from "path";
import { fromMarkdown } from "mdast-util-from-markdown";
import { toMarkdown } from "mdast-util-to-markdown";
import { toString as markdownToString } from "mdast-util-to-string";
import type { Parent, Code } from "mdast";
import { SaveArticleType } from "~/server/articles";
import { useRouteParams } from "next-typesafe-url/app";
import { Route } from "./routeType";

const imageUploadHandler = async (
  image: File,
  novica_name: string,
): Promise<string> => {
  if (!image) throw new Error("No image");

  const form = new FormData();
  form.append("file", image);

  const direct_url_response = await fetch(
    `/novica/${novica_name}/api/upload_image`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ filename: image.name, content_type: image.type }),
    },
  );

  if (direct_url_response.ok) {
    const { url, fields, image_filename, image_url } =
      await direct_url_response.json();
    console.log(fields);

    const formData = new FormData();
    Object.entries(fields).forEach(([key, value]) => {
      formData.append(key, value as string);
    });
    formData.append("file", image);

    const uploadResponse = await fetch(url, {
      method: "POST",
      body: formData,
    });

    if (uploadResponse.ok) {
      console.log("Upload Response:", url);
      // https://jamarski-klub-novo-mesto.s3.eu-central-1.amazonaws.com/Intelligent-Concrete-Table-9.5/slike/FoldingAtHome-points-certificate-132572.jpg
      // return image_filename as string;
      return `${url}${image_url as string}`;
    } else {
      console.error("S3 Upload Error:", uploadResponse);
      throw new Error("Failed to upload the image to S3");
    }
  } else {
    throw new Error("Failed to create upload link for image");
  }
};

export function allPlugins(diffMarkdown: string, novica_name: string) {
  return [
    toolbarPlugin({ toolbarContents: () => <Toolbar /> }),
    headingsPlugin(),
    listsPlugin(),
    quotePlugin(),
    linkPlugin(),
    linkDialogPlugin(),
    imagePlugin({
      imageUploadHandler: (image) => imageUploadHandler(image, novica_name),
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

export function recurse_article(
  markdown: string,
  forced_title: string | undefined,
  forced_url: string | undefined,
) {
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

  if (typeof new_url !== "string") new_url = title_to_url(new_title);

  change_images(tree, new_url);
  const new_markdown = toMarkdown(tree).trim();

  return {
    new_markdown,
    new_title,
    new_url,
    image_urls,
  };
}
