"use client";

import { useState } from "react";
import { Cross, Pill, GraduationCap } from "lucide-react";
import { toast } from "sonner";
import PropertyMap from "./PropertyMap";

type AmenityType = "hospital" | "pharmacy" | "school";

const AMENITIES: {
  type: AmenityType;
  label: string;
  icon: React.ElementType;
}[] = [
  { type: "hospital", label: "Hospitals",  icon: Cross         },
  { type: "pharmacy", label: "Pharmacies", icon: Pill          },
  { type: "school",   label: "Schools",    icon: GraduationCap },
];

interface Props {
  lat: number;
  lng: number;
  propertyId: string;
  isLoggedIn: boolean;
}

export default function PropertyMapSection({ lat, lng, propertyId, isLoggedIn }: Props) {
  const [activeAmenity, setActiveAmenity] = useState<AmenityType | null>(null);

  function toggle(type: AmenityType) {
    if (!isLoggedIn) {
      toast("Sign in to explore nearby facilities", {
        description: "Create a free account to discover hospitals, schools, and more around this property.",
        action: { label: "Sign in", onClick: () => window.location.href = "/login" },
        duration: 4000,
      });
      return;
    }
    setActiveAmenity((prev) => (prev === type ? null : type));
  }

  return (
    <div className="space-y-3">
      {/* Category buttons */}
      <div className="flex flex-wrap gap-2">
        {AMENITIES.map(({ type, label, icon: Icon }) => (
          <button
            key={type}
            onClick={() => toggle(type)}
            className={`inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full border transition-colors duration-150 ${
              activeAmenity === type
                ? "bg-[#1A1A1A] text-white border-[#1A1A1A]"
                : "bg-white text-[#1A1A1A]/60 border-gray-200 hover:border-[#1A1A1A]/30 hover:text-[#1A1A1A]"
            }`}
          >
            <Icon className="h-3.5 w-3.5" />
            {label}
          </button>
        ))}
      </div>

      <PropertyMap
        lat={lat}
        lng={lng}
        propertyId={propertyId}
        activeAmenity={activeAmenity}
      />

    </div>
  );
}
