import {
  CopyObjectCommand,
  DeleteObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { env } from "~/env";

export async function s3_move_object(old_url: string, new_url: string) {
  try {
    const client = new S3Client({ region: env.AWS_REGION });

    await client.send(
      new CopyObjectCommand({
        Bucket: env.AWS_BUCKET_NAME,
        CopySource: `${env.AWS_BUCKET_NAME}/${old_url}`,
        Key: new_url,
      }),
    );

    await client.send(
      new DeleteObjectCommand({
        Bucket: env.AWS_BUCKET_NAME,
        Key: old_url,
      }),
    );
  } catch (error) {
    return { error };
  }
}
