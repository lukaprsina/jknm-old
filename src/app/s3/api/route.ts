"use server"

import { NextRequest, NextResponse } from "next/server";

import {
    S3Client,
    ListObjectsCommand,
    PutObjectCommand,
} from "@aws-sdk/client-s3";
import { env } from "~/env";

import { createPresignedPost } from '@aws-sdk/s3-presigned-post'
import { v4 as uuidv4 } from 'uuid'

// endpoint to get the list of files in the bucket
export async function GET() {
    try {
        const client = new S3Client({ region: env.AWS_REGION })
        const response = await client.send(new ListObjectsCommand({ Bucket: env.AWS_BUCKET_NAME }));
        return NextResponse.json(response?.Contents ?? []);
    } catch (error: unknown) {
        return NextResponse.json({ error });
    }
}

export async function POST(request: Request) {
    const { filename, contentType } = await request.json()

    try {
        const client = new S3Client({ region: env.AWS_REGION })
        const { url, fields } = await createPresignedPost(client, {
            Bucket: env.AWS_BUCKET_NAME,
            Key: uuidv4(),
            Conditions: [
                ['content-length-range', 0, 10485760], // up to 10 MB
                ['starts-with', '$Content-Type', contentType],
            ],
            Fields: {
                acl: 'public-read',
                'Content-Type': contentType,
            },
            Expires: 600, // Seconds before the presigned post expires. 3600 by default.
        })

        return Response.json({ url, fields })
    } catch (error) {
        return Response.json({ error })
    }
}