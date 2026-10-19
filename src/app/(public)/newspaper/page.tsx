import type { Metadata } from "next";
import Link from "next/link";
import { FileText, Calendar, Download } from "lucide-react";
import { prisma } from "@/lib/prisma";
import NewsViewer from "@/components/newspaper/NewsViewer";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Newspaper - Hiranandani Estate Weekly",
  description: "Read the latest weekly newspaper for Hiranandani Estate residents.",
  alternates: { canonical: "/newspaper" },
};

function fmtDate(d: Date) {
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
}

export default async function NewspaperIndexPage() {
  const editions = await prisma.newsletter.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { date: "desc" },
    select: { id: true, title: true, date: true, pageCount: true },
  });

  const latest = editions[0] ?? null;
  const past   = editions.slice(1);

  return (
    <div className="pt-[60px]">

      {editions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-28 px-4 text-center">
          <FileText className="h-10 w-10 text-[#FF5F15]/20 mb-4" />
          <p className="font-medium text-[#FF5F15]/50">No editions published yet.</p>
          <p className="text-sm text-[#FF5F15]/35 mt-1">Check back soon.</p>
        </div>
      ) : (
        <>
          {/* ── Inline viewer with compact header ───────────────────────── */}
          <NewsViewer
            id={latest!.id}
            title={latest!.title}

            pageCount={latest!.pageCount}
          />

          {/* ── Past Issues ──────────────────────────────────────────────── */}
          {past.length > 0 && (
            <div className="bg-white px-4 sm:px-8 py-10 sm:py-12">
              <div className="max-w-4xl mx-auto">
                <h2 className="text-xs font-bold uppercase tracking-[0.18em] text-[#FF5F15]/40 mb-5">
                  Past Issues
                </h2>
                <div className="space-y-2">
                  {past.map((e) => (
                    <div
                      key={e.id}
                      className="flex items-center gap-3 bg-[#FAFAFA] border border-gray-200
                                 rounded-xl px-4 py-3 sm:px-5 hover:border-gray-300
                                 hover:bg-white hover:shadow-[0_4px_20px_rgba(0,0,0,0.04)] transition-all"
                    >
                      {/* Read link - takes up all available space */}
                      <Link
                        href={`/newspaper/${e.id}`}
                        className="flex items-center gap-3 flex-1 min-w-0 group"
                      >
                        <div className="bg-[#F0F0F0] rounded-lg p-2 shrink-0 group-hover:bg-[#E8E8E8] transition-colors">
                          <FileText className="h-4 w-4 text-[#FF5F15]/55" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-[#FF5F15] text-sm truncate group-hover:text-[#FF5F15] transition-colors">
                            {e.title}
                          </p>
                          <div className="flex items-center gap-1.5 mt-0.5 text-xs text-[#FF5F15]/40">
                            <Calendar className="h-3 w-3 shrink-0" />
                            <span>{fmtDate(e.date)}</span>
                            <span className="text-[#FF5F15]/20">·</span>
                            <span>{e.pageCount}p</span>
                          </div>
                        </div>
                      </Link>

                      {/* Download button - separate action */}
                      <a
                        href={`/api/newspaper/${e.id}?download=1`}
                        download={`${e.title}.pdf`}
                        onClick={(ev) => ev.stopPropagation()}
                        className="shrink-0 p-2 rounded-lg text-[#FF5F15]/35 hover:text-[#FF5F15]
                                   hover:bg-[#EBEBEB] transition-all"
                        title="Download PDF"
                      >
                        <Download className="h-4 w-4" />
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
