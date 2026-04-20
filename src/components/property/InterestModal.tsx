"use client";

import { useState } from "react";
import { Loader2, X, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

interface Props {
  propertyId: string;
  userName: string;
  userEmail: string;
  onSuccess: () => void;
  onClose: () => void;
}

export default function InterestModal({
  propertyId,
  userName,
  userEmail,
  onSuccess,
  onClose,
}: Props) {
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!phone.trim()) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/properties/${propertyId}/inquire`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: phone.trim() }),
      });

      if (!res.ok) {
        const err = await res.json();
        toast.error(err.error ?? "Failed to register interest");
        return;
      }

      onSuccess();
      toast.success("Interest registered! The owner will review and may reach out to you.");
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
        onClick={onClose}
      />

      {/* Card — bottom sheet on mobile, centered on desktop */}
      <div className="relative w-full sm:max-w-md bg-white rounded-t-2xl sm:rounded-sm shadow-2xl border border-gray-100 px-5 pt-6 pb-8 sm:p-8 max-h-[92dvh] overflow-y-auto">

        {/* Drag handle (mobile only) */}
        <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-5 sm:hidden" />

        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#1A1A1A]/40 hover:text-[#1A1A1A] transition-colors p-1"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Header */}
        <div className="mb-6">
          <p className="text-[10px] font-semibold tracking-[0.25em] text-[#1A1A1A]/45 uppercase mb-2">
            Register Interest
          </p>
          <h2 className="font-[family-name:var(--font-playfair)] text-2xl font-bold text-[#0B0B0C]">
            Confirm your details
          </h2>
          <p className="text-[13px] text-[#1A1A1A]/50 mt-1.5 leading-relaxed">
            The owner will use these details to reach out to you directly.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name — read-only */}
          <div>
            <label className="block text-[10px] font-semibold tracking-[0.2em] uppercase text-[#1A1A1A]/45 mb-1.5">
              Full Name
            </label>
            <input
              type="text"
              value={userName}
              readOnly
              className="w-full border border-gray-200 bg-[#fafafa] rounded-sm px-3.5 py-3 text-sm text-[#0B0B0C]/60 cursor-default outline-none"
            />
          </div>

          {/* Email — read-only */}
          <div>
            <label className="block text-[10px] font-semibold tracking-[0.2em] uppercase text-[#1A1A1A]/45 mb-1.5">
              Email Address
            </label>
            <input
              type="email"
              value={userEmail}
              readOnly
              className="w-full border border-gray-200 bg-[#fafafa] rounded-sm px-3.5 py-3 text-sm text-[#0B0B0C]/60 cursor-default outline-none"
            />
          </div>

          {/* Phone — required */}
          <div>
            <label className="block text-[10px] font-semibold tracking-[0.2em] uppercase text-[#1A1A1A]/45 mb-1.5">
              Contact Number{" "}
              <span className="text-[#0B0B0C]/40 normal-case tracking-normal font-normal text-[11px]">
                (required)
              </span>
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+91 98765 43210"
              autoFocus
              required
              className="w-full border border-gray-200 bg-white rounded-sm px-3.5 py-3 text-sm text-[#0B0B0C] placeholder:text-[#1A1A1A]/30 outline-none focus:border-[#0B0B0C]/40 transition-colors"
            />
          </div>

          <div className="pt-2">
            <Button
              type="submit"
              disabled={loading || !phone.trim()}
              className="w-full rounded-full bg-[#0B0B0C] hover:bg-[#0B0B0C]/90 text-white gap-2 py-5 text-sm font-medium tracking-wide transition-all duration-300 disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle2 className="h-4 w-4" />
              )}
              Confirm Interest
            </Button>
          </div>
        </form>

        <p className="text-[10px] text-center text-[#1A1A1A]/35 mt-4 leading-relaxed tracking-wide">
          No hidden charges &bull; 100% Verified Property
        </p>
      </div>
    </div>
  );
}
