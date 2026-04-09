import { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const properties = await prisma.property.findMany({
    where: { status: "ACTIVE" },
    select: { id: true, updatedAt: true },
  });

  const base = process.env.NEXTAUTH_URL ?? "https://hiranandanihomes.in";

  return [
    { url: base, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    { url: `${base}/listings`, lastModified: new Date(), changeFrequency: "hourly", priority: 0.9 },
    { url: `${base}/how-it-works`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    ...properties.map((p) => ({
      url: `${base}/listings/${p.id}`,
      lastModified: p.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
  ];
}
