"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronRight, ChevronLeft, ImageOff } from "lucide-react";

interface GalleryImage {
  id: string;
  url: string;
  isPrimary: boolean;
}

interface Props {
  images: GalleryImage[];
  title: string;
}

export default function PropertyGallery({ images, title }: Props) {
  const [showGrid, setShowGrid] = useState(false);
  const hasMore = images.length > 3;
  const remaining = images.length - 3;

  // Hero view: first 3 images
  const hero = images.slice(0, 3);
  // Grid view: images 4 onward
  const gridImages = images.slice(3);

  if (showGrid) {
    return (
      <div className="relative h-[220px] sm:h-[320px] lg:h-[440px] bg-[#111]">
        {/* Back button */}
        <button
          onClick={() => setShowGrid(false)}
          className="absolute top-4 left-4 z-20 flex items-center gap-1.5 bg-black/60 backdrop-blur-sm text-white text-xs font-semibold px-4 py-2 rounded-full hover:bg-black/80 transition-colors"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          Back
        </button>

        {/* Photo count */}
        <div className="absolute top-4 right-4 z-20 bg-black/60 backdrop-blur-sm text-white text-xs font-semibold px-4 py-2 rounded-full">
          {remaining} more photo{remaining > 1 ? "s" : ""}
        </div>

        {/* Scrollable grid filling the same space */}
        <div className="h-full overflow-y-auto p-1 sm:p-1.5">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-1 sm:gap-1.5">
            {gridImages.map((img, i) => (
              <div
                key={img.id}
                className="relative aspect-[4/3]"
              >
                <Image
                  src={img.url}
                  alt={`${title} ${i + 4}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 50vw, 33vw"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (images.length === 0) {
    return (
      <div className="h-[220px] sm:h-[320px] lg:h-[440px] bg-zinc-100 flex flex-col items-center justify-center gap-3">
        <ImageOff className="w-10 h-10 text-zinc-300" />
        <span className="text-sm text-zinc-400 font-medium">No photos uploaded</span>
      </div>
    );
  }

  return (
    <div className="relative grid grid-cols-5 gap-px h-[220px] sm:h-[320px] lg:h-[440px]">
      {/* Primary image — 60% */}
      <div className="col-span-3 sm:col-span-3 relative">
        <Image
          src={hero[0].url}
          alt={title}
          fill
          className="object-cover"
          priority
          sizes="60vw"
        />
      </div>

      {/* Right stack — 40% */}
      <div className="col-span-2 grid grid-rows-2 gap-px">
        <div className="relative">
          {hero[1] ? (
            <Image
              src={hero[1].url}
              alt={`${title} 2`}
              fill
              className="object-cover"
              sizes="40vw"
            />
          ) : (
            <div className="w-full h-full bg-zinc-100" />
          )}
        </div>
        <div className="relative">
          {hero[2] ? (
            <Image
              src={hero[2].url}
              alt={`${title} 3`}
              fill
              className="object-cover"
              sizes="40vw"
            />
          ) : (
            <div className="w-full h-full bg-zinc-100" />
          )}

          {/* "View more" overlay on bottom-right image */}
          {hasMore && (
            <button
              onClick={() => setShowGrid(true)}
              className="absolute inset-0 z-10 flex items-center justify-center bg-black/40 hover:bg-black/50 transition-colors cursor-pointer group"
            >
              <div className="flex items-center gap-2 text-white">
                <span className="text-sm font-semibold">
                  +{remaining} photos
                </span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
