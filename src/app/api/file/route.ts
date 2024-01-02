import { NextResponse, type NextRequest } from "next/server"
import fs from "fs/promises"
import path from "path"
import { extension } from "mime-types"
import { FILESYSTEM_PREFIX } from "~/lib/fs"

export const dynamic = 'force-dynamic'

const NAME_PREFIX = "blobid-"

export async function POST(request: NextRequest) {
    const formData = await request.formData()
    const file_contents = formData.get("file")
    const pathname = formData.get("pathname")

    if (!(file_contents instanceof File) || typeof pathname !== "string") return NextResponse.error()

    const file_extension = extension(file_contents.type)
    // unix time in miliseconds 
    const name = NAME_PREFIX + Date.now() + "." + file_extension
    const image_path = path.join(FILESYSTEM_PREFIX, pathname)
    const article_removed = path.relative("article", image_path)

    await fs.mkdir(path.dirname(article_removed), { recursive: true })

    console.log("writing file", { article_removed, name })
    const data = new Uint8Array(await file_contents.arrayBuffer());
    await fs.writeFile(path.join(article_removed, name), data);
    return NextResponse.json({ location: name })
}