import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import DashboardNavbar from "@/components/layout/DashboardNavbar";
import DashboardSidebar from "@/components/layout/DashboardSidebar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session) redirect("/login");

  const isOwnerPlus = ["OWNER", "ADMIN"].includes(session.user.role);

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardNavbar />
      <div className="flex pt-[60px]">
        <DashboardSidebar
          name={session.user.name}
          email={session.user.email}
          role={session.user.role}
          isOwnerPlus={isOwnerPlus}
        />
        <main className="flex-1 overflow-auto">
          <div className="max-w-5xl mx-auto px-6 py-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
