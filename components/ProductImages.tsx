"use client";

import { useEffect, useMemo, useState } from "react";

export default function ProductImages({ images = [] }: { images?: string[] }) {
  const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "";
  const base = `${API_URL}/uploads/products/`;

  // ✅ Memoize to avoid new array on every render
  const validImages = useMemo(
    () =>
      Array.isArray(images)
        ? images.filter(
            (img): img is string => typeof img === "string" && img.length > 0
          )
        : [],
    [images]
  );

  const [selected, setSelected] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  // ✅ Set selected ONLY if not already set or invalid
  useEffect(() => {
    if (!selected && validImages.length > 0) {
      setSelected(validImages[0]);
    }

    if (selected && !validImages.includes(selected)) {
      setSelected(validImages[0] ?? null);
    }
  }, [validImages, selected]);

  // ---------------- EMPTY STATE ----------------
  if (validImages.length === 0) {
    return (
      <div className="w-full h-[420px] bg-gray-100 rounded-xl flex items-center justify-center text-gray-500">
        No product image available
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row gap-4">
      {/* ---------------- THUMBNAILS ---------------- */}
      <div className="flex md:flex-col gap-3 md:w-24">
        {validImages.map((img, index) => (
          <button
            key={`${img}-${index}`} // ✅ stable key
            onClick={() => {
              if (img !== selected) {
                setSelected(img);
                setLoading(true);
                setError(false);
              }
            }}
            className={`border rounded-lg overflow-hidden transition
              ${
                selected === img
                  ? "border-brandPink ring-2 ring-brandPink/40"
                  : "border-gray-200 hover:border-brandPink"
              }
            `}
          >
            <img
              src={base + img}
              alt="thumbnail"
              className="w-20 h-20 object-cover"
              loading="lazy"
            />
          </button>
        ))}
      </div>

      {/* ---------------- MAIN IMAGE ---------------- */}
      <div className="relative flex-1 bg-gray-100 rounded-xl overflow-hidden">
        {/* Skeleton */}
        {loading && (
          <div className="absolute inset-0 bg-gray-200 animate-pulse z-10" />
        )}

        {/* Error */}
        {error && (
          <div className="absolute inset-0 flex items-center justify-center text-red-500 z-10">
            Failed to load image
          </div>
        )}

        {selected && (
          <img
            src={base + selected}
            alt="product"
            onLoad={() => setLoading(false)}
            onError={() => {
              setLoading(false);
              setError(true);
            }}
            className="
              w-full h-[420px] md:h-[520px]
              object-cover rounded-xl
              transition-opacity duration-300
            "
          />
        )}
      </div>
    </div>
  );
}
