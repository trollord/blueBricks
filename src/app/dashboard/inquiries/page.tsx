import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { formatDate } from "@/lib/utils/formatters";
import { MessageSquare } from "lucide-react";

const STATUS_STYLE: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-800 border-yellow-200",
  PAID: "bg-green-100 text-green-800 border-green-200",
  COMPLETED: "bg-blue-100 text-blue-700 border-blue-200",
};

export default async function InquiriesPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const inquiries = await prisma.inquiry.findMany({
    where: {
      property: { ownerId: session.user.id },
    },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      status: true,
      createdAt: true,
      property: {
        select: { id: true, title: true, locality: true },
      },
      seeker: {
        select: { id: true, name: true, email: true, phone: true },
      },
    },
  });

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Inquiries Received</h1>
        <p className="text-sm text-gray-500 mt-1">
          Buyer and renter inquiries on your properties
        </p>
      </div>

      {inquiries.length === 0 ? (
        <div className="text-center py-20 border-2 border-dashed border-gray-200 rounded-xl bg-white">
          <MessageSquare className="h-12 w-12 mx-auto text-gray-300 mb-4" />
          <h2 className="text-lg font-semibold text-gray-700 mb-2">
            No inquiries yet
          </h2>
          <p className="text-sm text-gray-500">
            Inquiries on your active listings will appear here.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left font-semibold text-gray-600 px-4 py-3">
                  Property
                </th>
                <th className="text-left font-semibold text-gray-600 px-4 py-3">
                  Seeker
                </th>
                <th className="text-left font-semibold text-gray-600 px-4 py-3">
                  Contact
                </th>
                <th className="text-left font-semibold text-gray-600 px-4 py-3">
                  Status
                </th>
                <th className="text-left font-semibold text-gray-600 px-4 py-3">
                  Date
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {inquiries.map((inquiry) => {
                const showContact =
                  inquiry.status === "PAID" || inquiry.status === "COMPLETED";
                const statusStyle =
                  STATUS_STYLE[inquiry.status] ?? STATUS_STYLE.PENDING;

                return (
                  <tr key={inquiry.id} className="hover:bg-gray-50 transition-colors">
                    {/* Property */}
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900 line-clamp-1">
                        {inquiry.property.title}
                      </p>
                      <p className="text-xs text-gray-500">
                        {inquiry.property.locality}
                      </p>
                    </td>

                    {/* Seeker name */}
                    <td className="px-4 py-3">
                      <p className="text-gray-900">
                        {inquiry.seeker.name ?? "Anonymous"}
                      </p>
                    </td>

                    {/* Contact — only shown if PAID or COMPLETED */}
                    <td className="px-4 py-3">
                      {showContact ? (
                        <div>
                          <p className="text-gray-700">{inquiry.seeker.email}</p>
                          {inquiry.seeker.phone && (
                            <p className="text-gray-500 text-xs">
                              {inquiry.seeker.phone}
                            </p>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400 italic">
                          Unlocked after payment
                        </span>
                      )}
                    </td>

                    {/* Status badge */}
                    <td className="px-4 py-3">
                      <span
                        className={`text-xs font-medium px-2 py-0.5 rounded-full border ${statusStyle}`}
                      >
                        {inquiry.status}
                      </span>
                    </td>

                    {/* Date */}
                    <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                      {formatDate(inquiry.createdAt)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
