import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getPresignedUploadUrl } from "@/lib/s3";
import { randomUUID } from "crypto";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/heic"];

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const filename = searchParams.get("filename");
  const contentType = searchParams.get("contentType");

  if (!filename || !contentType) {
    return NextResponse.json(
      { error: "filename and contentType are required" },
      { status: 400 }
    );
  }

  if (!ALLOWED_TYPES.includes(contentType)) {
    return NextResponse.json(
      { error: "Only JPEG, PNG, WebP, and HEIC images are allowed" },
      { status: 400 }
    );
  }

  const ext = filename.split(".").pop() ?? "jpg";
  const s3Key = `properties/${session.user.id}/${randomUUID()}.${ext}`;

  const presignedUrl = await getPresignedUploadUrl(s3Key, contentType);
  const publicUrl = `${process.env.NEXT_PUBLIC_AWS_S3_BUCKET_URL}/${s3Key}`;

  return NextResponse.json({ presignedUrl, s3Key, publicUrl });
}
