import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Info } from "lucide-react";
import CommunityDirectory from "@/components/community/CommunityDirectory";
import { COMMUNITY_CONTACTS, COMMUNITY_CATEGORIES } from "@/lib/community";

export const metadata: Metadata = {
  title: "Community Directory — Local Vendors & Services in Hiranandani Estate",
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

const verifiedCount = COMMUNITY_CONTACTS.filter((c) => c.verified).length;

export default function CommunityPage() {
  return (
    <div className="pt-24 sm:pt-32 pb-16 sm:pb-24 px-5 sm:px-8">
      <div className="max-w-5xl mx-auto">

        {/* ── Header ──────────────────────────────────────────────────────── */}
        <p className="text-[10px] font-semibold tracking-[0.25em] text-[#1A1A1A]/45 uppercase mb-3">
          Community
        </p>
        <h1 className="font-[family-name:var(--font-playfair)] text-3xl sm:text-5xl font-bold text-[#0B0B0C] mb-4">
          The Estate Directory
        </h1>
        <p className="text-[#1A1A1A]/55 text-sm sm:text-base leading-relaxed max-w-2xl mb-8 sm:mb-10">
          Phone numbers for the people who keep Hiranandani Estate running —
          carpenters, plumbers, electricians, shopkeepers, tiffin services and
          more. Search by trade or name, then call or WhatsApp them directly.
        </p>

        {/* ── Stats strip ─────────────────────────────────────────────────── */}
        <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-8 sm:mb-10">
          <Stat value={String(COMMUNITY_CONTACTS.length)} label="Listings" />
          <Stat value={String(COMMUNITY_CATEGORIES.length)} label="Categories" />
          <Stat value={String(verifiedCount)} label="Verified" />
        </div>

        {/* ── Directory ───────────────────────────────────────────────────── */}
        <CommunityDirectory />

        {/* ── Sample-data notice ──────────────────────────────────────────── */}
        <p className="flex items-start gap-2 text-[11px] sm:text-xs text-[#1A1A1A]/40 leading-relaxed mt-10 sm:mt-14">
          <Info className="w-3.5 h-3.5 shrink-0 mt-px" />
          <span>
            This directory currently shows sample entries — names and phone
            numbers are placeholders while we collect and verify real listings
            from residents. BlueBricks does not employ or endorse the vendors
            listed here; please verify credentials before hiring.
          </span>
        </p>

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
            us their details and we will verify and list them for the rest of
            the estate.
          </p>
          <Link
            href="/how-it-works"
            className="inline-flex items-center gap-2 bg-white text-[#1A1A1A] px-6 py-3 rounded-xl text-xs sm:text-sm font-bold uppercase tracking-widest hover:opacity-90 transition-opacity"
          >
            Get in touch
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}

/* ─── Stat tile ───────────────────────────────────────────────────────────── */
function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl px-4 py-4 sm:px-6 sm:py-5">
      <p className="text-2xl sm:text-3xl font-extrabold tracking-tighter text-[#0B0B0C]">
        {value}
      </p>
      <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-[0.12em] text-[#1A1A1A]/40 mt-1">
        {label}
      </p>
    </div>
  );
}
