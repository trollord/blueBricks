import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: propertyId } = await params;
  const seekerId = session.user.id;

  // Check if property exists and get ownerId
  const property = await prisma.property.findUnique({
    where: { id: propertyId, status: "ACTIVE" },
    select: { id: true, ownerId: true },
  });
  if (!property) {
    return NextResponse.json({ error: "Property not found" }, { status: 404 });
  }

  // Cannot inquire on own property
  if (property.ownerId === seekerId) {
    return NextResponse.json({ error: "Cannot inquire on your own property" }, { status: 400 });
  }

  // Upsert: return existing or create new inquiry with PENDING status
  const existing = await prisma.inquiry.findUnique({
    where: { propertyId_seekerId: { propertyId, seekerId } },
  });

  if (existing) {
    return NextResponse.json({ success: true, inquiryId: existing.id });
  }

  const inquiry = await prisma.inquiry.create({
    data: { propertyId, seekerId, status: "PENDING" },
  });

  return NextResponse.json({ success: true, inquiryId: inquiry.id });
}
