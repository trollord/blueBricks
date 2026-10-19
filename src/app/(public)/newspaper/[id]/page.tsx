import { notFound } from "next/navigation";
import { cache } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import NewsViewer from "@/components/newspaper/NewsViewer";
import { SITE_NAME } from "@/lib/constants";

export const revalidate = 3600;

const getEdition = cache(async (id: string) => {
  return prisma.newsletter.findUnique({
    where: { id, status: "PUBLISHED" },
    select: { id: true, title: true, date: true, pageCount: true },
  });
});

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const e = await getEdition(id);
  if (!e) return { title: "Not found" };
  return {
    title: `${e.title} - ${SITE_NAME}`,
    description: `Read the ${e.title} edition of the ${SITE_NAME} weekly newspaper.`,
    alternates: { canonical: `/newspaper/${e.id}` },
  };
}

export default async function EditionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const edition = await getEdition(id);
  if (!edition) notFound();

  const dateStr = edition.date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="min-h-screen bg-[#E8E8E8] pt-[60px]">
      {/* Breadcrumb strip */}
      <div className="bg-white border-b border-gray-200 px-4 sm:px-5 py-2.5 sm:py-3 flex items-center gap-2 sm:gap-3 min-w-0">
        <Link
          href="/newspaper"
          className="text-xs text-[#FF5F15]/50 hover:text-[#FF5F15] transition-colors shrink-0 font-medium"
        >
          ← All editions
        </Link>
        <span className="text-[#FF5F15]/20 shrink-0">|</span>
        <span className="text-xs text-[#FF5F15]/50 truncate">{dateStr}</span>
      </div>

      <NewsViewer
        id={edition.id}
        title={edition.title}

        pageCount={edition.pageCount}
        extraOffset={40}
      />
    </div>
  );
}
