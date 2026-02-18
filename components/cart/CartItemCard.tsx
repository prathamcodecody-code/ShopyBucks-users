"use client";

import { HiOutlineTrash, HiMinus, HiPlus } from "react-icons/hi2";

// ================= HELPER TO BUILD IMAGE URLS =================
function buildImageUrl(img: string | null | undefined): string {
  if (!img) return "/placeholder.png";

  const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "";
  const base = `${API_URL}/uploads/products/`;

  if (img.startsWith("http://") || img.startsWith("https://")) {
    return img;
  }

  if (img.startsWith("/uploads/products/")) {
    return API_URL + img;
  }

  return base + img;
}

type CartItem = {
  id: number;
  quantity: number;
  unitPrice: number; // ✅ Already discounted price from backend
  mrp: number; // ✅ Original price before discount
  product: {
    title: string;
    img1?: string | null;
    price: number;
    discountType?: "PERCENT" | "FLAT" | null;
    discountValue?: number | null;
  };
  productsize?: {
    id: number;
    size?: string | null;
    color?: string | null;
    price?: number | null;
    img1?: string | null;
  } | null;
};

export default function CartItemCard({
  item,
  onIncrease,
  onDecrease,
  onRemove,
}: {
  item: CartItem;
  onIncrease: () => void;
  onDecrease: () => void;
  onRemove: () => void;
}) {
  /* =========================================================
     ✅ DISPLAY VALUES (SKU-AWARE)
  ========================================================= */

  // Image priority:
  // 1. SKU image (now enriched by backend with same-colour fallback)
  // 2. Product default image (last resort)
  const displayImage = item.productsize?.img1 || item.product.img1;

  // Colour: only from SKU
  const displayColor = item.productsize?.color;

  // Size: only from SKU
  const displaySize = item.productsize?.size;

  // ✅ Use prices from cart item (already computed by backend)
  const finalPrice = Number(item.unitPrice); // Already discounted
  const originalPrice = Number(item.mrp); // Before discount

  // Calculate discount label
  let discountLabel = "";
  if (originalPrice > finalPrice) {
    if (item.product.discountType === "PERCENT" && item.product.discountValue) {
      discountLabel = `${item.product.discountValue}% OFF`;
    } else if (item.product.discountType === "FLAT" && item.product.discountValue) {
      discountLabel = `₹${item.product.discountValue} OFF`;
    } else {
      const savingPercent = Math.round(((originalPrice - finalPrice) / originalPrice) * 100);
      discountLabel = `${savingPercent}% OFF`;
    }
  }

  return (
    <div className="group bg-white rounded-2xl p-4 flex gap-5 border border-transparent hover:border-amazon-borderGray shadow-sm transition-all duration-200">
      
      {/* IMAGE SECTION */}
      <div className="relative w-28 h-36 bg-amazon-lightGray rounded-xl overflow-hidden shrink-0 border border-gray-100">
        <img
          src={buildImageUrl(displayImage)}
          alt={item.product.title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          onError={(e) => {
            e.currentTarget.src = "/placeholder.png";
          }}
        />
      </div>

      {/* DETAILS SECTION */}
      <div className="flex-1 flex flex-col justify-between py-1">
        <div>
          <div className="flex justify-between items-start gap-2">
            <h3 className="font-bold text-amazon-text text-base leading-tight line-clamp-2">
              {item.product.title}
            </h3>
            <button
              onClick={onRemove}
              className="p-1.5 text-amazon-mutedText hover:text-amazon-danger hover:bg-red-50 rounded-full transition-colors"
              title="Remove Item"
            >
              <HiOutlineTrash size={20} />
            </button>
          </div>

          <p className="text-xs text-amazon-mutedText mt-1 flex items-center gap-1">
            Sold by <span className="text-amazon-darkBlue font-semibold">ShopyBucks Partner</span>
          </p>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            {/* COLOR BADGE */}
            {displayColor && (
              <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 px-2.5 py-1 rounded-md">
                <span className="text-[10px] font-bold text-amazon-mutedText uppercase tracking-wider">Color:</span>
                <span className="text-xs font-black text-amazon-darkBlue">{displayColor}</span>
              </div>
            )}

            {/* SIZE BADGE */}
            {displaySize && (
              <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 px-2.5 py-1 rounded-md">
                <span className="text-[10px] font-bold text-amazon-mutedText uppercase tracking-wider">Size:</span>
                <span className="text-xs font-black text-amazon-darkBlue">{displaySize}</span>
              </div>
            )}

            {/* QUANTITY CONTROLS */}
            <div className="flex items-center bg-white border border-gray-300 rounded-lg overflow-hidden shadow-sm">
              <button
                onClick={onDecrease}
                className="p-1.5 hover:bg-gray-100 text-amazon-darkBlue transition-colors active:scale-90"
              >
                <HiMinus size={14} />
              </button>
              <span className="w-8 text-center text-sm font-black text-amazon-darkBlue select-none">
                {item.quantity}
              </span>
              <button
                onClick={onIncrease}
                className="p-1.5 hover:bg-gray-100 text-amazon-darkBlue transition-colors active:scale-90"
              >
                <HiPlus size={14} />
              </button>
            </div>
          </div>
        </div>

        {/* BOTTOM SECTION: PRICE & POLICY */}
        <div className="mt-4 flex items-end justify-between border-t border-gray-50 pt-3">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2 flex-wrap">
              {/* ✅ Final price (after discount) */}
              <span className="text-xl font-black text-amazon-text tracking-tight">
                ₹{(finalPrice * item.quantity).toLocaleString()}
              </span>
              
              {/* ✅ Show original price + discount if there's a saving */}
              {finalPrice < originalPrice && (
                <div className="flex items-center gap-1.5">
                  <span className="text-sm line-through text-amazon-mutedText">
                    ₹{(originalPrice * item.quantity).toLocaleString()}
                  </span>
                  {discountLabel && (
                    <span className="text-xs font-bold text-amazon-success bg-green-50 px-1.5 py-0.5 rounded">
                      {discountLabel}
                    </span>
                  )}
                </div>
              )}
            </div>
            <p className="flex items-center gap-1 text-[10px] font-bold text-amazon-success uppercase tracking-wide">
              <CheckCircle size={10} /> 14 Days Return Available
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Simple internal helper icon
function CheckCircle({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
      <polyline points="22 4 12 14.01 9 11.01"></polyline>
    </svg>
  );
}
