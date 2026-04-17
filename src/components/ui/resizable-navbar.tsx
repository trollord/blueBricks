"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import Link from "next/link";

/* ─── Context ─────────────────────────────────────────────────────────────── */

interface NavbarCtx {
  scrolled: boolean;
  mobileOpen: boolean;
  setMobileOpen: (v: boolean) => void;
}

const NavbarContext = createContext<NavbarCtx>({
  scrolled: false,
  mobileOpen: false,
  setMobileOpen: () => {},
});

export const useNavbar = () => useContext(NavbarContext);

/* ─── Navbar (root) ──────────────────────────────────────────────────────── */
// At top + closed   → fully transparent, no radius, no shadow
// At top + menu open → #F5F5F5 fill, rounded card, so menu items are readable
// Scrolled          → #111111 floating capsule

export function Navbar({ children, forceScrolled = false }: { children: React.ReactNode; forceScrolled?: boolean }) {
  const [scrolled, setScrolled] = useState(forceScrolled);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (forceScrolled) { setScrolled(true); return; }
    const handler = () => {
      setScrolled(window.scrollY > 40);
      if (window.scrollY > 40) setMobileOpen(false);
    };
    window.addEventListener("scroll", handler, { passive: true });
    handler();
    return () => window.removeEventListener("scroll", handler);
  }, [forceScrolled]);

  const active = scrolled || mobileOpen; // needs a background

  return (
    <NavbarContext.Provider value={{ scrolled, mobileOpen, setMobileOpen }}>
      <div
        className="fixed top-0 left-0 right-0 z-50 flex justify-center transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]"
        style={{
          padding: scrolled
            ? "clamp(8px,1.5vw,12px) clamp(12px,3vw,20px) 0"
            : "0",
        }}
      >
        <div
          className="w-full transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]"
          style={{
            maxWidth: scrolled ? "min(900px, calc(100vw - 32px))" : "100%",
            borderRadius: scrolled ? "2rem" : mobileOpen ? "1.25rem" : "0",
            background: scrolled
              ? "#111111"
              : mobileOpen
              ? "#F5F5F5"
              : "transparent",
            boxShadow: active
              ? "0 8px 40px rgba(0,0,0,0.22), 0 2px 8px rgba(0,0,0,0.10)"
              : "none",
            backdropFilter: scrolled ? "blur(12px)" : "none",
            overflow: "hidden", // clips the menu inside the rounded corners
          }}
        >
          {children}
        </div>
      </div>
    </NavbarContext.Provider>
  );
}

/* ─── NavBody (desktop) ───────────────────────────────────────────────────── */

export function NavBody({ children }: { children: React.ReactNode }) {
  return (
    <div className="hidden md:flex items-center justify-between px-6 lg:px-8 h-[60px]">
      {children}
    </div>
  );
}

/* ─── NavbarLogo ──────────────────────────────────────────────────────────── */

export function NavbarLogo() {
  const { scrolled, mobileOpen } = useNavbar();
  const dark = !scrolled; // transparent or menu-open both use dark text

  return (
    <Link href="/" className="flex items-center gap-1.5 group shrink-0">
      <span
        className="font-bold text-xl tracking-tight transition-colors duration-300"
        style={{ color: scrolled ? "#ffffff" : mobileOpen ? "#1A1A1A" : "#ffffff" }}
      >
        Hiranandani
        <span style={{ color: "#C9A96E" }}>Homes</span>
      </span>
      <span
        className="h-1.5 w-1.5 rounded-full mt-1 group-hover:scale-125 transition-transform duration-300"
        style={{ background: "#C9A96E" }}
      />
    </Link>
  );
}

/* ─── NavItems ────────────────────────────────────────────────────────────── */

interface NavItem {
  name: string;
  link: string;
}

export function NavItems({ items }: { items: NavItem[] }) {
  const { scrolled, mobileOpen } = useNavbar();
  return (
    <nav className="flex items-center gap-6 lg:gap-8">
      {items.map((item) => (
        <Link
          key={item.link}
          href={item.link}
          className="text-sm font-medium relative group transition-colors duration-200"
          style={{ color: scrolled ? "rgba(255,255,255,0.75)" : mobileOpen ? "#1A1A1A" : "rgba(255,255,255,0.85)" }}
        >
          {item.name}
          <span
            className="absolute -bottom-0.5 left-0 h-px w-0 group-hover:w-full transition-all duration-300"
            style={{ background: scrolled ? "#C9A96E" : mobileOpen ? "#1A1A1A" : "#C9A96E" }}
          />
        </Link>
      ))}
    </nav>
  );
}

/* ─── NavbarButton ────────────────────────────────────────────────────────── */

interface NavbarButtonProps {
  children: React.ReactNode;
  variant?: "primary" | "secondary";
  className?: string;
  onClick?: () => void;
  href?: string;
}

export function NavbarButton({
  children,
  variant = "primary",
  className = "",
  onClick,
  href,
}: NavbarButtonProps) {
  const { scrolled, mobileOpen } = useNavbar();

  const base: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "8px 20px",
    borderRadius: "999px",
    fontSize: "13px",
    fontWeight: 600,
    transition: "all 0.2s ease",
    whiteSpace: "nowrap",
    cursor: "pointer",
    width: className.includes("w-full") ? "100%" : undefined,
  };

  const variant_style: React.CSSProperties =
    variant === "primary"
      ? scrolled
        ? { background: "#ffffff", color: "#0B0B0C" }
        : mobileOpen
        ? { background: "#1A1A1A", color: "#ffffff" }
        : { background: "#ffffff", color: "#0B0B0C" }
      : scrolled
      ? { background: "transparent", color: "rgba(255,255,255,0.75)", border: "1px solid rgba(255,255,255,0.2)" }
      : mobileOpen
      ? { background: "transparent", color: "#1A1A1A", border: "1px solid rgba(26,26,26,0.2)" }
      : { background: "transparent", color: "rgba(255,255,255,0.85)", border: "1px solid rgba(255,255,255,0.3)" };

  const combined = { ...base, ...variant_style };
  // strip w-full from className since we handle it in style
  const cls = className.replace("w-full", "").trim();

  return href ? (
    <Link href={href} style={combined} className={cls} onClick={onClick}>
      {children}
    </Link>
  ) : (
    <button style={combined} className={cls} onClick={onClick}>
      {children}
    </button>
  );
}

/* ─── MobileNav ───────────────────────────────────────────────────────────── */

export function MobileNav({ children }: { children: React.ReactNode }) {
  return <div className="md:hidden">{children}</div>;
}

/* ─── MobileNavHeader ─────────────────────────────────────────────────────── */

export function MobileNavHeader({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between px-5 h-[60px]">
      {children}
    </div>
  );
}

/* ─── MobileNavToggle ─────────────────────────────────────────────────────── */

export function MobileNavToggle({
  isOpen,
  onClick,
}: {
  isOpen: boolean;
  onClick: () => void;
}) {
  const { scrolled, mobileOpen } = useNavbar();
  // use dark lines when transparent+closed, white when scrolled or menu open on dark bg
  const lineColor = !scrolled && mobileOpen ? "#1A1A1A" : "#ffffff";

  return (
    <button
      onClick={onClick}
      aria-label="Toggle menu"
      className="p-2 rounded-lg transition-colors duration-200 focus:outline-none"
    >
      <div className="w-5 h-4 flex flex-col justify-between">
        <span
          className="block h-0.5 w-full rounded-full transition-all duration-300 origin-center"
          style={{
            background: lineColor,
            transform: isOpen ? "rotate(45deg) translateY(7px)" : "none",
          }}
        />
        <span
          className="block h-0.5 w-full rounded-full transition-all duration-300"
          style={{
            background: lineColor,
            opacity: isOpen ? 0 : 1,
            transform: isOpen ? "scaleX(0)" : "scaleX(1)",
          }}
        />
        <span
          className="block h-0.5 w-full rounded-full transition-all duration-300 origin-center"
          style={{
            background: lineColor,
            transform: isOpen ? "rotate(-45deg) translateY(-7px)" : "none",
          }}
        />
      </div>
    </button>
  );
}

/* ─── MobileNavMenu ───────────────────────────────────────────────────────── */

export function MobileNavMenu({
  isOpen,
  onClose,
  children,
}: {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}) {
  const { scrolled } = useNavbar();
  return (
    <div
      className="transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] overflow-hidden"
      style={{ maxHeight: isOpen ? "480px" : "0", opacity: isOpen ? 1 : 0 }}
    >
      <div
        className="flex flex-col gap-0.5 px-5 pb-6 pt-2"
        style={{
          borderTop: `1px solid ${
            scrolled ? "rgba(255,255,255,0.08)" : "rgba(26,26,26,0.08)"
          }`,
        }}
      >
        {children}
      </div>
    </div>
  );
}
