"use server";

import { revalidateTag } from 'next/cache'
import sanitize_filename from 'sanitize-filename'
import { getServerAuthSession } from "~/server/auth";
import { db } from "~/server/db";
import path from "path"
import fs from 'fs-extra'
import { ARTICLE_PREFIX, FILESYSTEM_PREFIX } from "~/lib/fs";
import { compile } from '@mdx-js/mdx'

import { action } from "~/lib/safe_action"
import { z } from "zod";
import type { Article } from "@prisma/client";

const search_schema = z.object({
    search_text: z.string(),
})

export const search_articles = action(search_schema, async ({ search_text }): Promise<Article[]> => {
    const result = await db.article.findMany({
        where: {
            content: {
                search: search_text,
            }
        }
    })
    return result
})

const read_schema = z.object({
    pathname: z.string(),
})

export const read_article = action(read_schema, async ({ pathname }): Promise<Article | undefined> => {
    debugger;
    const decoded = decodeURIComponent(pathname)
    const unmicrosofted = decoded.replace(/\\/g, "/")
    let pathname_without_prefix = path.normalize(unmicrosofted)
    if (pathname_without_prefix.startsWith(ARTICLE_PREFIX))
        pathname_without_prefix = path.relative(ARTICLE_PREFIX, pathname_without_prefix)

    console.error("READING ARTICLE", pathname, pathname_without_prefix, format_pathname(pathname_without_prefix))
    const article = await db.article.findUnique({
        where: {
            pathname: format_pathname(pathname_without_prefix),
        }
    })
    if (!article) console.error("NO ARTICLE FOUND!!")

    return article ?? undefined
})

const new_article_schema = z.object({ pathname: z.string() })

export const new_article = action(new_article_schema, async ({ pathname }) => {
    const session = await getServerAuthSession()
    if (!session?.user) throw new Error("No user")
    revalidateTag("articles")

    let article_removed = path.normalize(pathname)
    if (article_removed.startsWith(ARTICLE_PREFIX))
        article_removed = path.relative(ARTICLE_PREFIX, article_removed)

    const base_dir = await sanitize_path(article_removed)
    const temp_name = await get_temp_name()
    const fs_pathname = path.join(base_dir, temp_name)

    const article = await db.article.create({
        data: {
            title: temp_name,
            pathname: format_pathname(fs_pathname),
            createdById: session.user.id,
            published: true,
        }
    })

    await fs.mkdir(path.join(FILESYSTEM_PREFIX, fs_pathname), { recursive: true })

    return article
})

const save_article_schema = z.object({
    title: z.string().optional(),
    pathname: z.string().optional(),
    content: z.string().optional(),
    id: z.number()
})

export const save_article = action(save_article_schema, async ({ title, pathname, content, id }) => {
    const session = await getServerAuthSession()
    if (!session?.user) throw new Error("No user")
    revalidateTag("articles")

    const article = await db.article.findUniqueOrThrow({
        where: {
            id,
        }
    })

    const old_formatted_title = path.basename(article.pathname)
    const old_pathname = path.join(FILESYSTEM_PREFIX, article.pathname)
    let new_pathname = old_pathname
    let new_pathname_with_old_title = old_pathname

    if (typeof pathname == "string") {
        // the new path invalid if it throws
        new_pathname = path.join(FILESYSTEM_PREFIX, await sanitize_path(pathname))
        new_pathname_with_old_title = path.join(new_pathname, old_formatted_title)

        if (new_pathname_with_old_title != old_pathname) {
            try {
                // TODO: handle overwriting
                await fs.move(old_pathname, new_pathname_with_old_title)
            } catch (e) {
                console.error("move error", e)
            }
        }
    }

    let new_pathname_with_new_title = new_pathname_with_old_title
    if (typeof title == "string") {
        new_pathname_with_new_title = path.join(new_pathname, sanitize_filename(title))

        if (new_pathname_with_old_title !== new_pathname_with_new_title) {
            await fs.rename(new_pathname_with_old_title, new_pathname_with_new_title)
        }
    }

    const final_path = format_pathname(path.relative(FILESYSTEM_PREFIX, new_pathname_with_new_title))
    const final_content = content ?? article.content

    // prerender mdx
    const code = String(await compile(final_content, {
        outputFormat: 'function-body',
    }))

    await db.article.update({
        where: {
            id,
        },
        data: {
            title: title ?? article.title,
            pathname: final_path,
            content: final_content,
            cached: code,
        }
    })

    return final_path
})

async function sanitize_path(article_path: string) {
    const normalized_path = path.normalize(article_path)
    if (normalized_path.startsWith("..")) throw new Error("Invalid path")
    return normalized_path
}

async function get_temp_name() {
    let count;
    let temp_name;
    do {
        const now = new Date()
        const miliseconds = now.getTime()
        temp_name = `temp-${miliseconds}`

        count = await db.article.count({
            where: {
                pathname: temp_name,
            }
        })
    } while (count > 0)
    return temp_name
}