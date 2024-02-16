import { NextResponse, type NextRequest } from "next/server"
import fs from "fs/promises"
import path from "path"
import { extension } from "mime-types"
import { ARTICLE_PREFIX, FILESYSTEM_PREFIX, WEB_FILESYSTEM_PREFIX } from "~/lib/fs"
import { format_pathname } from "~/app/actions"

export const dynamic = 'force-dynamic'

const NAME_PREFIX = "blobid-"

export async function POST(request: NextRequest) {
    console.error("Reached api/file endpoint")
    const formData = await request.formData()
    const file_contents = formData.get("file")
    const pathname = formData.get("pathname")

    if (!(file_contents instanceof File) || typeof pathname !== "string") return NextResponse.error()

    const file_extension = extension(file_contents.type)
    // unix time in miliseconds 
    const name = NAME_PREFIX + Date.now() + "." + file_extension

    let article_removed = path.normalize(decodeURIComponent(pathname))
    if (article_removed.startsWith(ARTICLE_PREFIX))
        article_removed = path.relative(ARTICLE_PREFIX, article_removed)

    const image_folder = path.join(FILESYSTEM_PREFIX, article_removed)
    await fs.mkdir(path.dirname(image_folder), { recursive: true })

    const data = new Uint8Array(await file_contents.arrayBuffer());
    const image_file = path.join(image_folder, name)
    await fs.writeFile(image_file, data);
    const response_location = format_pathname(path.join(WEB_FILESYSTEM_PREFIX, article_removed, name))
    const abolute_location = path.join("/", response_location)

    console.error("Returning api/file endpoint with", { location: abolute_location })
    return NextResponse.json({ location: abolute_location })
}