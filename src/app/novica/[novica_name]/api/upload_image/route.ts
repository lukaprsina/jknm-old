import { NextRequest } from "next/server";

import { HeadObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { env } from "~/env";
import { createPresignedPost } from "@aws-sdk/s3-presigned-post";
import { getServerAuthSession } from "~/server/auth";
import { title_to_url } from "~/lib/fs";
import { db } from "~/server/db";

export const dynamic = "force-dynamic";

export async function POST(
  request: NextRequest,
  { params }: { params: { novica_name: string } },
) {
  const session = await getServerAuthSession();
  if (!session?.user) throw new Error("No user");

  const novica_url = title_to_url(params.novica_name);

  await db.article.findUniqueOrThrow({
    where: {
      url: novica_url,
    },
  });

  const { filename, content_type } = await request.json();
  const image_url = `${novica_url}/slike/${filename}`;

  const client = new S3Client({ region: env.AWS_REGION });
  let is_duplicate = true;

  try {
    await client.send(
      new HeadObjectCommand({
        Bucket: env.AWS_BUCKET_NAME,
        Key: image_url,
      }),
    );
  } catch (error: unknown) {
    if (error instanceof Error) {
      if (error.name === "NotFound") is_duplicate = false;
      else throw error;
    } else {
      throw error;
    }
  }

  if (is_duplicate) {
    throw new Error("Duplicate image name");
  }

  try {
    const { url, fields } = await createPresignedPost(client, {
      Bucket: env.AWS_BUCKET_NAME,
      Key: image_url,
      Conditions: [
        ["content-length-range", 0, 10485760], // up to 10 MB
        ["starts-with", "$Content-Type", content_type],
      ],
      Fields: {
        acl: "public-read",
        "Content-Type": content_type,
      },
      Expires: 600, // Seconds before the presigned post expires. 3600 by default.
    });

    return Response.json({
      url,
      fields,
      image_url,
      image_filename: filename,
    });
  } catch (error) {
    return Response.json({ error });
  }
}
