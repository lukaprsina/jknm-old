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

const create_or_update_schema = z.object({
    title: z.string(),
    pathname: z.string(),
    content: z.string().optional(),
})

const read_schema = z.object({
    pathname: z.string(),
})

export const read_article = action(read_schema, async ({ pathname }): Promise<{ article: Article, content: string }> => {
    const article = await db.article.findUniqueOrThrow({
        where: {
            pathname: decodeURIComponent(pathname),
        }
    })

    const content = await fs.readFile(path.join(FILESYSTEM_PREFIX, article.pathname, "index.hml"), "utf-8")

    return {
        article,
        content
    }
})

// TODO: test with malicious paths
export const create_or_update_article = action(create_or_update_schema, async ({ content, pathname, title: requested_title }) => {
    const session = await getServerAuthSession()
    if (!session?.user) throw new Error("No user")
    if (!content) throw new Error("No content")

    const article_count = await db.article.count({
        where: {
            title: requested_title,
            pathname,
        }
    })

    if (article_count == 0) {
        await create(requested_title, pathname, content, session.user.id);
    } else if (article_count == 1) {
        const article = await db.article.findUniqueOrThrow({
            where: {
                title: requested_title,
                pathname,
            }
        })
        await update(article, content);
    } else {
        throw new Error("Multiple articles with the same title")
    }
})

async function create(requested_title: string, dangerous_pathname: string, content: string, userId: string) {
    const sanitized_title = sanitize_filename(requested_title)
    const normalized_path = sanitize_filename(path.normalize(dangerous_pathname))
    if (normalized_path.startsWith("..")) throw new Error("Invalid path")
    const possible_pathname = path.join(normalized_path, sanitized_title)

    const possible_doubles = await db.article.findMany({
        where: {
            title: requested_title,
            pathname: possible_pathname
        },
    })

    const title = generate_unique_name(sanitized_title, possible_doubles.map(p => p.title))
    const pathname = path.join(normalized_path, title)

    await db.article.create({
        data: {
            title: requested_title,
            pathname,
            createdById: userId
        }
    })

    const article_dir = path.join(FILESYSTEM_PREFIX, normalized_path, title)
    await fs.mkdir(article_dir, { recursive: true })
    await fs.writeFile(path.join(article_dir, "index.hml"), content)
}

export async function update(article: Article, content: string) {
    const article_dir = path.join(FILESYSTEM_PREFIX, article.pathname, article.title)
    await fs.mkdir(article_dir, { recursive: true })
    await fs.writeFile(path.join(article_dir, "index.hml"), content)
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
