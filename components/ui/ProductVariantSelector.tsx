"use client";

import { useMemo } from "react";

// ─────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────
interface Sku {
  id: number;
  color: string;
  size: string | null;
  stock: number;
  price: number;
  img1: string | null;
  img2: string | null;
  img3: string | null;
  pricing: {
    sellingPrice: number;
    discountedPrice: number | null;
    discountLabel: string | null;
  };
  finalPrice: number; // discountedPrice ?? sellingPrice (from service)
}

interface Props {
  product: any;
  selectedColor: string | null;
  selectedSize: Sku | null;
  baseUrl: string;
  onColorChange: (color: string | null) => void;
  onSizeChange: (size: Sku | null) => void;
}

// ─────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────
export default function ProductVariantSelector({
  product,
  selectedColor,
  selectedSize,
  baseUrl,
  onColorChange,
  onSizeChange,
}: Props) {

  const skus: Sku[] = Array.isArray(product?.skus) ? product.skus : [];

  // ── Colour groups ──────────────────────────
  // Each colour: { color, img, minPrice, totalStock, disabled }
  const colors = useMemo(() => {
    const map = new Map<string, {
      color: string;
      img: string | null;
      prices: number[];
      totalStock: number;
    }>();

    skus.forEach((sku) => {
      if (!sku.color) return;

      if (!map.has(sku.color)) {
        map.set(sku.color, {
          color: sku.color,
          img: sku.img1 || product.img1 || null,
          prices: [],
          totalStock: 0,
        });
      }

      const entry = map.get(sku.color)!;
      // Service always provides finalPrice — no fallback needed
      entry.prices.push(sku.finalPrice);
      entry.totalStock += sku.stock;
    });

    return Array.from(map.values()).map((entry) => ({
      ...entry,
      minPrice: entry.prices.length ? Math.min(...entry.prices) : product.finalPrice,
      disabled: entry.totalStock <= 0,
    }));
  }, [skus, product.img1, product.finalPrice]);

  // ── Sizes for selected colour ──────────────
  const sizes = useMemo(() => {
    if (!selectedColor) return [];
    return skus
      .filter((sku) => sku.color === selectedColor && sku.size)
      .sort((a, b) => a.id - b.id);
  }, [skus, selectedColor]);

  // ── Early exit if no SKUs ──────────────────
  if (!skus.length) return null;

  // ─────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────
  return (
    <div className="space-y-6">

      {/* ── COLOUR SELECTOR ─────────────────── */}
      {colors.length > 0 && (
        <div className="space-y-2">
          <div className="flex gap-2">
            <span className="text-sm font-semibold">Colour:</span>
            <span className="text-sm">{selectedColor ?? "Select"}</span>
          </div>

          <div className="flex flex-wrap gap-3">
            {colors.map((c) => {
              const isActive = c.color === selectedColor;

              return (
                <button
                  key={c.color}
                  disabled={c.disabled}
                  onClick={() => {
                    onColorChange(c.color);
                    onSizeChange(null);
                  }}
                  className={`relative w-16 rounded-md border transition ${
                    isActive
                      ? "border-blue-600 ring-1 ring-blue-600"
                      : "border-gray-200 hover:border-gray-400"
                  } ${c.disabled ? "opacity-40 cursor-not-allowed" : ""}`}
                >
                  {/* Thumbnail */}
                  <div className="aspect-[3/4] bg-gray-100 overflow-hidden rounded-t-md">
                    {c.img ? (
                      <img
                        src={`${baseUrl}${c.img}`}
                        alt={c.color}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200" />
                    )}
                  </div>

                  {/* Price label */}
                  <div className="text-[10px] font-semibold text-center py-1 bg-white border-t">
                    ₹{c.minPrice.toLocaleString()}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ── SIZE SELECTOR ──────────────────── */}
      {sizes.length > 0 && (
        <div className="space-y-2">
          <div className="flex gap-2">
            <span className="text-sm font-semibold">Size:</span>
            <span className="text-sm">{selectedSize?.size ?? "Select"}</span>
          </div>

          <div className="flex flex-wrap gap-2">
            {sizes.map((sku) => {
              const isActive = selectedSize?.id === sku.id;
              const disabled = sku.stock <= 0;

              return (
                <button
                  key={sku.id}
                  disabled={disabled}
                  onClick={() => onSizeChange(sku)}
                  className={`px-4 py-2 text-xs font-bold uppercase rounded-md border-2 transition ${
                    isActive
                      ? "border-blue-600 bg-blue-50 text-blue-700"
                      : "border-gray-200 hover:border-gray-400 text-gray-800"
                  } ${
                    disabled
                      ? "opacity-40 cursor-not-allowed bg-gray-50 border-dashed"
                      : ""
                  }`}
                >
                  {sku.size}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
