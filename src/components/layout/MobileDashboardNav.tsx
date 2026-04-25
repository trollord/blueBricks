"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, PlusCircle, MessageSquare, Heart, ArrowLeft } from "lucide-react";

const ownerItems = [
  { href: "/dashboard",           label: "Listings",   icon: LayoutDashboard },
  { href: "/dashboard/new",       label: "Add",        icon: PlusCircle },
  { href: "/dashboard/inquiries", label: "Inquiries",  icon: MessageSquare },
  { href: "/",                    label: "Back",        icon: ArrowLeft },
];

const userItems = [
  { href: "/dashboard/interests", label: "Interests",  icon: Heart },
  { href: "/",                    label: "Back",        icon: ArrowLeft },
];

export default function MobileDashboardNav({ isOwnerPlus }: { isOwnerPlus: boolean }) {
  const pathname = usePathname();
  const items = isOwnerPlus ? ownerItems : userItems;

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-100 flex items-center">
      {items.map(({ href, label, icon: Icon }) => {
        const isActive = pathname === href && href !== "/";
        return (
          <Link
            key={href}
            href={href}
            className={`flex-1 flex flex-col items-center justify-center gap-1 py-3 text-[10px] font-semibold tracking-wide transition-colors ${
              isActive
                ? "text-[#0B0B0C]"
                : "text-[#1A1A1A]/35 hover:text-[#0B0B0C]"
            }`}
          >
            <Icon className={`h-5 w-5 ${isActive ? "stroke-[2.5]" : "stroke-[1.5]"}`} />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
