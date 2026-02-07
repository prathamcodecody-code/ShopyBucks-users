"use client";

import { useMemo } from "react";

type Props = {
  product: any;
  selectedColor: string | null;
  selectedSizeId: number | null;
  baseUrl: string; // Base URL for product images
  onColorChange: (color: string | null) => void;
  onSizeChange: (size: any | null) => void;
};

export default function ProductVariantSelector({
  product,
  selectedColor,
  selectedSizeId,
  baseUrl,
  onColorChange,
  onSizeChange,
}: Props) {
  const variants = Array.isArray(product.variants) ? product.variants : [];
  const productSizes = Array.isArray(product.productsize) ? product.productsize : [];
  const hasColorVariants = product.hasVariants && variants.length > 0;

  /* --- Unique Color Objects for Thumbnails --- */
  const uniqueColorOptions = useMemo(() => {
    if (!hasColorVariants) return [];
    
    const options = [];
    const seenColors = new Set();

    // 1. Add base product as the first option
    if (product.baseColor) {
      options.push({
        color: product.baseColor,
        img: product.img1,
        price: product.finalPrice || product.price
      });
      seenColors.add(product.baseColor);
    }

    // 2. Add variant colors
    variants.forEach((v: any) => {
      if (!seenColors.has(v.color)) {
        options.push({
          color: v.color,
          img: v.img1,
          price: v.price
        });
        seenColors.add(v.color);
      }
    });

    return options;
  }, [variants, hasColorVariants, product]);

  /* --- Sizes for current color --- */
  const sizes = useMemo(() => {
    if (hasColorVariants) {
      if (!selectedColor || selectedColor === product.baseColor) return productSizes;
      return variants.filter((v: any) => v.color === selectedColor);
    }
    return productSizes;
  }, [hasColorVariants, variants, selectedColor, productSizes, product.baseColor]);

  if (!hasColorVariants && sizes.length === 0) return null;

  return (
    <div className="space-y-6">
      {/* AMAZON STYLE COLOR SELECTOR */}
      {hasColorVariants && (
        <div>
          <div className="flex gap-1 mb-2">
            <h3 className="text-sm font-bold">Color:</h3>
            <span className="text-sm">{selectedColor}</span>
          </div>
          
          <div className="flex gap-2 flex-wrap">
            {uniqueColorOptions.map((opt) => {
              const isActive = opt.color === selectedColor;
              return (
                <button
                  key={opt.color}
                  onClick={() => onColorChange(opt.color)}
                  className={`relative flex flex-col border-2 rounded-md overflow-hidden transition-all text-left
                    ${isActive ? "border-blue-600 ring-1 ring-blue-600" : "border-gray-200 hover:border-gray-400"}
                  `}
                >
                  {/* Thumbnail Image */}
                  <div className="w-14 h-16 bg-gray-50">
                    <img
                      src={`${baseUrl}${opt.img}`}
                      alt={opt.color}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  {/* Price display below image */}
                  <div className="p-1 bg-white text-center border-t border-gray-100">
                    <span className="text-[10px] font-bold text-gray-900">₹{opt.price}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* SIZE SELECTOR */}
      {sizes.length > 0 && (
        <div>
          <div className="flex gap-1 mb-2">
            <h3 className="text-sm font-bold">Size:</h3>
            <span className="text-sm">{sizes.find((s:any) => s.id === selectedSizeId)?.size || ""}</span>
          </div>
          
          <div className="flex gap-2 flex-wrap">
            {sizes.map((s: any) => {
              const isActive = selectedSizeId === s.id;
              const isAvailable = s.stock > 0;

              return (
                <button
                  key={s.id}
                  disabled={!isAvailable}
                  onClick={() => onSizeChange(s)}
                  className={`min-w-[50px] px-3 py-2 rounded-md border transition font-medium text-sm
                    ${isActive 
                      ? "border-blue-600 bg-blue-50 text-blue-700 shadow-sm" 
                      : "border-gray-300 text-gray-700 hover:bg-gray-50"
                    }
                    ${!isAvailable ? "bg-gray-50 text-gray-400 border-dashed cursor-not-allowed opacity-60" : ""}
                  `}
                >
                  {s.size || "Free"}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}