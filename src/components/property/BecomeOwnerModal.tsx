"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Building2, CheckCircle2, ArrowRight, ArrowLeft, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function BecomeOwnerModal({ open, onClose }: Props) {
  const { update } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleActivate() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/user/become-owner", { method: "POST" });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Something went wrong");
        return;
      }
      await update({ role: "OWNER" });
      window.location.href = "/dashboard/new";
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (!open) return null;

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center px-4"
      style={{ background: "rgba(0,0,0,0.45)", backdropFilter: "blur(4px)" }}
      onClick={onClose}
    >
      {/* Panel */}
      <div
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Gold top bar */}
        <div className="h-1.5 bg-[#1A1A1A]" />

        {/* Back */}
        <button
          onClick={() => { onClose(); router.back(); }}
          className="absolute top-4 left-4 p-1.5 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>

        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="p-8 text-center">
          <div className="inline-flex p-4 rounded-full bg-[#1A1A1A]/5 mb-5">
            <Building2 className="h-8 w-8 text-[#1A1A1A]" />
          </div>

          <h2 className="font-[family-name:var(--font-playfair)] text-2xl font-bold text-[#1A1A1A] mb-2">
            List Your Property
          </h2>
          <p className="text-gray-500 text-sm mb-7 leading-relaxed">
            Activate your owner account to list properties.
            It&apos;s free and takes one click.
          </p>

          <ul className="text-left space-y-3 mb-7">
            {[
              "List properties in Hiranandani Estate for free",
              "Manage all your listings from one dashboard",
              "See interested seekers and their contact details",
              "Get notified when someone registers interest",
            ].map((point) => (
              <li key={point} className="flex items-start gap-2.5 text-sm text-gray-700">
                <CheckCircle2 className="h-4 w-4 text-[#1A1A1A] mt-0.5 shrink-0" />
                {point}
              </li>
            ))}
          </ul>

          {error && <p className="text-sm text-red-500 mb-4">{error}</p>}

          <Button
            onClick={handleActivate}
            disabled={loading}
            className="w-full bg-[#1A1A1A] hover:bg-[#1A1A1A]/90 text-white gap-2 py-5"
          >
            {loading ? "Activating…" : "Activate Owner Account — Free"}
            {!loading && <ArrowRight className="h-4 w-4" />}
          </Button>

          <button
            onClick={onClose}
            className="w-full mt-3 border border-gray-200 text-gray-500 hover:border-gray-300 hover:text-gray-700 text-sm font-medium py-2.5 rounded-xl transition-colors duration-200"
          >
            Continue as User
          </button>

          <p className="text-xs text-gray-400 mt-4">
            No charges. You can still browse listings as a seeker anytime.
          </p>
        </div>
      </div>
    </div>
  );
}
