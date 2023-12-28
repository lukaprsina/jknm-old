import { db } from "~/server/db"

async function main() {
    await db.article.deleteMany({})
}

await main()