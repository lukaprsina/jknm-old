import { NextResponse, type NextRequest } from "next/server"
import fs from "fs/promises"
import path from "path"
import { extension } from "mime-types"
import { ARTICLE_PREFIX, FILESYSTEM_PREFIX, WEB_FILESYSTEM_PREFIX, remove_article_name, sanitize_for_fs } from "~/lib/fs"

export const dynamic = 'force-dynamic'

const NAME_PREFIX = "blobid-"

export async function POST(request: NextRequest) {
    const formData = await request.formData()
    const file_contents = formData.get("file")
    const url = formData.get("url")
    console.error("Reached api/file endpoint", decodeURIComponent(url?.toString() ?? "no url"))

    if (!(file_contents instanceof File) || typeof url !== "string") return NextResponse.error()

    const file_extension = extension(file_contents.type)
    // unix time in miliseconds 
    const name = NAME_PREFIX + Date.now() + "." + file_extension
    const article_removed = decodeURIComponent(url)

    const image_folder = path.join(FILESYSTEM_PREFIX, article_removed)
    await fs.mkdir(path.dirname(image_folder), { recursive: true })

    const data = new Uint8Array(await file_contents.arrayBuffer());
    const image_file = path.join(image_folder, name)
    await fs.writeFile(image_file, data);
    const absolute_location = path.join("/", WEB_FILESYSTEM_PREFIX, article_removed, name)

    console.error("Returning api/file endpoint with", { location: absolute_location })
    return NextResponse.json({ location: absolute_location })
}