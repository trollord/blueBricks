"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronRight, ChevronLeft, ImageOff, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface GalleryImage {
  id: string;
  url: string;
  isPrimary: boolean;
}

interface Props {
  images: GalleryImage[];
  title: string;
}

function ImageSlide({
  images,
  title,
  startIndex,
  rounded = false,
}: {
  images: GalleryImage[];
  title: string;
  startIndex: number;
  rounded?: boolean;
}) {
  const [a, b, c] = images;
  const cls = rounded ? "rounded-lg" : "";

  return (
    <div className="grid grid-cols-5 gap-1 w-full h-full">
      {/* Primary — 60% */}
      <div className={`col-span-3 relative overflow-hidden ${cls}`}>
        {a ? (
          <Image
            src={a.url}
            alt={`${title} ${startIndex + 1}`}
            fill
            className="object-cover"
            sizes="60vw"
            priority={startIndex === 0}
          />
        ) : (
          <div className="w-full h-full bg-zinc-100" />
        )}
      </div>

      {/* Right stack — 40% */}
      <div className="col-span-2 grid grid-rows-2 gap-1">
        <div className={`relative overflow-hidden ${cls}`}>
          {b ? (
            <Image
              src={b.url}
              alt={`${title} ${startIndex + 2}`}
              fill
              className="object-cover"
              sizes="40vw"
            />
          ) : (
            <div className="w-full h-full bg-zinc-100" />
          )}
        </div>
        <div className={`relative overflow-hidden ${cls}`}>
          {c ? (
            <Image
              src={c.url}
              alt={`${title} ${startIndex + 3}`}
              fill
              className="object-cover"
              sizes="40vw"
            />
          ) : (
            <div className="w-full h-full bg-zinc-100" />
          )}
        </div>
      </div>
    </div>
  );
}

export default function PropertyGallery({ images, title }: Props) {
  const [expanded, setExpanded] = useState(false);
  const [page, setPage] = useState(0);

  if (images.length === 0) {
    return (
      <div className="h-[220px] sm:h-[320px] lg:h-[440px] bg-zinc-100 rounded-xl flex flex-col items-center justify-center gap-3">
        <ImageOff className="w-10 h-10 text-zinc-300" />
        <span className="text-sm text-zinc-400 font-medium">No photos uploaded</span>
      </div>
    );
  }

  const totalPages = Math.ceil(images.length / 3);
  const hasMore = images.length > 3;

  function openExpanded() {
    setPage(0);
    setExpanded(true);
  }

  return (
    <>
      {/* Normal gallery */}
      <div className="relative h-[220px] sm:h-[320px] lg:h-[440px] rounded-xl overflow-hidden">
        <ImageSlide
          images={images.slice(0, 3)}
          title={title}
          startIndex={0}
          rounded
        />

        {/* Arrow to open lightbox */}
        {hasMore && (
          <button
            onClick={openExpanded}
            className="absolute right-3 top-1/2 -translate-y-1/2 z-10 bg-black/55 hover:bg-black/75 backdrop-blur-sm text-white rounded-full p-2 transition-all shadow-lg"
            aria-label="View all photos"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 sm:p-8"
            onClick={() => setExpanded(false)}
          >
            <motion.div
              initial={{ scale: 0.93, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.93, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 28 }}
              className="relative w-full max-w-5xl"
              style={{ height: "clamp(260px, 65vh, 580px)" }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close */}
              <button
                onClick={() => setExpanded(false)}
                className="absolute -top-10 right-0 z-20 text-white/70 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>

              {/* Image slide */}
              <ImageSlide
                images={images.slice(page * 3, page * 3 + 3)}
                title={title}
                startIndex={page * 3}
                rounded
              />

              {/* Prev arrow */}
              {page > 0 && (
                <button
                  onClick={() => setPage((p) => p - 1)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 z-20 bg-black/55 hover:bg-black/75 backdrop-blur-sm text-white rounded-full p-2.5 transition-all shadow-lg"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
              )}

              {/* Next arrow */}
              {page < totalPages - 1 && (
                <button
                  onClick={() => setPage((p) => p + 1)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 z-20 bg-black/55 hover:bg-black/75 backdrop-blur-sm text-white rounded-full p-2.5 transition-all shadow-lg"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              )}

              {/* Page indicator */}
              {totalPages > 1 && (
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 bg-black/55 backdrop-blur-sm text-white text-xs font-semibold px-3 py-1.5 rounded-full">
                  {page + 1} / {totalPages}
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
