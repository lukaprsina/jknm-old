"use server";

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
    const session = await getServerAuthSession()

    const article = await db.article.findUnique({
        where: {
            url,
        }
    })

    console.log("reading article server", { url })
    if (!article) throw new Error("No article found")
    if (article?.published == false && session?.user.id != article?.createdById) return undefined

    return article ?? undefined
})

const new_article_schema = z.object({})

export const new_article = action(new_article_schema, async ({ }) => {
    const session = await getServerAuthSession()
    if (!session?.user) throw new Error("No user")

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
    image_url: z.string().optional(),
    created_at: z.date().optional(),
    updated_at: z.date().optional(),
    published_at: z.date().optional(),
    id: z.number(),
})

export type SaveArticleType = z.infer<typeof save_article_schema>

export const save_article = action(save_article_schema, async ({ title, url, content, id, published, ...props }) => {
    const session = await getServerAuthSession()
    if (!session?.user) throw new Error("No user")
    console.log("saving article", { title, url, content, id, published })

    const previous_article = await db.article.findUniqueOrThrow({
        where: {
            id,
        }
    })

    const final_content = content ?? previous_article.content
    const final_title = title ?? previous_article.title
    let final_url = url ?? sanitize_for_fs(final_title)

    if (fs.existsSync(path.join(FILESYSTEM_PREFIX, previous_article.url))) {
        if (final_url != previous_article.url) {
            await fs.rename(path.join(FILESYSTEM_PREFIX, previous_article.url), path.join(FILESYSTEM_PREFIX, final_url))
        }
    } else {
        console.error("Missing url path in fs, creating", final_url)
        await fs.mkdir(path.join(FILESYSTEM_PREFIX, final_url), { recursive: true })
    }

    const updated_article = await db.article.update({
        where: {
            id,
        },
        data: {
            title: final_title,
            url: final_url,
            content: final_content,
            published: published ?? previous_article.published,
            createdAt: props.created_at ?? previous_article.createdAt,
            updatedAt: props.updated_at ?? new Date(),
            publishedAt: props.published_at ?? (published ? new Date() : previous_article.publishedAt),
        }
    })

    return updated_article
})

const make_or_return_draft_schema = z.object({
    url: z.string().optional(),
})

export const make_or_return_draft = action(make_or_return_draft_schema, async ({ url }) => {
    const session = await getServerAuthSession()
    if (!session?.user) throw new Error("No user")

    const original_article = await db.article.findUniqueOrThrow({
        where: {
            url
        },
        include: {
            drafts: {
                where: {
                    createdById: session.user.id,
                },
                orderBy: {
                    createdAt: "desc"
                },
                take: 1,
            }
        }
    })

    if (original_article.drafts.length > 0) {
        return original_article.drafts[0]
    } else {
        const now = new Date()
        const draft_name = `${original_article.url}-${now.getTime()}`

        const new_draft = await db.article.create({
            data: {
                title: original_article.title,
                url: draft_name,
                content: original_article.content,
                createdById: session.user.id,
                draftArticleId: original_article.id,
            },
            include: {
                drafts: true
            }
        })

        /* TODO: rename images */
        await fs.mkdir(path.join(FILESYSTEM_PREFIX, draft_name), { recursive: true })
        await fs.copy(path.join(FILESYSTEM_PREFIX, original_article.url), path.join(FILESYSTEM_PREFIX, draft_name))

        return new_draft
    }

})
