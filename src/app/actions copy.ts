"use server";

import { getServerAuthSession } from "~/server/auth";
import { db } from "~/server/db";
import path from "path"
import fs from "fs/promises"
import { FILESYSTEM_PREFIX } from "~/lib/fs";
import sanitize_filename from "sanitize-filename"
import type { Article } from "@prisma/client";

import { action } from "~/lib/safe-action"
import { z } from "zod";

const create_temporary_schema = z.object({})

export const create_temporary = action(create_temporary_schema, async () => {
    const session = await getServerAuthSession()
    if (!session?.user) throw new Error("No user")

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

    const article = await db.article.create({
        data: {
            title: temp_name,
            pathname: temp_name,
            createdById: session.user.id,
            isTemporary: true,
        }
    })

    return article
})

const read_schema = z.object({
    pathname: z.string(),
})

export const read_article = action(read_schema, async ({ pathname }): Promise<Article> => {
    const decoded = decodeURIComponent(pathname)
    const unmicrosofted = decoded.replace(/\\/g, "/")
    console.log({ unmicrosofted })

    const article = await db.article.findUniqueOrThrow({
        where: {
            pathname: unmicrosofted,
        }
    })

    return article
})

const create_or_update_schema = z.object({
    title: z.string(),
    pathname: z.string(),
    content: z.string().optional(),
})

// TODO: test with malicious paths
// set temp to false
export const create_or_update_article = action(create_or_update_schema, async ({ content, pathname, title: requested_title }) => {
    const session = await getServerAuthSession()
    if (!session?.user) throw new Error("No user")
    if (typeof content !== "string") throw new Error("No content")

    const article_count = await db.article.count({
        where: {
            pathname,
        }
    })

    if (article_count == 0) {
        await create(requested_title, pathname, content, session.user.id);
    } else if (article_count == 1) {
        const article = await db.article.findUniqueOrThrow({
            where: {
                pathname,
            }
        })
        await update(article, requested_title, content);
    } else {
        throw new Error("Multiple articles with the same title")
    }
})

async function create(requested_title: string, dangerous_pathname: string, content: string, userId: string) {
    const normalized_path = sanitize_filename(path.normalize(dangerous_pathname)).replace(/\\/g, "/")
    if (normalized_path.startsWith("..")) throw new Error("Invalid path")

    const possible_doubles = await db.article.findMany({
        where: {
            pathname: {
                startsWith: normalized_path
            }
        },
    })

    const unique_pathname = generate_unique_name(normalized_path, possible_doubles.map(p => p.pathname))

    await db.article.create({
        data: {
            title: requested_title,
            content,
            pathname: unique_pathname,
            createdById: userId
        }
    })

    const article_dir = path.join(FILESYSTEM_PREFIX, unique_pathname)
    await fs.mkdir(article_dir, { recursive: true })
}

export async function update(article: Article, title: string, content: string) {
    const article_dir = path.join(FILESYSTEM_PREFIX, article.pathname, article.title)
    await fs.mkdir(article_dir, { recursive: true })

    await db.article.update({
        where: {
            id: article.id
        },
        data: {
            content,
            title,
        }
    })
}

function generate_unique_name(name: string, existingNames: string[]): string {
    if (!existingNames.includes(name))
        return name;

    let uniqueName = name;
    let index = 1;
    while (existingNames.includes(uniqueName)) {
        uniqueName = `${name} (${index++})`;
    }

    return uniqueName;
}