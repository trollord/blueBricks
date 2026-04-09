"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { CheckCircle2, XCircle, ArrowLeft, Loader2 } from "lucide-react";
import { PROPERTY_TYPE_LABELS, LISTING_TYPE_LABELS, FURNISHED_LABELS } from "@/lib/constants";
import { formatPrice, formatArea } from "@/lib/utils/formatters";

interface PropertyDetail {
  id: string;
  title: string;
  description: string;
  type: string;
  listingType: string;
  status: string;
  building: string;
  flatNumber: string | null;
  address: string | null;
  locality: string;
  bedrooms: number | null;
  bathrooms: number | null;
  areaSqft: number | null;
  floor: number | null;
  totalFloors: number | null;
  furnished: string;
  amenities: string[];
  price: number;
  deposit: number | null;
  createdAt: string;
  images: { id: string; url: string; isPrimary: boolean }[];
  owner: {
    id: string;
    name: string | null;
    email: string | null;
    phone: string | null;
  };
}

export default function AdminListingDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [property, setProperty] = useState<PropertyDetail | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [rejectNotes, setRejectNotes] = useState("");
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/admin/listings/${id}`);
        if (!res.ok) { toast.error("Failed to load listing"); return; }
        const data = await res.json();
        setProperty(data.property);
        setIsAdmin(data.isAdmin);
      } catch {
        toast.error("Failed to load listing");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  async function handleAction(action: "APPROVE" | "REJECT") {
    if (action === "REJECT" && !rejectNotes.trim()) {
      toast.error("Please provide a reason for rejection");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(`/api/admin/properties/${id}/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, notes: rejectNotes }),
      });
      if (!res.ok) { toast.error("Action failed"); return; }
      toast.success(action === "APPROVE" ? "Listing approved!" : "Listing rejected");
      router.push("/admin/listings");
    } catch {
      toast.error("Action failed");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!property) {
    return <div className="p-8 text-gray-500">Property not found.</div>;
  }

  return (
    <div className="p-8 max-w-4xl">
      <button
        onClick={() => router.push("/admin/listings")}
        className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-blue-600 mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to listings
      </button>

      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{property.title}</h1>
          <p className="text-gray-500 text-sm mt-1">{property.locality} · {property.building}</p>
        </div>
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
          property.status === "PENDING" ? "bg-yellow-100 text-yellow-800" :
          property.status === "ACTIVE" ? "bg-green-100 text-green-800" :
          "bg-red-100 text-red-800"
        }`}>
          {property.status}
        </span>
      </div>

      {/* Images */}
      {property.images.length > 0 && (
        <div className="flex gap-2 mb-6 overflow-x-auto">
          {property.images.map((img) => (
            <div key={img.id} className="relative h-40 w-60 shrink-0 rounded-lg overflow-hidden">
              <Image src={img.url} alt="Property" fill className="object-cover" />
              {img.isPrimary && (
                <span className="absolute top-1 left-1 bg-blue-600 text-white text-xs px-1.5 py-0.5 rounded">
                  Primary
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Property details */}
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base">Property Details</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            <Row label="Type" value={`${PROPERTY_TYPE_LABELS[property.type] ?? property.type} · For ${LISTING_TYPE_LABELS[property.listingType] ?? property.listingType}`} />
            <Row label="Bedrooms" value={property.bedrooms ? `${property.bedrooms} BHK` : "N/A"} />
            <Row label="Bathrooms" value={String(property.bathrooms ?? "N/A")} />
            <Row label="Area" value={property.areaSqft != null ? formatArea(property.areaSqft) : "N/A"} />
            <Row label="Floor" value={property.floor != null ? `${property.floor}${property.totalFloors ? ` / ${property.totalFloors}` : ""}` : "N/A"} />
            <Row label="Furnished" value={FURNISHED_LABELS[property.furnished] ?? property.furnished} />
            <Row label="Price" value={formatPrice(property.price)} />
            {property.deposit && <Row label="Deposit" value={formatPrice(property.deposit)} />}
          </CardContent>
        </Card>

        {/* Owner info */}
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base">Owner Information</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            <Row label="Name" value={property.owner.name ?? "—"} />
            {isAdmin ? (
              <>
                <Row label="Email" value={property.owner.email ?? "—"} />
                <Row label="Phone" value={property.owner.phone ?? "—"} />
                <Row label="Flat Number" value={property.flatNumber ?? "—"} />
                <Row label="Address" value={property.address ?? "—"} />
              </>
            ) : (
              <p className="text-gray-400 text-xs italic">Contact details hidden (Manager view)</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Description */}
      <Card className="mt-6">
        <CardHeader className="pb-2"><CardTitle className="text-base">Description</CardTitle></CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600 whitespace-pre-line">{property.description}</p>
        </CardContent>
      </Card>

      {/* Amenities */}
      {property.amenities.length > 0 && (
        <Card className="mt-4">
          <CardHeader className="pb-2"><CardTitle className="text-base">Amenities</CardTitle></CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {property.amenities.map((a) => (
                <Badge key={a} variant="secondary">{a}</Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Actions — only for PENDING */}
      {property.status === "PENDING" && (
        <div className="mt-8 space-y-4">
          <Separator />
          <div className="flex gap-3">
            <Button
              className="bg-green-600 hover:bg-green-700 gap-2"
              onClick={() => handleAction("APPROVE")}
              disabled={submitting}
            >
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
              Approve Listing
            </Button>
            <Button
              variant="outline"
              className="border-red-300 text-red-600 hover:bg-red-50 gap-2"
              onClick={() => setShowRejectForm((v) => !v)}
              disabled={submitting}
            >
              <XCircle className="h-4 w-4" />
              Reject
            </Button>
          </div>

          {showRejectForm && (
            <div className="space-y-3">
              <textarea
                className="w-full border border-gray-200 rounded-lg p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-red-200"
                rows={3}
                placeholder="Reason for rejection (required)…"
                value={rejectNotes}
                onChange={(e) => setRejectNotes(e.target.value)}
              />
              <Button
                className="bg-red-600 hover:bg-red-700"
                onClick={() => handleAction("REJECT")}
                disabled={submitting || !rejectNotes.trim()}
              >
                Confirm Rejection
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-gray-500 shrink-0">{label}</span>
      <span className="text-gray-900 text-right">{value}</span>
    </div>
  );
}
