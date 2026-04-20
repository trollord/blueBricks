import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { formatPrice, formatDate } from "@/lib/utils/formatters";
import { PROPERTY_TYPE_LABELS, LISTING_TYPE_LABELS } from "@/lib/constants";
import type { PropertyFilters } from "@/types/property";

export const dynamic = "force-dynamic";

const STATUS_STYLES: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-800",
  ACTIVE: "bg-green-100 text-green-800",
  REJECTED: "bg-red-100 text-red-800",
  INACTIVE: "bg-gray-100 text-gray-600",
};

interface PageProps {
  searchParams: Promise<PropertyFilters & { status?: string }>;
}

export default async function AdminListingsPage({ searchParams }: PageProps) {
  const session = await auth();
  if (!session || !["ADMIN"].includes(session.user.role ?? "")) {
    redirect("/login");
  }

  const filters = await searchParams;
  const statusFilter = filters.status ?? "PENDING";

  const properties = await prisma.property.findMany({
    where: statusFilter === "ALL" ? {} : { status: statusFilter as never },
    orderBy: { createdAt: "desc" },
    take: 50,
    select: {
      id: true,
      title: true,
      type: true,
      listingType: true,
      locality: true,
      bedrooms: true,
      price: true,
      status: true,
      createdAt: true,
      owner: { select: { name: true } },
    },
  });

  const tabs = ["PENDING", "ACTIVE", "REJECTED", "ALL"];

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Listings</h1>

      {/* Status tabs */}
      <div className="flex gap-1 mb-6 bg-gray-100 rounded-lg p-1 w-fit">
        {tabs.map((tab) => (
          <Link
            key={tab}
            href={`/admin/listings?status=${tab}`}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
              statusFilter === tab
                ? "bg-white shadow-sm text-gray-900"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab === "ALL" ? "All" : tab.charAt(0) + tab.slice(1).toLowerCase()}
          </Link>
        ))}
      </div>

      {properties.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <p>No listings with status: {statusFilter}</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Property</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Type</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Locality</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Price</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Owner</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Submitted</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {properties.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900 max-w-[200px] truncate">
                    {p.title}
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    {PROPERTY_TYPE_LABELS[p.type] ?? p.type}
                    <span className="ml-1 text-xs">({LISTING_TYPE_LABELS[p.listingType] ?? p.listingType})</span>
                  </td>
                  <td className="px-4 py-3 text-gray-500">{p.locality}</td>
                  <td className="px-4 py-3 text-gray-700">{formatPrice(p.price)}</td>
                  <td className="px-4 py-3 text-gray-500">{p.owner.name ?? "—"}</td>
                  <td className="px-4 py-3 text-gray-400">{formatDate(p.createdAt)}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_STYLES[p.status] ?? ""}`}>
                      {p.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/listings/${p.id}`}
                      className="text-blue-600 hover:underline text-xs"
                    >
                      Review →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
