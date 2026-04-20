import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { Badge } from "@/components/ui/badge";
import { LayoutDashboard, ListChecks, Users, Upload, Building2, MessageSquare } from "lucide-react";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session || !["ADMIN"].includes(session.user.role)) {
    redirect("/login");
  }

  const isAdmin = session.user.role === "ADMIN";

  const navLinks = [
    { href: "/admin", label: "Overview", icon: LayoutDashboard, adminOnly: false },
    { href: "/admin/listings", label: "Listings Queue", icon: ListChecks, adminOnly: false },
    { href: "/admin/inquiries", label: "Inquiries", icon: MessageSquare, adminOnly: false },
    { href: "/admin/users", label: "Users", icon: Users, adminOnly: true },
    { href: "/admin/import", label: "Import Prices", icon: Upload, adminOnly: true },
  ].filter((l) => !l.adminOnly || isAdmin);

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-56 shrink-0 bg-[#1A1A1A] text-white flex flex-col">
        <div className="p-5 border-b border-white/10">
          <div className="flex items-center gap-2 mb-1">
            <Building2 className="h-5 w-5 text-white/80" />
            <span className="font-bold text-sm">Admin Panel</span>
          </div>
          <p className="text-xs text-white/50 truncate">{session.user.name ?? session.user.email}</p>
          <Badge className="mt-1 text-xs bg-white/10 text-white/80 border-white/20">
            {session.user.role}
          </Badge>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {navLinks.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-white/70 hover:bg-white/10 hover:text-white transition-colors"
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
            </Link>
          ))}
        </nav>
        <div className="p-3 border-t border-white/10">
          <Link href="/" className="text-xs text-white/40 hover:text-white/70">
            ← Back to site
          </Link>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 bg-[#FAF8F5] overflow-auto">{children}</main>
    </div>
  );
}
