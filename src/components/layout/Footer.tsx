import Link from "next/link";
import { SITE_NAME } from "@/lib/constants";

export default function Footer() {
  return (
    <footer className="bg-[#0F2244] text-white">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="mb-4">
              <span className="font-bold text-2xl text-white">
                Hiranandani<span className="text-[#C9A96E]">Homes</span>
              </span>
            </div>
            <p className="text-white/50 text-sm leading-relaxed max-w-xs">
              Your trusted Real Estate Advisors — exclusively serving Hiranandani Estate, Thane.
              Completely free for owners and seekers alike. Zero brokerage.
            </p>
            <div className="flex items-center gap-3 mt-6">
              <div className="h-px w-8 bg-[#C9A96E]" />
              <span className="text-[#C9A96E] text-xs tracking-widest uppercase">Hiranandani Estate, Thane</span>
            </div>
          </div>

          {/* Explore */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-widest text-[#C9A96E] mb-5">Explore</h4>
            <ul className="space-y-3 text-sm text-white/50">
              {[
                { href: "/listings?listingType=RENT", label: "Properties for Rent" },
                { href: "/listings?listingType=SALE", label: "Properties for Sale" },
                { href: "/listings?type=FLAT", label: "Flats & Apartments" },
                { href: "/listings?type=VILLA", label: "Villas" },
                { href: "/listings?type=OFFICE", label: "Office Spaces" },
              ].map(({ href, label }) => (
                <li key={href}>
                  <Link href={href} className="hover:text-[#C9A96E] transition-colors duration-200">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-widest text-[#C9A96E] mb-5">Company</h4>
            <ul className="space-y-3 text-sm text-white/50">
              {[
                { href: "/how-it-works", label: "How It Works" },
                { href: "/dashboard/new", label: "List Your Property" },
                { href: "/listings", label: "Browse All Listings" },
              ].map(({ href, label }) => (
                <li key={href}>
                  <Link href={href} className="hover:text-[#C9A96E] transition-colors duration-200">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-white/30">
            © {new Date().getFullYear()} {SITE_NAME}. All rights reserved.
          </p>
          <p className="text-xs text-white/30">
            Real Estate Advisors · Zero Broker Commission
          </p>
        </div>
      </div>
    </footer>
  );
}
