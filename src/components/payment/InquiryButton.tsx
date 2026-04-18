"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CheckCircle2, LogIn, Loader2, Heart, CalendarDays } from "lucide-react";
import { toast } from "sonner";

interface Props {
  propertyId: string;
  hasRegistered: boolean;
  isLoggedIn: boolean;
}

export default function InquiryButton({ propertyId, hasRegistered, isLoggedIn }: Props) {
  const [loading, setLoading] = useState(false);
  const [registered, setRegistered] = useState(hasRegistered);

  async function handleRegisterInterest() {
    setLoading(true);
    try {
      const res = await fetch(`/api/properties/${propertyId}/inquire`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      if (!res.ok) {
        const err = await res.json();
        toast.error(err.error ?? "Failed to register interest");
        return;
      }
      setRegistered(true);
      toast.success("Interest registered! The owner will review and may reach out to you.");
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  // Not logged in
  if (!isLoggedIn) {
    return (
      <div className="flex flex-col gap-3">
        <Link href={`/login?callbackUrl=/listings/${propertyId}`}>
          <Button className="w-full rounded-full bg-[#0B0B0C] hover:bg-[#0B0B0C]/90 text-white gap-2 py-5 text-sm font-medium tracking-wide transition-all duration-300">
            <LogIn className="h-4 w-4" />
            Register Interest — Free
          </Button>
        </Link>
        <Button
          variant="outline"
          className="w-full rounded-full gap-2 border-[#0B0B0C]/20 text-[#0B0B0C] hover:bg-[#0B0B0C]/5 text-sm py-5"
          disabled
        >
          <CalendarDays className="h-4 w-4" />
          Schedule Tour
        </Button>
      </div>
    );
  }

  // Already registered
  if (registered) {
    return (
      <div className="flex flex-col gap-3">
        <div className="flex items-start gap-3 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3">
          <CheckCircle2 className="h-5 w-5 text-[#0B0B0C] shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-[#0B0B0C]">Interest Registered</p>
            <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
              The owner has been notified and may reach out to you directly.
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          className="w-full rounded-full gap-2 border-[#0B0B0C]/20 text-[#0B0B0C] hover:bg-[#0B0B0C]/5 text-sm py-5"
        >
          <CalendarDays className="h-4 w-4" />
          Schedule Tour
        </Button>
      </div>
    );
  }

  // Logged in, not yet registered
  return (
    <div className="flex flex-col gap-3">
      <Button
        className="w-full rounded-full bg-[#0B0B0C] hover:bg-[#0B0B0C]/90 text-white gap-2 text-sm py-5 font-medium tracking-wide transition-all duration-300"
        onClick={handleRegisterInterest}
        disabled={loading}
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Heart className="h-4 w-4" />
        )}
        Register Interest — Free
      </Button>
      <Button
        variant="outline"
        className="w-full rounded-full gap-2 border-[#0B0B0C]/20 text-[#0B0B0C] hover:bg-[#0B0B0C]/5 text-sm py-5"
      >
        <CalendarDays className="h-4 w-4" />
        Schedule Tour
      </Button>
    </div>
  );
}
