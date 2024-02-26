"use server";

import { revalidateTag } from 'next/cache'
import { getServerAuthSession } from "~/server/auth";
import { db } from "~/server/db";
import path from "path"
import fs from 'fs-extra'
import { FILESYSTEM_PREFIX, sanitize_for_fs } from "~/lib/fs";

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

export const read_article = action(read_schema, async ({ url }): Promise<Article | undefined> => {
    const article = await db.article.findUnique({
        where: {
            url,            
        }
    })
    if (!article) console.error("NO ARTICLE FOUND!!, reading", { url })

    return article ?? undefined
})

const new_article_schema = z.object({})

export const new_article = action(new_article_schema, async ({ }) => {
    const session = await getServerAuthSession()
    if (!session?.user) throw new Error("No user")
    revalidateTag("articles")

    const now = new Date()
    const temp_name = `untitled-${now.getTime()}`

    const article = await db.article.create({
        data: {
            title: temp_name,
            url: temp_name,
            createdById: session.user.id,
        }
    })

    await fs.mkdir(path.join(FILESYSTEM_PREFIX, temp_name), { recursive: true })

    return article
})

const save_article_schema = z.object({
    title: z.string().optional(),
    url: z.string().optional(),
    content: z.string().optional(),
    published: z.boolean().optional(),
    id: z.number(),
})

export const save_article = action(save_article_schema, async ({ title, url: unsafe_url, content, id, published }) => {
    const session = await getServerAuthSession()
    if (!session?.user) throw new Error("No user")
    revalidateTag("articles")

    const article = await db.article.findUniqueOrThrow({
        where: {
            id,
        }
    })

    const final_content = typeof content == "undefined" ? article.content : content
    let final_url = article.url
    if (typeof title != "undefined") {
        final_url = sanitize_for_fs(title)
    } else if (typeof unsafe_url != "undefined") {
        final_url = sanitize_for_fs(unsafe_url)
    }

    if (final_url != article.url) {
        await fs.rename(path.join(FILESYSTEM_PREFIX, article.url), path.join(FILESYSTEM_PREFIX, final_url))
    }

    await db.article.update({
        where: {
            id,
        },
        data: {
            title: title ?? article.title,
            url: final_url,
            content: final_content,
            published: published ?? article.published,
        }
    })

    return final_url
})
