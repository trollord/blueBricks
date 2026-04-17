import Link from "next/link";
import { SITE_NAME } from "@/lib/constants";

export default function Footer() {
  return (
    <footer className="bg-[#111111] text-white">
      <div className="max-w-6xl mx-auto px-6 sm:px-8 py-16 sm:py-20">

        {/* Main grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10 md:gap-12">

          {/* Brand — full width on mobile, 2 cols on md+ */}
          <div className="sm:col-span-2">
            <Link href="/" className="inline-flex items-center gap-1.5 group mb-5">
              <span className="font-bold text-xl tracking-tight text-white">
                Hiranandani<span className="text-white/60">Homes</span>
              </span>
              <span className="h-1.5 w-1.5 rounded-full bg-white/40 mt-1 group-hover:scale-125 transition-transform duration-300" />
            </Link>
            <p className="text-white/40 text-sm leading-relaxed max-w-xs">
              Exclusively serving Hiranandani Estate, Thane. Completely free for
              owners and seekers alike. Zero brokerage, no middlemen.
            </p>
            <div className="flex items-center gap-3 mt-6">
              <div className="h-px w-6 bg-white/20" />
              <span className="text-white/30 text-[10px] tracking-[0.14em] uppercase font-medium">
                Hiranandani Estate, Thane
              </span>
            </div>
          </div>

          {/* Explore */}
          <div>
            <h4 className="text-[10px] font-bold uppercase tracking-[0.14em] text-white/35 mb-5">
              Explore
            </h4>
            <ul className="space-y-3">
              {[
                { href: "/listings?listingType=RENT", label: "Properties for Rent" },
                { href: "/listings?listingType=SALE", label: "Properties for Sale" },
                { href: "/listings?type=FLAT",        label: "Flats & Apartments" },
                { href: "/listings?type=VILLA",       label: "Villas" },
                { href: "/listings?type=OFFICE",      label: "Office Spaces" },
              ].map(({ href, label }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="text-sm text-white/45 hover:text-white transition-colors duration-200"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-[10px] font-bold uppercase tracking-[0.14em] text-white/35 mb-5">
              Company
            </h4>
            <ul className="space-y-3">
              {[
                { href: "/how-it-works",    label: "How It Works" },
                { href: "/dashboard/new",   label: "List Your Property" },
                { href: "/listings",        label: "Browse All Listings" },
              ].map(({ href, label }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="text-sm text-white/45 hover:text-white transition-colors duration-200"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/8 mt-14 pt-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-white/25">
            © {new Date().getFullYear()} {SITE_NAME}. All rights reserved.
          </p>
          <p className="text-xs text-white/25">
            Real Estate Advisors · Zero Broker Commission
          </p>
        </div>

      </div>
    </footer>
  );
}
