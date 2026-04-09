export const dynamic = "force-dynamic";

import Link from "next/link";
import { prisma } from "@/lib/prisma";
import SearchBar from "@/components/search/SearchBar";
import PropertyCard from "@/components/property/PropertyCard";
import { Button } from "@/components/ui/button";
import {
  ShieldCheck,
  BadgeIndianRupee,
  Clock,
  ArrowRight,
  TrendingUp,
  UserCheck,
} from "lucide-react";
import { SITE_NAME } from "@/lib/constants";

async function getHomeData() {
  const [featured, stats] = await Promise.all([
    prisma.property.findMany({
      where: { status: "ACTIVE" },
      orderBy: { createdAt: "desc" },
      take: 6,
      select: {
        id: true,
        title: true,
        type: true,
        listingType: true,
        locality: true,
        building: true,
        bedrooms: true,
        areaSqft: true,
        furnished: true,
        price: true,
        deposit: true,
        images: {
          select: { id: true, url: true, isPrimary: true },
          orderBy: { isPrimary: "desc" },
          take: 1,
        },
      },
    }),
    Promise.all([
      prisma.property.count({ where: { status: "ACTIVE" } }),
      prisma.inquiry.count({ where: { status: "COMPLETED" } }),
      prisma.user.count({ where: { role: "OWNER" } }),
    ]),
  ]);

  return { featured, stats };
}

export default async function HomePage() {
  const { featured, stats } = await getHomeData();
  const [activeListings, completedDeals, owners] = stats;

  return (
    <div>
      {/* ── HERO ── */}
      <section className="relative min-h-screen flex items-center bg-gradient-to-br from-[#0F2244] via-[#0F2244] to-[#1a3a6e] text-white overflow-hidden">
        {/* Subtle pattern overlay */}
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23C9A96E' fill-opacity='1' fill-rule='evenodd'%3E%3Cpath d='M0 0h40v40H0V0zm40 40h40v40H40V40zm0-40h2l-2 2V0zm0 4l4-4h2l-6 6V4zm0 4l8-8h2L40 10V8zm0 4L52 0h2L40 14v-2zm0 4L56 0h2L40 18v-2zm0 4L60 0h2L40 22v-2zm0 4L64 0h2L40 26v-2zm0 4L68 0h2L40 30v-2zm0 4L72 0h2L40 34v-2zm0 4L76 0h2L40 38v-2zm0 4L80 0v2L42 40h-2zm4 0L80 4v2L46 40h-2zm4 0L80 8v2L50 40h-2zm4 0L80 12v2L54 40h-2zm4 0L80 16v2L58 40h-2zm4 0L80 20v2L62 40h-2zm4 0L80 24v2L66 40h-2zm4 0L80 28v2L70 40h-2zm4 0L80 32v2L74 40h-2zm4 0L80 36v2L78 40h-2zm4 0L80 40h-2' /%3E%3C/g%3E%3C/svg%3E\")",
          }}
        />

        <div className="container mx-auto px-4 py-24 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            {/* Gold badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#C9A96E]/40 bg-[#C9A96E]/10 text-[#C9A96E] text-sm font-medium mb-8">
              <span className="h-1.5 w-1.5 rounded-full bg-[#C9A96E]" />
              Exclusively Hiranandani Estate, Thane
            </div>

            <h1 className="font-[family-name:var(--font-playfair)] text-5xl sm:text-6xl lg:text-7xl font-bold leading-tight mb-6 text-white">
              Discover Exceptional
              <span className="block text-[#C9A96E] mt-1">
                Living in Hiranandani Estate
              </span>
            </h1>

            {/* Gold divider */}
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="h-px w-16 bg-[#C9A96E]/40" />
              <div className="h-1.5 w-1.5 rounded-full bg-[#C9A96E]" />
              <div className="h-px w-16 bg-[#C9A96E]/40" />
            </div>

            <p className="text-white/80 text-lg sm:text-xl mb-4 max-w-2xl mx-auto leading-relaxed">
              Browse verified listings, register interest for free, and connect directly with owners.
              No broker fees. No commissions. Completely free.
            </p>
            <p className="text-white/50 text-sm mb-12">
              Trusted Real Estate Advisors · Fully Verified Listings · Zero Brokerage
            </p>

            {/* Search bar */}
            <SearchBar />
          </div>
        </div>
      </section>

      {/* ── TRUST BAR ── */}
      <section className="bg-white border-b border-[#0F2244]/8 py-3">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-2 text-xs font-medium text-[#0F2244]/70">
            {[
              { icon: ShieldCheck, text: "Every listing manually verified" },
              { icon: UserCheck, text: "Only property owners can list" },
              { icon: BadgeIndianRupee, text: "No brokers. No agents. Ever." },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-1.5">
                <Icon className="h-3.5 w-3.5 text-[#C9A96E]" />
                <span>{text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── STATS BAR ── */}
      <section className="bg-[#0F2244] py-10">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap justify-center gap-12 sm:gap-20 text-center">
            {[
              { value: `${activeListings}+`, label: "Active Listings" },
              { value: `${completedDeals}+`, label: "Deals Closed" },
              { value: `${owners}+`, label: "Verified Owners" },
              { value: "Free", label: "Always Free" },
            ].map(({ value, label }) => (
              <div key={label}>
                <p className="text-3xl sm:text-4xl font-bold text-[#C9A96E] font-[family-name:var(--font-playfair)]">
                  {value}
                </p>
                <p className="text-white/60 text-sm mt-1">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── WHY US ── */}
      <section className="py-24 bg-[#FAF8F5]">
        <div className="container mx-auto px-4">
          <div className="text-center mb-14">
            <p className="text-[#C9A96E] text-sm font-medium uppercase tracking-widest mb-3">
              Our Difference
            </p>
            <h2 className="font-[family-name:var(--font-playfair)] text-3xl sm:text-4xl font-bold text-[#0F2244] mb-4">
              Why Choose {SITE_NAME}?
            </h2>
            <p className="text-gray-500 max-w-xl mx-auto">
              We&apos;re not brokers — we&apos;re Real Estate Advisors. Transparent, fair, and always on your side.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: BadgeIndianRupee,
                title: "Completely Free",
                desc: "Browse listings, register interest, and get owner contact details — all completely free. No charges, ever.",
              },
              {
                icon: ShieldCheck,
                title: "Verified Listings",
                desc: "Every listing is reviewed by our team before going live. Only verified property owners can list — no brokers, no agents, no middlemen.",
              },
              {
                icon: Clock,
                title: "Instant Access",
                desc: "Get the owner's direct contact the moment you register interest — no delays, no middlemen.",
              },
              {
                icon: TrendingUp,
                title: "Price Transparency",
                desc: "View historical price trends for every property so you always know the fair market value.",
              },
            ].map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-lg transition-all duration-300 border border-[#0F2244]/5 group"
              >
                <div className="inline-flex p-3 rounded-xl bg-[#0F2244]/5 mb-5 group-hover:bg-[#C9A96E]/10 transition-colors duration-300">
                  <Icon className="h-6 w-6 text-[#C9A96E]" />
                </div>
                <h3 className="font-semibold text-[#0F2244] mb-2 text-lg">{title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURED LISTINGS ── */}
      {featured.length > 0 && (
        <section className="py-24">
          <div className="container mx-auto px-4">
            <div className="flex items-end justify-between mb-10">
              <div>
                <p className="text-[#C9A96E] text-sm font-medium uppercase tracking-widest mb-2">
                  Fresh Properties
                </p>
                <h2 className="font-[family-name:var(--font-playfair)] text-3xl sm:text-4xl font-bold text-[#0F2244]">
                  Latest Listings
                </h2>
              </div>
              <Link href="/listings">
                <Button
                  variant="outline"
                  className="gap-2 hidden sm:flex border-[#0F2244] text-[#0F2244] hover:bg-[#0F2244] hover:text-white transition-all duration-300"
                >
                  View All
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {featured.map((p) => (
                <PropertyCard key={p.id} property={p} />
              ))}
            </div>
            <div className="mt-10 text-center sm:hidden">
              <Link href="/listings">
                <Button variant="outline" className="gap-2 border-[#0F2244] text-[#0F2244]">
                  View All Listings <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ── HOW IT WORKS ── */}
      <section className="py-24 bg-[#FAF8F5]">
        <div className="container mx-auto px-4">
          <div className="text-center mb-14">
            <p className="text-[#C9A96E] text-sm font-medium uppercase tracking-widest mb-3">
              Simple Process
            </p>
            <h2 className="font-[family-name:var(--font-playfair)] text-3xl sm:text-4xl font-bold text-[#0F2244] mb-3">
              How It Works
            </h2>
            <p className="text-gray-500">Transparent, fast, and completely fair.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-10 max-w-3xl mx-auto">
            {[
              {
                step: "1",
                title: "Browse & Find",
                desc: "Search verified listings by locality, BHK, budget, and type.",
              },
              {
                step: "2",
                title: "Register Interest — Free",
                desc: "Register your interest for free. Owner contact details are revealed instantly.",
              },
              {
                step: "3",
                title: "Visit & Move In",
                desc: "Meet the owner directly, visit the property, agree on terms, and move in. No fees, no middlemen.",
              },
            ].map(({ step, title, desc }) => (
              <div key={step} className="text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#C9A96E] text-[#0F2244] font-bold text-xl mx-auto mb-5 shadow-lg">
                  {step}
                </div>
                <h3 className="font-semibold text-[#0F2244] mb-2 text-lg">{title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-12">
            <Link href="/how-it-works">
              <Button
                variant="outline"
                className="gap-2 border-[#0F2244] text-[#0F2244] hover:bg-[#0F2244] hover:text-white transition-all duration-300"
              >
                Learn More <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── LIST YOUR PROPERTY CTA ── */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="rounded-2xl bg-[#0F2244] text-white p-12 sm:p-16 flex flex-col sm:flex-row items-center justify-between gap-8 relative overflow-hidden">
            {/* Gold accent top-right */}
            <div className="absolute top-0 right-0 h-32 w-32 bg-[#C9A96E]/10 rounded-full translate-x-1/3 -translate-y-1/3" />
            <div className="absolute bottom-0 left-0 h-24 w-24 bg-[#C9A96E]/5 rounded-full -translate-x-1/3 translate-y-1/3" />
            <div className="relative z-10">
              <p className="text-[#C9A96E] text-sm font-medium uppercase tracking-widest mb-3">
                For Property Owners
              </p>
              <h2 className="font-[family-name:var(--font-playfair)] text-3xl font-bold mb-3">
                Own a Property in Hiranandani?
              </h2>
              <p className="text-white/70 max-w-md leading-relaxed">
                List it for free. We handle verification and connect you with serious buyers or tenants — no commission taken from you.
              </p>
            </div>
            <Link href="/register" className="relative z-10 shrink-0">
              <Button className="bg-[#C9A96E] hover:bg-[#C9A96E]/90 text-[#0F2244] font-semibold px-8 py-5 text-base transition-all duration-300">
                List for Free
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
