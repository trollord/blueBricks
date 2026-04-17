"use client";

import { useState } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { PlusSquare, LayoutDashboard, Shield } from "lucide-react";
import BecomeOwnerModal from "@/components/property/BecomeOwnerModal";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Navbar,
  NavBody,
  NavItems,
  NavbarLogo,
  NavbarButton,
  MobileNav,
  MobileNavHeader,
  MobileNavToggle,
  MobileNavMenu,
  useNavbar,
} from "@/components/ui/resizable-navbar";

const navItems = [
  { name: "Listings", link: "/listings" },
  { name: "How It Works", link: "/how-it-works" },
];

/* ─── Avatar dropdown ─────────────────────────────────────────────────────── */
function UserMenu() {
  const { data: session } = useSession();
  const router = useRouter();
  const { scrolled } = useNavbar();

  if (!session) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <button className="flex items-center gap-2 rounded-full focus:outline-none focus:ring-2 focus:ring-[#C9A96E]/50">
            <Avatar className="h-8 w-8">
              <AvatarImage src={session.user?.image ?? undefined} />
              <AvatarFallback
                className="text-xs font-semibold"
                style={{
                  background: scrolled ? "rgba(255,255,255,0.12)" : "rgba(26,26,26,0.08)",
                  color: scrolled ? "#ffffff" : "#1A1A1A",
                }}
              >
                {session.user?.name?.charAt(0)?.toUpperCase() ?? "U"}
              </AvatarFallback>
            </Avatar>
          </button>
        }
      />
      <DropdownMenuContent align="end" className="w-48">
        <div className="px-2 py-1.5">
          <p className="text-sm font-medium truncate text-[#0F2244]">
            {session.user?.name}
          </p>
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
  );
}

/* ─── Main Navbar export ──────────────────────────────────────────────────── */

export default function SiteNavbar({ forceScrolled = false }: { forceScrolled?: boolean }) {
  const { data: session } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [ownerModalOpen, setOwnerModalOpen] = useState(false);

  const isOwnerPlus = ["OWNER", "MANAGER", "ADMIN"].includes(
    session?.user?.role ?? ""
  );

  // If logged in as OWNER+ → go straight to /dashboard/new
  // If logged in as USER   → open the become-owner modal
  // If not logged in       → go to /register
  function handleListProperty() {
    if (!session) {
      window.location.href = "/register";
      return;
    }
    if (isOwnerPlus) {
      window.location.href = "/dashboard/new";
    } else {
      setOwnerModalOpen(true);
    }
  }

  return (
    <>
      <BecomeOwnerModal
        open={ownerModalOpen}
        onClose={() => setOwnerModalOpen(false)}
      />

      <Navbar forceScrolled={forceScrolled}>
        {/* ── Desktop ── */}
        <NavBody>
          <NavbarLogo />
          <NavItems items={navItems} />
          <div className="flex items-center gap-3">
            {session ? (
              <>
                <NavbarButton variant="primary" onClick={handleListProperty}>
                  <PlusSquare className="h-4 w-4 mr-1.5" />
                  List Property
                </NavbarButton>
                <UserMenu />
              </>
            ) : (
              <>
                <NavbarButton variant="secondary" href="/login">
                  Sign In
                </NavbarButton>
                <NavbarButton variant="primary" href="/register">
                  List Property
                </NavbarButton>
              </>
            )}
          </div>
        </NavBody>

        {/* ── Mobile ── */}
        <MobileNav>
          <MobileNavHeader>
            <NavbarLogo />
            <div className="flex items-center gap-3">
              {session && <UserMenu />}
              <MobileNavToggle
                isOpen={mobileOpen}
                onClick={() => setMobileOpen((v) => !v)}
              />
            </div>
          </MobileNavHeader>

          <MobileNavMenu
            isOpen={mobileOpen}
            onClose={() => setMobileOpen(false)}
          >
            {navItems.map((item) => (
              <MobileNavLink
                key={item.link}
                href={item.link}
                onClick={() => setMobileOpen(false)}
              >
                {item.name}
              </MobileNavLink>
            ))}

            {session ? (
              <button
                onClick={() => {
                  setMobileOpen(false);
                  handleListProperty();
                }}
                className="flex items-center gap-2 px-1 py-2.5 text-sm font-medium text-[#C9A96E]"
              >
                <PlusSquare className="h-4 w-4" />
                List a Property
              </button>
            ) : (
              <div className="flex flex-col gap-3 pt-3 mt-1">
                <NavbarButton
                  variant="secondary"
                  href="/login"
                  className="w-full"
                  onClick={() => setMobileOpen(false)}
                >
                  Sign In
                </NavbarButton>
                <NavbarButton
                  variant="primary"
                  href="/register"
                  className="w-full"
                  onClick={() => setMobileOpen(false)}
                >
                  List Property
                </NavbarButton>
              </div>
            )}
          </MobileNavMenu>
        </MobileNav>
      </Navbar>
    </>
  );
}

/* ─── MobileNavLink helper ────────────────────────────────────────────────── */
function MobileNavLink({
  href,
  onClick,
  children,
}: {
  href: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  const { scrolled } = useNavbar();
  return (
    <Link
      href={href}
      onClick={onClick}
      className="block px-1 py-3 text-sm font-medium transition-colors duration-200 border-b"
      style={{
        color: scrolled ? "rgba(255,255,255,0.8)" : "#1A1A1A",
        borderColor: scrolled
          ? "rgba(255,255,255,0.08)"
          : "rgba(26,26,26,0.07)",
      }}
    >
      {children}
    </Link>
  );
}
