import { db } from "~/server/db"
import fs from "fs/promises"
import path from "path"
import { FILESYSTEM_PREFIX, sanitize_for_fs } from "~/lib/fs"
import { meilisearchClient } from "~/lib/meilisearch"
import { faker } from "@faker-js/faker"

async function main() {
    const luka_user = await db.user.findFirst({
        where: {
            email: "prsinaluka@gmail.com",
        }
    })
    if (!luka_user)
        throw new Error("No user found")

    meilisearchClient.createIndex("novicke")

    for (let i = 0; i < 10; i++) {
        const title = `${faker.commerce.productName()} ${i}`
        const url = sanitize_for_fs(title)

        const index = meilisearchClient.getIndex("novicke")
        const content = `# Article ${i}

                    Some content`

        await index.addDocuments([{
            id: i,
            title,
            url,
            content
        }])

        await fs.mkdir(path.join(FILESYSTEM_PREFIX, url), { recursive: true })
        await db.article.create({
            data: {
                title,
                url,
                imageUrl: "https://picsum.photos/1500/1000",
                content,
                createdById: luka_user.id,
                published: true,
                publishedAt: new Date(),
            }
        })
    }
}

await main()