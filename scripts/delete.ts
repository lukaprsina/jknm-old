import { db } from "~/server/db"
import path from "path"
import fs from "fs/promises"

async function clear_directory(directory: string) {
    const files = await fs.readdir(directory);

    for (const file of files) {
        const filePath = path.join(directory, file);
        await fs.rm(filePath, { recursive: true, force: true });
    }
}

async function main() {
    await db.article.deleteMany({})

    await clear_directory(path.join(process.cwd(), "fs"))
}

await main()