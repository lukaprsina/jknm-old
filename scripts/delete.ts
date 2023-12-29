import { db } from "~/server/db"
import fs from "fs/promises"

async function main() {
    await db.article.deleteMany({})

    await fs.rm("public/fs/*", { recursive: true, force: true })
}

await main()