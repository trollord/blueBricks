import Link from "next/link";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { LayoutDashboard, PlusCircle, MessageSquare } from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "My Listings", icon: LayoutDashboard },
  { href: "/dashboard/new", label: "Add Listing", icon: PlusCircle },
  { href: "/dashboard/inquiries", label: "Inquiries", icon: MessageSquare },
];

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session) redirect("/login");

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 shrink-0 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-6 border-b border-gray-100">
          <p className="text-sm font-semibold text-gray-900 truncate">
            {session.user.name ?? session.user.email}
          </p>
          <span className="mt-1 inline-block text-xs bg-blue-100 text-blue-700 font-medium px-2 py-0.5 rounded-full">
            {session.user.role}
          </span>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors"
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-100">
          <Link
            href="/"
            className="text-xs text-gray-500 hover:text-gray-700 transition-colors"
          >
            ← Back to site
          </Link>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        <div className="max-w-5xl mx-auto px-6 py-8">{children}</div>
      </main>
    </div>
  );
}
