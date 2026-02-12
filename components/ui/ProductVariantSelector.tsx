"use client";

import { useMemo } from "react";

type Props = {
  product: any;
  selectedColor: string | null;
  selectedSize: any | null;
  baseUrl: string;
  onColorChange: (color: string | null) => void;
  onSizeChange: (size: any | null) => void;
};

export default function ProductVariantSelector({
  product,
  selectedColor,
  selectedSize,
  baseUrl,
  onColorChange,
  onSizeChange,
}: Props) {
  const skus = Array.isArray(product?.skus) ? product.skus : [];

  /* =====================================================
     1️⃣ BUILD COLOR GROUPS (✅ FIXED PRICING)
  ===================================================== */

  const colors = useMemo(() => {
    const map = new Map<string, any>();

    skus.forEach((sku: any) => {
      if (!sku.color) return;

      if (!map.has(sku.color)) {
        map.set(sku.color, {
          color: sku.color,
          img: sku.img1 || product.img1 || null,
          prices: [],
          totalStock: 0,
        });
      }

      const entry = map.get(sku.color);
      
      // ✅ Use finalPrice (after discount) instead of raw price
      const skuFinalPrice = sku.finalPrice ?? sku.pricing?.sellingPrice ?? sku.price;
      entry.prices.push(Number(skuFinalPrice));
      entry.totalStock += sku.stock;
    });

    return Array.from(map.values()).map((entry: any) => ({
      ...entry,
      minPrice: entry.prices.length
        ? Math.min(...entry.prices)
        : product.finalPrice ?? product.price,
      disabled: entry.totalStock <= 0,
    }));
  }, [skus, product]);

  /* =====================================================
     2️⃣ SIZES FOR SELECTED COLOR
  ===================================================== */

  const sizes = useMemo(() => {
    if (!selectedColor) return [];

    return skus
      .filter(
        (sku: any) =>
          sku.color === selectedColor && sku.size
      )
      .sort((a: any, b: any) => a.id - b.id);
  }, [skus, selectedColor]);

  /* =====================================================
     3️⃣ EARLY EXIT (ONLY IF NO SKUS AT ALL)
  ===================================================== */

  if (!skus.length) return null;

  return (
    <div className="space-y-6">

      {/* ================= COLOR SELECTOR ================= */}
      {colors.length > 0 && (
        <div className="space-y-2">

          <div className="flex gap-2">
            <span className="text-sm font-semibold">Color:</span>
            <span className="text-sm">
              {selectedColor ?? "Select"}
            </span>
          </div>

          <div className="flex flex-wrap gap-3">

            {colors.map((c: any) => {
              const isActive = c.color === selectedColor;

              return (
                <button
                  key={c.color}
                  disabled={c.disabled}
                  onClick={() => {
                    onColorChange(c.color);
                    onSizeChange(null);
                  }}
                  className={`relative w-16 rounded-md border transition
                    ${
                      isActive
                        ? "border-blue-600 ring-1 ring-blue-600"
                        : "border-gray-200 hover:border-gray-400"
                    }
                    ${
                      c.disabled
                        ? "opacity-40 cursor-not-allowed"
                        : ""
                    }`}
                >
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

                  {/* ✅ Show discounted price */}
                  <div className="text-[10px] font-semibold text-center py-1 bg-white border-t">
                    ₹{c.minPrice.toFixed(2)}
                  </div>
                </button>
              );
            })}

          </div>
        </div>
      )}

      {/* ================= SIZE SELECTOR ================= */}
      {sizes.length > 0 && (
        <div className="space-y-2">

          <div className="flex gap-2">
            <span className="text-sm font-semibold">Size:</span>
            <span className="text-sm">
              {selectedSize?.size ?? "Select"}
            </span>
          </div>

          <div className="flex flex-wrap gap-2">

            {sizes.map((sku: any) => {
              const isActive =
                selectedSize?.id === sku.id;

              const disabled = sku.stock <= 0;

              return (
                <button
                  key={sku.id}
                  disabled={disabled}
                  onClick={() => onSizeChange(sku)}
                  className={`px-4 py-2 text-xs font-bold uppercase rounded-md border-2 transition
                    ${
                      isActive
                        ? "border-blue-600 bg-blue-50 text-blue-700"
                        : "border-gray-200 hover:border-gray-400 text-gray-800"
                    }
                    ${
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
