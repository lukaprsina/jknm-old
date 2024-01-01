"use server";

import { getServerAuthSession } from "~/server/auth";
import { db } from "~/server/db";
import path from "path"
import fs from 'fs-extra'
import { FILESYSTEM_PREFIX } from "~/lib/fs";

import { action } from "~/lib/safe-action"
import { z } from "zod";

const format_pathname = (str: string) => str.replace(/^\/|^\\/, '').replace(/\\/g, '/')

const new_article_schema = z.object({ article_path: z.string() })

export const new_article = action(new_article_schema, async ({ article_path }) => {
    const session = await getServerAuthSession()
    if (!session?.user) throw new Error("No user")

    const base_dir = await sanitize_path(article_path)
    const temp_name = await get_temp_name()
    const pathname = path.join(base_dir, temp_name)

    const article = await db.article.create({
        data: {
            title: temp_name,
            // replace leading slash and backslash with nothing
            pathname: format_pathname(pathname),
            createdById: session.user.id,
            published: true,
        }
    })

    await fs.mkdir(path.join(FILESYSTEM_PREFIX, pathname), { recursive: true })

    return article
})

const save_article_schema = z.object({
    title: z.string().optional(),
    pathname: z.string().optional(),
    content: z.string().optional(),
    id: z.number()
})

export const save_article = action(save_article_schema, async ({ title, pathname, content, id }) => {
    const article = await db.article.findUniqueOrThrow({
        where: {
            id,
        }
    })

    const slug = path.basename(article.pathname)
    const old_pathname = path.join(FILESYSTEM_PREFIX, article.pathname)
    let formatted = article.pathname

    if (typeof pathname == "string") {
        formatted = format_pathname(pathname)
        const new_pathname = path.join(FILESYSTEM_PREFIX, await sanitize_path(pathname), slug)

        if (new_pathname != old_pathname) {
            try {
                // TODO: handle overwriting
                console.log("moving", old_pathname, new_pathname)
                await fs.move(old_pathname, new_pathname)
            } catch (e) {
                console.error("move error", e)
            }
        }
    }

    await db.article.update({
        where: {
            id,
        },
        data: {
            title: title ?? article.title,
            pathname: formatted,
            content: content ?? article.content,
        }
    })
})

async function sanitize_path(article_path: string) {
    const normalized_path = path.normalize(article_path)
    if (normalized_path.startsWith("..")) throw new Error("Invalid path")
    return normalized_path
}

async function get_first_real_dir(article_path: string) {
    const relative_path = path.join(FILESYSTEM_PREFIX, article_path)
    const relative_root = FILESYSTEM_PREFIX
    const sanitized_path = await sanitize_path(relative_path)

    let test_path = sanitized_path
    do {
        try {
            const stats = await fs.stat(test_path)
            if (stats.isDirectory()) break
        } catch (e) { }
        test_path = path.dirname(test_path)
    } while (sanitized_path != relative_root)

    return path.relative(relative_root, test_path)
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