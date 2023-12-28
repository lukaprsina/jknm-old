"use server";

import { getServerAuthSession } from "~/server/auth";
import { db } from "~/server/db";
import path from "path"
import fs from "fs/promises"
import { ARTICLE_PREFIX } from "~/utlis/fs";
import slugify from "slugify"
import type { Article } from "@prisma/client";

export async function create(formData: FormData): Promise<Article> {
    const session = await getServerAuthSession()
    if (!session?.user) throw new Error("No user")

    const content = formData.get("content") as string
    const requested_title = formData.get("title") as string
    if (!requested_title || !content) throw new Error("No title or content")

    const slug = slugify(requested_title, "_")
    const possible_doubles = await db.article.findMany({
        where: {
            title: slug
        },
        select: {
            title: true
        }
    })

    const title = generateUniqueName(slug, possible_doubles.map(p => p.title))

    const article = await db.article.create({
        data: {
            title: title,
            createdBy: {
                connect: {
                    id: session.user.id
                }
            },
        }
    })

    const article_path = path.join(ARTICLE_PREFIX, title)
    await fs.mkdir(article_path)
    await fs.writeFile(path.join(article_path, "index.hml"), content)

    return article;
}

export async function save(formData: FormData) {
    const session = await getServerAuthSession()
    if (!session?.user) throw new Error("No user")
    if (!session?.user) return;

    const content = formData.get("content") as string
    const title = formData.get("title") as string
    if (!title || !content) throw new Error("No title or content")

    const article_count = await db.article.count({
        where: {
            title: title
        }
    })

    if (article_count == 0) {
        const article = await db.article.create({
            data: {
                title: title,
                createdBy: {
                    connect: {
                        id: session.user.id
                    }
                },
            }
        })
        return article;
    } else if (article_count == 1) {
    } else {
        throw new Error("Multiple articles with the same title")
    }

    const article_path = path.join(ARTICLE_PREFIX, title)
    await fs.writeFile(path.join(article_path, "index.hml"), content)
}

function generateUniqueName(name: string, existingNames: string[]): string {
    if (!existingNames.includes(name))
        return name;

    let uniqueName = name;
    let index = 1;
    while (existingNames.includes(uniqueName)) {
        uniqueName = `${name} (${index++})`;
    }
    return uniqueName;

}
