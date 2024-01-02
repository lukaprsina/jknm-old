import { NextResponse, type NextRequest } from "next/server"
import fs from "fs/promises"
import path from "path"
import { extension } from "mime-types"
import { FILESYSTEM_PREFIX } from "~/lib/fs"
import { format_pathname } from "~/app/actions"

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


    let article_removed = path.normalize(pathname)
    if (article_removed.startsWith("article"))
        article_removed = path.relative("article", article_removed)

    const image_folder = path.join(FILESYSTEM_PREFIX, article_removed)
    await fs.mkdir(path.dirname(image_folder), { recursive: true })

    const data = new Uint8Array(await file_contents.arrayBuffer());
    const image_file = path.join(image_folder, name)
    await fs.writeFile(image_file, data);
    const response_location = format_pathname(path.join("fs", article_removed, name))
    return NextResponse.json({ location: response_location })
}