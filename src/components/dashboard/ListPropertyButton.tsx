"use client";

import { useState } from "react";
import { PlusCircle } from "lucide-react";
import BecomeOwnerModal from "@/components/property/BecomeOwnerModal";

export default function ListPropertyButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <BecomeOwnerModal open={open} onClose={() => setOpen(false)} />
      <div className="mt-4 pt-4 border-t border-gray-100">
        <button
          onClick={() => setOpen(true)}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-[#0F2244] font-medium hover:bg-[#0F2244]/5 transition-colors"
        >
          <PlusCircle className="h-4 w-4 shrink-0 text-[#C9A96E]" />
          List a Property
        </button>
      </div>
    </>
  );
}
