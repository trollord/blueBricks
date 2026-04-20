import { S3Client, DeleteObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const MAX_FILE_SIZE_BYTES = 8 * 1024 * 1024; // 8 MB

export const s3 = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export async function getPresignedUploadUrl(
  key: string,
  contentType: string
): Promise<string> {
  const command = new PutObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET_NAME!,
    Key: key,
    ContentType: contentType,
    // Bucket policy enforces the hard size cap — this is a belt-and-suspenders label
    Metadata: { "max-size": String(MAX_FILE_SIZE_BYTES) },
  });
  // Presigned URL expires in 5 minutes — short window reduces abuse
  return getSignedUrl(s3, command, { expiresIn: 300 });
}

export async function deleteS3Object(key: string): Promise<void> {
  await s3.send(
    new DeleteObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET_NAME!,
      Key: key,
    })
  );
}

export function getS3Url(key: string): string {
  return `${process.env.NEXT_PUBLIC_AWS_S3_BUCKET_URL}/${key}`;
}
