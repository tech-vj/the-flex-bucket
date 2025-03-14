import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { NextResponse } from "next/server";

const s3 = new S3Client({
  region: process.env.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

const BUCKET_NAME = process.env.AWS_BUCKET_NAME || "the-flex-bucket";

export async function POST(req: Request) {
  try {
    const { fileName, fileType } = await req.json();
    const objectKey = `uploads/${fileName}`;

    // Generate expiration time explicitly in UTC
    const expirationTimeInSeconds = 60; // 1 minute
    const expirationDate = new Date();
    expirationDate.setUTCSeconds(expirationDate.getUTCSeconds() + expirationTimeInSeconds);

    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: objectKey,
      ContentType: fileType,
    });

    const signedUrl = await getSignedUrl(s3, command, { expiresIn: expirationTimeInSeconds });

    return NextResponse.json({ url: signedUrl });
  } catch (error) {
    console.error("Error generating pre-signed URL:", error);
    return NextResponse.json(
      { error: "Failed to generate pre-signed URL", details: error },
      { status: 500 }
    );
  }
}