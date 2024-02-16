"use server";

import { revalidateTag } from 'next/cache'
import { getServerAuthSession } from "~/server/auth";
import { db } from "~/server/db";
import path from "path"
import fs from 'fs-extra'
import { FILESYSTEM_PREFIX, sanitize_for_fs } from "~/lib/fs";
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
    url: z.string(),
})

export const read_article = action(read_schema, async ({ url: unsafe_url }): Promise<Article | undefined> => {
    const decoded = decodeURIComponent(unsafe_url)
    console.log("Reading article: ", decoded)

    const article = await db.article.findUnique({
        where: {
            url: decoded,
        }
    })

    if (!article) console.error("NO ARTICLE FOUND!!")

    return article ?? undefined
})

const new_article_schema = z.object({})

export const new_article = action(new_article_schema, async () => {
    const session = await getServerAuthSession()
    if (!session?.user) throw new Error("No user")
    revalidateTag("articles")

    const now = new Date()
    const temp_name = `temp-${now.getTime()}`

    const article = await db.article.create({
        data: {
            title: temp_name,
            url: temp_name,
            createdById: session.user.id,
            published: true,
        }
    })

    await fs.mkdir(path.join(FILESYSTEM_PREFIX, temp_name), { recursive: true })

    return article
})

const save_article_schema = z.object({
    title: z.string().optional(),
    content: z.string().optional(),
    url: z.string().optional(),
    id: z.number()
})

export const save_article = action(save_article_schema, async ({ title, content, id, url: unsafe_url }) => {
    const session = await getServerAuthSession()
    if (!session?.user) throw new Error("No user")
    revalidateTag("articles")

    const article = await db.article.findUniqueOrThrow({
        where: {
            id,
        }
    })

    let sanitized_url = article.url
    if (typeof title != "undefined" && title !== article.title)
        sanitized_url = sanitize_for_fs(title)
    else if (typeof unsafe_url != "undefined")
        sanitized_url = sanitize_for_fs(unsafe_url)

    const duplicate = await db.article.findUnique({
        where: {
            url: sanitized_url,
        }
    })
    if (duplicate && duplicate.id !== id) throw new Error("Duplicate URL")

    await fs.move(path.join(FILESYSTEM_PREFIX, article.url), path.join(FILESYSTEM_PREFIX, sanitized_url))

    const updated_content = content ?? article.content
    const code = String(await compile(updated_content, {
        outputFormat: 'function-body',
    }))

    await db.article.update({
        where: {
            id,
        },
        data: {
            title: title ?? article.title,
            url: sanitized_url,
            content: updated_content,
            cached: code,
        }
    })

    return sanitized_url
})