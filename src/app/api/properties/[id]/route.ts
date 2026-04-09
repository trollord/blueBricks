import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const property = await prisma.property.findUnique({
    where: { id, status: "ACTIVE" },
    select: {
      id: true,
      title: true,
      description: true,
      type: true,
      listingType: true,
      status: true,
      building: true,
      address: true,
      locality: true,
      bedrooms: true,
      bathrooms: true,
      areaSqft: true,
      floor: true,
      totalFloors: true,
      furnished: true,
      amenities: true,
      price: true,
      deposit: true,
      latitude: true,
      longitude: true,
      createdAt: true,
      updatedAt: true,
      // flatNumber intentionally excluded from public detail
      images: {
        select: { id: true, url: true, s3Key: true, isPrimary: true },
        orderBy: { isPrimary: "desc" },
      },
      priceHistory: {
        select: { price: true, recordedAt: true, source: true },
        orderBy: { recordedAt: "asc" },
      },
      owner: {
        select: { id: true, name: true, image: true },
        // phone/email excluded — only returned after payment
      },
      _count: { select: { inquiries: true } },
    },
  });

  if (!property) {
    return NextResponse.json({ error: "Property not found" }, { status: 404 });
  }

  return NextResponse.json({ property });
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const property = await prisma.property.findUnique({
    where: { id },
    select: { ownerId: true, status: true, price: true },
  });

  if (!property) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const canEdit =
    property.ownerId === session.user.id ||
    ["ADMIN"].includes(session.user.role);

  if (!canEdit) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json();

  const updated = await prisma.property.update({
    where: { id },
    data: { ...body, status: "PENDING" }, // Re-triggers verification
    select: { id: true, status: true },
  });

  // Track price change
  if (body.price && body.price !== property.price) {
    await prisma.priceHistory.create({
      data: { propertyId: id, price: body.price, source: "LISTING" },
    });
  }

  return NextResponse.json({ property: updated });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const property = await prisma.property.findUnique({
    where: { id },
    select: { ownerId: true },
  });

  if (!property) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (property.ownerId !== session.user.id && session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await prisma.property.update({
    where: { id },
    data: { status: "INACTIVE" },
  });

  return NextResponse.json({ message: "Property deactivated" });
}
