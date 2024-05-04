import { FILESYSTEM_PREFIX, normalize_slashes_to_relative } from "~/lib/fs"
import path from "path"
import fs from "fs/promises"
import mime from "mime-types"

export async function GET(_request: Request, { params }: { params: { novica_name: string, slika_name: string } }) {
    const image_path = path.join(FILESYSTEM_PREFIX, params.novica_name, params.slika_name)
    const sanitized_path = normalize_slashes_to_relative(image_path)
    console.log("GET image", { image_path, sanitized_path })
    const mime_type = mime.lookup(sanitized_path) || 'application/octet-stream';
    const image = await fs.readFile(sanitized_path)
    return new Response(image, { headers: { "Content-Type": mime_type } })
}