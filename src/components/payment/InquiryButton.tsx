"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CheckCircle2, LogIn, Loader2, Bell } from "lucide-react";
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
      <Link href={`/login?callbackUrl=/listings/${propertyId}`}>
        <Button className="w-full bg-[#0F2244] hover:bg-[#0F2244]/90 gap-2 transition-all duration-300">
          <LogIn className="h-4 w-4" />
          Sign In to Register Interest
        </Button>
      </Link>
    );
  }

  // Already registered (either from DB or just now)
  if (registered) {
    return (
      <div className="flex flex-col gap-3">
        <div className="flex items-start gap-3 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3">
          <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-emerald-800">Interest Registered</p>
            <p className="text-xs text-emerald-700 mt-0.5 leading-relaxed">
              The owner has been notified and may reach out to you directly.
            </p>
          </div>
        </div>
        <Link href="/interests">
          <Button
            variant="outline"
            className="w-full gap-2 border-[#0F2244]/30 text-[#0F2244] hover:bg-[#0F2244]/5 text-sm"
          >
            <Bell className="h-4 w-4" />
            View My Interests
          </Button>
        </Link>
      </div>
    );
  }

  // Logged in, not yet registered
  return (
    <Button
      className="w-full bg-[#C9A96E] hover:bg-[#C9A96E]/90 gap-2 text-base py-5 text-[#0F2244] font-semibold transition-all duration-300"
      onClick={handleRegisterInterest}
      disabled={loading}
    >
      {loading ? (
        <Loader2 className="h-5 w-5 animate-spin" />
      ) : (
        <Bell className="h-5 w-5" />
      )}
      Register Interest — Free
    </Button>
  );
}
