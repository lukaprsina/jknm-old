"use server"

import { db } from "~/server/db";

export async function getArticles() {
    return await db.article.findMany({})
}

export async function getPublishedArticles() {
    return await db.article.findMany({
        where: {
            // published: true
        },
        select: {
            title: true,
            id: true,
            url: true,
            createdById: true
        },
        orderBy: {
            createdAt: "desc"
        }
    })
}