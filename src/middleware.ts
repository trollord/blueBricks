import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";
import { NextResponse } from "next/server";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const session = req.auth;
  const role = session?.user?.role;

  // Require login for dashboard and admin
  if (
    (pathname.startsWith("/dashboard") || pathname.startsWith("/admin")) &&
    !session
  ) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // Dashboard: OWNER, MANAGER, or ADMIN only
  if (pathname.startsWith("/dashboard")) {
    if (!role || !["OWNER", "MANAGER", "ADMIN"].includes(role)) {
      return NextResponse.redirect(new URL("/become-owner", req.url));
    }
  }

  // Admin: MANAGER or ADMIN only
  if (pathname.startsWith("/admin")) {
    if (!role || !["MANAGER", "ADMIN"].includes(role)) {
      return NextResponse.redirect(new URL("/", req.url));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*"],
};
