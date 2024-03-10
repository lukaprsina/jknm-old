import { db } from "~/server/db"
import path from "path"
import fs from "fs/promises"
import { FILESYSTEM_PREFIX } from "~/lib/fs";
import dotenv from "dotenv"
import { meilisearchClient } from "~/lib/meilisearch";

async function clear_directory(directory: string) {

    const files = await fs.readdir(directory);

    for (const file of files) {
        const filePath = path.join(directory, file);
        await fs.rm(filePath, { recursive: true, force: true });
    }

    await meilisearchClient.getIndex("novicke").deleteAllDocuments()
    meilisearchClient.getInstantSearchClient().clearCache()
}

async function main() {
    dotenv.config()
    await db.article.deleteMany({})

    await clear_directory(path.join(process.cwd(), FILESYSTEM_PREFIX))
}

await main()