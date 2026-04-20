"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  PlusCircle,
  MessageSquare,
  Heart,
  ArrowLeft,
} from "lucide-react";
import ListPropertyButton from "@/components/dashboard/ListPropertyButton";

const ownerNavItems = [
  { href: "/dashboard",           label: "My Listings", icon: LayoutDashboard },
  { href: "/dashboard/new",       label: "Add Listing",  icon: PlusCircle },
  { href: "/dashboard/inquiries", label: "Inquiries",    icon: MessageSquare },
];

const userNavItems = [
  { href: "/dashboard/interests", label: "My Interests", icon: Heart },
];

const ROLE_LABEL: Record<string, string> = {
  USER:  "Member",
  OWNER: "Owner",
  ADMIN: "Admin",
};

interface Props {
  name: string | null | undefined;
  email: string | null | undefined;
  role: string;
  isOwnerPlus: boolean;
}

export default function DashboardSidebar({ name, email, role, isOwnerPlus }: Props) {
  const pathname = usePathname();
  const navItems = isOwnerPlus ? ownerNavItems : userNavItems;
  const initial  = (name ?? email ?? "U").charAt(0).toUpperCase();

  return (
    <aside className="w-64 shrink-0 bg-white border-r border-gray-100 flex flex-col min-h-[calc(100vh-60px)]">

      {/* User section */}
      <div className="px-6 py-7 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-full bg-[#0B0B0C] flex items-center justify-center shrink-0">
            <span className="text-sm font-semibold text-white">{initial}</span>
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-[#0B0B0C] truncate">
              {name ?? email ?? "User"}
            </p>
            <p className="text-[11px] tracking-[0.15em] uppercase text-[#1A1A1A]/40 mt-0.5">
              {ROLE_LABEL[role] ?? role}
            </p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        <p className="text-[9px] font-semibold tracking-[0.25em] uppercase text-[#1A1A1A]/30 px-3 mb-3">
          Navigation
        </p>

        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                isActive
                  ? "bg-[#0B0B0C] text-white"
                  : "text-[#1A1A1A]/50 hover:text-[#0B0B0C] hover:bg-gray-50"
              }`}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
            </Link>
          );
        })}

        {!isOwnerPlus && (
          <div className="pt-2">
            <ListPropertyButton />
          </div>
        )}
      </nav>

      {/* Footer */}
      <div className="px-6 py-5 border-t border-gray-100">
        <Link
          href="/"
          className="flex items-center gap-2 text-xs text-[#1A1A1A]/35 hover:text-[#0B0B0C] transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to site
        </Link>
      </div>
    </aside>
  );
}
