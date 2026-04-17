"use client";

import { useState } from "react";
import { Cross, Pill, GraduationCap } from "lucide-react";
import PropertyMap from "./PropertyMap";

type AmenityType = "hospital" | "pharmacy" | "school";

const AMENITIES: {
  type: AmenityType;
  label: string;
  icon: React.ElementType;
  activeClass: string;
  idleClass: string;
}[] = [
  {
    type:        "hospital",
    label:       "Hospitals",
    icon:        Cross,
    activeClass: "bg-red-500   text-white  border-red-500",
    idleClass:   "bg-red-50    text-red-600   border-red-200   hover:bg-red-100",
  },
  {
    type:        "pharmacy",
    label:       "Pharmacies",
    icon:        Pill,
    activeClass: "bg-green-500 text-white  border-green-500",
    idleClass:   "bg-green-50  text-green-600 border-green-200 hover:bg-green-100",
  },
  {
    type:        "school",
    label:       "Schools",
    icon:        GraduationCap,
    activeClass: "bg-blue-500  text-white  border-blue-500",
    idleClass:   "bg-blue-50   text-blue-600  border-blue-200  hover:bg-blue-100",
  },
];

interface Props {
  lat: number;
  lng: number;
  propertyId: string;
}

export default function PropertyMapSection({ lat, lng, propertyId }: Props) {
  const [activeAmenity, setActiveAmenity] = useState<AmenityType | null>(null);

  function toggle(type: AmenityType) {
    setActiveAmenity((prev) => (prev === type ? null : type));
  }

  return (
    <div className="space-y-3">
      {/* Category buttons */}
      <div className="flex flex-wrap gap-2">
        {AMENITIES.map(({ type, label, icon: Icon, activeClass, idleClass }) => (
          <button
            key={type}
            onClick={() => toggle(type)}
            className={`inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full border transition-colors duration-150 ${
              activeAmenity === type ? activeClass : idleClass
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

      <p className="text-xs text-gray-400">
        Exact address revealed after registering interest.
      </p>
    </div>
  );
}
