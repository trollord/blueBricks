import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { parseAmenities } from "@/lib/utils/formatters";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session || !["MANAGER", "ADMIN"].includes(session.user.role ?? "")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const isAdmin = session.user.role === "ADMIN";

  const property = await prisma.property.findUnique({
    where: { id },
    select: {
      id: true,
      title: true,
      description: true,
      type: true,
      listingType: true,
      status: true,
      building: true,
      flatNumber: isAdmin,
      address: isAdmin,
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
      createdAt: true,
      images: {
        select: { id: true, url: true, isPrimary: true },
        orderBy: { isPrimary: "desc" },
      },
      owner: {
        select: {
          id: true,
          name: true,
          email: isAdmin,
          phone: isAdmin,
        },
      },
    },
  });

  if (!property) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({
    property: { ...property, amenities: parseAmenities(property.amenities) },
    isAdmin,
  });
}
