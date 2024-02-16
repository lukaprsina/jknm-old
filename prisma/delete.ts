import { db } from "~/server/db"
import path from "path"
import fs from "fs/promises"
import { FILESYSTEM_PREFIX } from "~/lib/fs";
import dotenv from "dotenv"

async function clear_directory(directory: string) {
    dotenv.config()

    const files = await fs.readdir(directory);

    for (const file of files) {
        const filePath = path.join(directory, file);
        await fs.rm(filePath, { recursive: true, force: true });
    }
}

async function main() {
    await db.article.deleteMany({})

    await clear_directory(path.join(process.cwd(), FILESYSTEM_PREFIX))
}

await main()