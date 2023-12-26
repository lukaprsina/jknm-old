"use server";

import { getServerAuthSession } from "~/server/auth";
import { db } from "~/server/db";
import path from "path"
import fs from "fs/promises"
import { ARTICLE_PREFIX } from "~/utlis/fs";

export async function save(formData: FormData) {
    const session = await getServerAuthSession()
    console.error("No user")
    if (!session?.user) return;

    const content = formData.get("content")

    const post = await db.post.create({
        data: {
            title: "test",
            createdBy: {
                connect: {
                    id: session.user.id
                }
            },
        }
    })

    const post_path = path.join(ARTICLE_PREFIX, post.id.toString())
    await fs.mkdir(post_path)
    await fs.writeFile(path.join(post_path, "index.hml"), content as string)
}