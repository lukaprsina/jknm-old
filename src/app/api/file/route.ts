import { NextResponse, type NextRequest } from "next/server"
import fs from "fs/promises"
import path from "path"
import { extension } from "mime-types"
import { FILESYSTEM_PREFIX, WEB_FILESYSTEM_PREFIX } from "~/lib/fs"

export const dynamic = 'force-dynamic'

const NAME_PREFIX = "blobid-"

export async function POST(request: NextRequest) {
    const formData = await request.formData()
    const file_contents = formData.get("file")
    const url = formData.get("url")

    if (!(file_contents instanceof File) || typeof url !== "string") return NextResponse.error()

    const file_extension = extension(file_contents.type)
    // unix time in miliseconds 
    const name = NAME_PREFIX + Date.now() + "." + file_extension

    const decoded_url = path.normalize(decodeURIComponent(url))

    const image_folder = path.join(FILESYSTEM_PREFIX, decoded_url)
    await fs.mkdir(path.dirname(image_folder), { recursive: true })

    const data = new Uint8Array(await file_contents.arrayBuffer());
    const image_file = path.join(image_folder, name)
    await fs.writeFile(image_file, data);
    const response_location = path.join(WEB_FILESYSTEM_PREFIX, decoded_url, name)
    const abolute_location = path.join("/", response_location)

    return NextResponse.json({ location: abolute_location })
}