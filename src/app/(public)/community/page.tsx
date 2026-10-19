import type { Metadata } from "next";
import { Info } from "lucide-react";
import { prisma } from "@/lib/prisma";
import CommunityDirectory from "@/components/community/CommunityDirectory";
import AddContactModal from "@/components/community/AddContactModal";
import { type DbCommunityContact } from "@/lib/community";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Community Directory - Local Vendors & Services in Hiranandani Estate",
  description:
    "Phone numbers and contact details for carpenters, plumbers, electricians, shopkeepers, tiffin services and other trusted local vendors serving Hiranandani Estate, Thane.",
  keywords: [
    "carpenter in Hiranandani Estate",
    "plumber Hiranandani Estate Thane",
    "electrician Hiranandani Estate",
    "local services Hiranandani Estate",
    "shops in Hiranandani Estate Thane",
    "tiffin service Hiranandani Estate",
    "pest control Thane",
  ],
  alternates: { canonical: "/community" },
};

export default async function CommunityPage() {
  const raw = await prisma.communityContact.findMany({
    where: { status: "ACTIVE" },
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      name: true,
      contactPerson: true,
      category: true,
      service: true,
      phone: true,
      whatsapp: true,
      locality: true,
      address: true,
      hours: true,
      tags: true,
      verified: true,
      createdAt: true,
    },
  });

  const dbContacts: DbCommunityContact[] = raw.map((c) => ({
    ...c,
    contactPerson: c.contactPerson ?? null,
  }));

  const isUsingSampleData = dbContacts.length === 0;

  return (
    <div className="pt-24 sm:pt-32 pb-16 sm:pb-24 px-5 sm:px-8">
      <div className="max-w-5xl mx-auto">

        {/* ── Header ──────────────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 sm:mb-10">
          <div>
            <p className="text-[10px] font-semibold tracking-[0.25em] text-[#1A1A1A]/45 uppercase mb-3">
              Community
            </p>
            <h1 className="font-[family-name:var(--font-playfair)] text-3xl sm:text-5xl font-bold text-[#0B0B0C] mb-4">
              The Community Directory
            </h1>
            <p className="text-[#1A1A1A]/55 text-sm sm:text-base leading-relaxed max-w-2xl">
              Phone numbers for carpenters, plumbers, electricians, shopkeepers,
              tiffin services and more. Search by trade or name, then call or
              WhatsApp them directly.
            </p>
          </div>
          <div className="shrink-0">
            <AddContactModal />
          </div>
        </div>

        {/* ── Directory ───────────────────────────────────────────────────── */}
        <CommunityDirectory dbContacts={dbContacts} />

        {/* ── Sample-data notice (only when no real data) ─────────────────── */}
        {isUsingSampleData && (
          <p className="flex items-start gap-2 text-[11px] sm:text-xs text-[#1A1A1A]/40 leading-relaxed mt-10 sm:mt-14">
            <Info className="w-3.5 h-3.5 shrink-0 mt-px" />
            <span>
              This directory currently shows sample entries - names and phone
              numbers are placeholders while we collect and verify real listings
              from residents. Sanatani Community does not employ or endorse the vendors
              listed here; please verify credentials before hiring.
            </span>
          </p>
        )}

        {/* ── CTA ─────────────────────────────────────────────────────────── */}
        <div className="bg-[#111111] rounded-2xl p-6 sm:p-10 mt-8 sm:mt-10">
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-white/35 mb-3">
            Know someone reliable?
          </p>
          <h2 className="font-[family-name:var(--font-playfair)] text-xl sm:text-3xl font-bold text-white mb-3">
            Add a vendor to the directory
          </h2>
          <p className="text-white/45 text-xs sm:text-sm leading-relaxed max-w-lg mb-6">
            If you have a carpenter, electrician or shopkeeper you trust, send
            us their details and we will verify and list them for the
            community.
          </p>
          <AddContactModal />
        </div>
      </div>
    </div>
  );
}
