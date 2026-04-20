import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Papa from "papaparse";

export const dynamic = "force-dynamic";

interface CSVRow {
  propertyId: string;
  price: string;
  recordedAt: string;
  source: string;
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const { csv } = body as { csv: string };

  if (!csv?.trim()) {
    return NextResponse.json({ error: "No CSV data provided" }, { status: 400 });
  }

  const parsed = Papa.parse<CSVRow>(csv.trim(), {
    header: true,
    skipEmptyLines: true,
  });

  if (parsed.errors.length > 0) {
    return NextResponse.json({ error: "CSV parse error: " + parsed.errors[0].message }, { status: 400 });
  }

  const rows = parsed.data;
  let imported = 0;

  for (const row of rows) {
    const { propertyId, price, recordedAt, source } = row;

    if (!propertyId || !price || !recordedAt) continue;
    if (!["LISTING", "ADMIN_IMPORT"].includes(source)) continue;

    const priceNum = parseFloat(price);
    if (isNaN(priceNum)) continue;

    const recordedDate = new Date(recordedAt);
    if (isNaN(recordedDate.getTime())) continue;

    // Check property exists
    const exists = await prisma.property.findUnique({
      where: { id: propertyId },
      select: { id: true },
    });
    if (!exists) continue;

    await prisma.priceHistory.create({
      data: {
        propertyId,
        price: priceNum,
        recordedAt: recordedDate,
        source: source as "LISTING" | "ADMIN_IMPORT",
      },
    });

    imported++;
  }

  return NextResponse.json({ imported });
}
