import { NextResponse, type NextRequest } from "next/server"
import fs from "fs/promises"
import path from "path"
import { extension } from "mime-types"
import { FILESYSTEM_PREFIX } from "~/utlis/fs"

export async function GET(request: NextRequest) {
    const formData = await request.formData()
    const keys = formData.keys();
    console.log("get")
    console.log("keys")
    for (const key of keys) {
        console.log(key)
    }
    return NextResponse.json({ message: "Hello from /api/file" })
}
const NAME_PREFIX = "blobid-"

export async function POST(request: NextRequest) {
    const formData = await request.formData()
    const file_contents = formData.get("file")
    if (!file_contents) {
        return NextResponse.error()
    }

    if (file_contents instanceof File) {
        const file_extension = extension(file_contents.type)
        // unix time in miliseconds 
        const name = NAME_PREFIX + Date.now() + "." + file_extension
        const final_path = path.join(FILESYSTEM_PREFIX, name)
        // write file_contents to filesystem to final_path
        const data = new Uint8Array(await file_contents.arrayBuffer());
        await fs.writeFile(final_path, data);
        return NextResponse.json({ location: name })
    }
    return NextResponse.error()

}