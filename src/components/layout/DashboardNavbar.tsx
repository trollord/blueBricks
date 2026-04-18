"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { LayoutDashboard, Shield } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function DashboardNavbar() {
  const { data: session } = useSession();
  const router = useRouter();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-100 h-[60px] flex items-center justify-between px-6 lg:px-8">
      {/* Logo */}
      <Link href="/" className="flex items-center gap-1.5 group shrink-0">
        <span className="font-bold text-xl tracking-tight text-[#1A1A1A]">
          Hiranandani<span className="text-[#1A1A1A]">Homes</span>
        </span>
        <span className="h-1.5 w-1.5 rounded-full mt-1 bg-[#1A1A1A] group-hover:scale-125 transition-transform duration-300" />
      </Link>

      {/* Nav links */}
      <nav className="hidden md:flex items-center gap-6">
        <Link
          href="/listings"
          className="text-sm font-medium text-gray-500 hover:text-[#1A1A1A] transition-colors"
        >
          Listings
        </Link>
        <Link
          href="/how-it-works"
          className="text-sm font-medium text-gray-500 hover:text-[#1A1A1A] transition-colors"
        >
          How It Works
        </Link>
      </nav>

      {/* User menu */}
      {session && (
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <button className="flex items-center gap-2 rounded-full focus:outline-none focus:ring-2 focus:ring-[#1A1A1A]/50">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={session.user?.image ?? undefined} />
                  <AvatarFallback className="text-xs font-semibold bg-gray-100 text-[#1A1A1A]">
                    {session.user?.name?.charAt(0)?.toUpperCase() ?? "U"}
                  </AvatarFallback>
                </Avatar>
              </button>
            }
          />
          <DropdownMenuContent align="end" className="w-48">
            <div className="px-2 py-1.5">
              <p className="text-sm font-medium truncate text-[#1A1A1A]">
                {session.user?.name}
              </p>
              <p className="text-xs text-gray-400 truncate">
                {session.user?.email}
              </p>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="cursor-pointer"
              onClick={() => router.push("/dashboard")}
            >
              <LayoutDashboard className="mr-2 h-4 w-4" />
              My Dashboard
            </DropdownMenuItem>
            {["MANAGER", "ADMIN"].includes(session.user?.role ?? "") && (
              <DropdownMenuItem
                className="cursor-pointer"
                onClick={() => router.push("/admin")}
              >
                <Shield className="mr-2 h-4 w-4" />
                Admin Panel
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-red-600 cursor-pointer"
              onClick={() => signOut({ callbackUrl: "/" })}
            >
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </header>
  );
}
