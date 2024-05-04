import { NextResponse, type NextRequest } from "next/server";
import fs from "fs/promises";
import path from "path";
import { extension } from "mime-types";
import { FILESYSTEM_PREFIX, normalize_slashes_to_absolute, normalize_slashes_to_relative, sanitize_for_fs, WEB_FILESYSTEM_PREFIX } from "~/lib/fs";

export const dynamic = "force-dynamic";

const NAME_PREFIX = "blobid-";

export async function POST(request: NextRequest) {
  const form_data = await request.formData();
  const file_contents = form_data.get("file");
  const url = form_data.get("url");

  if (!(file_contents instanceof File) || typeof url !== "string")
    return NextResponse.error();

  // const file_extension = extension(file_contents.type);
  // unix time in miliseconds
  // const name = NAME_PREFIX + Date.now() + "." + file_extension;

  const sanitized_article_name = sanitize_for_fs(url);
  const sanitized_image_name = sanitize_for_fs(file_contents.name);

  const image_folder = path.join(FILESYSTEM_PREFIX, sanitized_article_name);
  await fs.mkdir(path.dirname(image_folder), { recursive: true });

  const data = new Uint8Array(await file_contents.arrayBuffer());
  const image_file = path.join(image_folder, sanitized_image_name);
  await fs.writeFile(image_file, data);
  const response_location = path.join(
    "novica",
    sanitized_article_name,
    "slika",
    sanitized_image_name
  );

  return NextResponse.json({ location: normalize_slashes_to_absolute(response_location) });
}
