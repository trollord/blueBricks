"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, PlusSquare, LayoutDashboard, Shield } from "lucide-react";

export default function Navbar() {
  const { data: session } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  const navLinks = [
    { href: "/listings", label: "Listings" },
    { href: "/how-it-works", label: "How It Works" },
  ];

  return (
    <header
      className={`sticky top-0 z-50 w-full bg-white border-b border-[#0F2244]/10 transition-shadow duration-300 ${
        scrolled ? "shadow-md" : "shadow-none"
      }`}
    >
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <span className="font-bold text-xl text-[#0F2244] tracking-tight">
            Hiranandani
            <span className="text-[#C9A96E]">Homes</span>
          </span>
          <span className="h-1.5 w-1.5 rounded-full bg-[#C9A96E] mt-1 group-hover:scale-125 transition-transform duration-300" />
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm font-medium transition-colors duration-200 ${
                pathname === link.href
                  ? "text-[#0F2244]"
                  : "text-gray-500 hover:text-[#0F2244]"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {session ? (
            <>
              <Link href="/dashboard/new" className="hidden md:block">
                <Button
                  size="sm"
                  className="bg-[#0F2244] hover:bg-[#0F2244]/90 text-white gap-1.5 transition-all duration-300"
                >
                  <PlusSquare className="h-4 w-4" />
                  List Property
                </Button>
              </Link>
              <DropdownMenu>
                <DropdownMenuTrigger render={
                  <button className="flex items-center gap-2 rounded-full focus:outline-none focus:ring-2 focus:ring-[#C9A96E]/50">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={session.user?.image ?? undefined} />
                      <AvatarFallback className="bg-[#0F2244]/10 text-[#0F2244] text-xs font-semibold">
                        {session.user?.name?.charAt(0)?.toUpperCase() ?? "U"}
                      </AvatarFallback>
                    </Avatar>
                  </button>
                } />
                <DropdownMenuContent align="end" className="w-48">
                  <div className="px-2 py-1.5">
                    <p className="text-sm font-medium truncate text-[#0F2244]">{session.user?.name}</p>
                    <p className="text-xs text-gray-400 truncate">{session.user?.email}</p>
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
            </>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost" size="sm" className="text-gray-600 hover:text-[#0F2244]">
                  Sign In
                </Button>
              </Link>
              <Link href="/register">
                <Button
                  size="sm"
                  className="bg-[#0F2244] hover:bg-[#0F2244]/90 text-white transition-all duration-300"
                >
                  List Property
                </Button>
              </Link>
            </>
          )}

          {/* Mobile menu */}
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger
              render={
                <Button variant="ghost" size="icon" className="md:hidden text-[#0F2244]">
                  <Menu className="h-5 w-5" />
                </Button>
              }
            />
            <SheetContent side="right" className="w-72">
              <div className="mb-8 mt-2">
                <span className="font-bold text-xl text-[#0F2244]">
                  Hiranandani<span className="text-[#C9A96E]">Homes</span>
                </span>
              </div>
              <nav className="flex flex-col gap-5">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className="text-base font-medium text-gray-700 hover:text-[#0F2244] transition-colors"
                  >
                    {link.label}
                  </Link>
                ))}
                {session && (
                  <Link
                    href="/dashboard/new"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-2 text-base font-medium text-[#0F2244]"
                  >
                    <PlusSquare className="h-4 w-4" />
                    List a Property
                  </Link>
                )}
                {!session && (
                  <div className="flex flex-col gap-3 pt-4 border-t">
                    <Link href="/login" onClick={() => setMobileOpen(false)}>
                      <Button variant="outline" className="w-full">Sign In</Button>
                    </Link>
                    <Link href="/register" onClick={() => setMobileOpen(false)}>
                      <Button className="w-full bg-[#0F2244] hover:bg-[#0F2244]/90 text-white">
                        Get Started
                      </Button>
                    </Link>
                  </div>
                )}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
