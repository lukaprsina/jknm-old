import { db } from "~/server/db"
import fs from "fs/promises"
import path from "path"
import { FILESYSTEM_PREFIX, sanitize_for_fs } from "~/lib/fs"

async function main() {
    const luka_user = await db.user.findFirst({
        where: {
            email: "prsinaluka@gmail.com",
        }
    })
    if (!luka_user)
        throw new Error("No user found")

    for (let i = 0; i < 10; i++) {
        const title = `Article ${i}`
        const url = sanitize_for_fs(title)

        await fs.mkdir(path.join(FILESYSTEM_PREFIX, url), { recursive: true })
        await db.article.create({
            data: {
                title,
                url,
                imageUrl: "https://picsum.photos/1500/1000",
                content: `# Article ${i}

                    Some content`,
                createdById: luka_user.id
            }
        })
    }
}

await main()