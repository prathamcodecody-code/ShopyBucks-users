"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AddToCartButton from "@/components/cart/AddToCartButton";
import AddToWishlistButton from "@/components/wishlist/AddToWishlistButton";
import { Star } from "lucide-react";
import { Product } from "@/lib/product";

// ================= IMAGE URL =================
function buildImageUrl(img: string | null | undefined): string {
  if (!img) return "/placeholder.png";
  const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "";
  const base = `${API_URL}/uploads/products/`;
  if (img.startsWith("http://") || img.startsWith("https://")) return img;
  if (img.startsWith("/uploads/products/")) return API_URL + img;
  return base + img;
}

// ================= PRICING =================
function resolvePricing(item: {
  price: number;
  finalPrice?: number;
  discountType?: "PERCENT" | "FLAT";
  discountValue?: number;
  pricing?: any;
}) {
  if (item.pricing) {
    return {
      finalPrice: item.pricing.sellingPrice ?? item.pricing.finalPrice ?? item.price,
      mrp: item.pricing.mrp ?? item.price,
      discountPercent: item.pricing.discountPercent ?? 0,
      discountAmount: item.pricing.discountAmount ?? 0,
      hasDiscount: item.pricing.hasDiscount ?? false,
    };
  }
  if (item.finalPrice) {
    const discountAmount = item.price - item.finalPrice;
    const discountPercent = item.price > 0 ? Math.round((discountAmount / item.price) * 100) : 0;
    return { finalPrice: item.finalPrice, mrp: item.price, discountPercent, discountAmount, hasDiscount: discountPercent > 0 };
  }
  const mrp = Number(item.price) || 0;
  let finalPrice = mrp;
  let discountAmount = 0;
  let discountPercent = 0;
  if (item.discountType === "PERCENT" && item.discountValue) {
    discountPercent = item.discountValue;
    discountAmount = Math.round((mrp * discountPercent) / 100);
    finalPrice = mrp - discountAmount;
  }
  if (item.discountType === "FLAT" && item.discountValue) {
    discountAmount = item.discountValue;
    finalPrice = mrp - discountAmount;
    discountPercent = mrp > 0 ? Math.round((discountAmount / mrp) * 100) : 0;
  }
  return { finalPrice, mrp, discountPercent, discountAmount, hasDiscount: discountPercent > 0 };
}

function hasRealSize(size: string | null | undefined): boolean {
  if (size == null) return false;
  const t = String(size).trim().toLowerCase();
  return t !== "" && t !== "null" && t !== "none" && t !== "no_size" && t !== "n/a";
}

export default function ProductCard({ product }: { product?: Product & { __sponsored?: boolean } }) {
  const router = useRouter();
  const [currentImg, setCurrentImg] = useState(1);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const startInterval = () => {
    if (!product?.img2) return;
    intervalRef.current = setInterval(() => setCurrentImg((prev) => (prev === 1 ? 2 : 1)), 3000);
  };
  const stopInterval = () => { if (intervalRef.current) clearInterval(intervalRef.current); };

  useEffect(() => {
    startInterval();
    return () => stopInterval();
  }, [product?.img2]);

  if (!product) return null;

  const isSponsored = product.isSponsored || product.__sponsored;
  const img1 = buildImageUrl(product.img1);
  const img2 = buildImageUrl(product.img2);
  const productUrl = `/${product.category?.slug}/${product.slug}`;

  // Pricing & Stock Logic
  const pricing = resolvePricing({
    price: product.price,
    finalPrice: product.finalPrice,
    discountType: product.discountType,
    discountValue: product.discountValue,
    pricing: product.pricing,
  });

  const skus: any[] = product.skus ?? [];
  const isSingleNoSizeSku = skus.length === 1 && !hasRealSize(skus[0]?.size);
  const directVariantId = isSingleNoSizeSku ? skus[0]?.id : undefined;
  const requiresVariantSelection = !isSingleNoSizeSku;

  return (
    <div className="group relative bg-white border border-genz-border rounded-genz flex flex-col h-full hover:shadow-[0_30px_60px_rgba(0,0,0,0.08)] transition-all duration-500 overflow-hidden">
      
      {/* ✅ INTEGRATED SPONSORED BADGE (Top Right) */}
      {isSponsored && (
        <div className="absolute top-3 right-3 z-30">
          <span className="bg-genz-softAccent text-genz-accent text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest border border-genz-accent/10 shadow-sm">
            Sponsored
          </span>
        </div>
      )}

      {/* WISHLIST (Pushed down if sponsored) */}
      <div className={`absolute ${isSponsored ? 'top-10' : 'top-3'} right-3 z-20 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300`}>
        <div className="bg-white/90 backdrop-blur-md p-1 rounded-full shadow-sm border border-genz-border hover:bg-genz-ink hover:text-white transition-colors">
          <AddToWishlistButton productId={product.id} />
        </div>
      </div>

      <Link href={productUrl} className="flex flex-col flex-1">
        <div className="relative aspect-[4/5] w-full bg-[#F3F4F6] overflow-hidden">
          <img src={img1} alt={product.title} className={`absolute inset-0 w-full h-full object-cover object-top transition-all duration-1000 ease-in-out group-hover:scale-110 ${currentImg === 1 ? "opacity-100" : "opacity-0"}`} />
          {img2 && img2 !== "/placeholder.png" && (
            <img src={img2} alt={product.title} className={`absolute inset-0 w-full h-full object-cover object-top transition-all duration-1000 ease-in-out group-hover:scale-110 ${currentImg === 2 ? "opacity-100" : "opacity-0"}`} />
          )}

          {/* DISCOUNT BADGE (Top Left) */}
          {pricing.hasDiscount && pricing.discountPercent > 0 && (
            <div className="absolute top-3 left-3 bg-genz-ink text-white text-[9px] font-black px-3 py-1 rounded-full z-10">
              -{pricing.discountPercent}%
            </div>
          )}
        </div>

        <div className="p-5 flex flex-col flex-1">
          <p className="text-[10px] font-black text-genz-accent uppercase tracking-[0.2em] mb-1">
            {product.category?.name}
          </p>
          <h3 className="text-sm font-bold text-genz-ink leading-snug line-clamp-2 mb-2">
            {product.title}
          </h3>

          <div className="mt-auto pt-2 flex items-center justify-between">
            <div className="flex items-baseline gap-1.5 flex-wrap">
              <span className="text-xl font-black text-genz-ink tracking-tight">
                ₹{pricing.finalPrice.toLocaleString()}
              </span>
              {pricing.hasDiscount && (
                <span className="text-xs text-genz-muted line-through font-medium">
                  ₹{pricing.mrp.toLocaleString()}
                </span>
              )}
            </div>
          </div>
        </div>
      </Link>

      <div className="px-4 pb-5">
        {requiresVariantSelection ? (
          <button onClick={() => router.push(productUrl)} className="w-full py-4 rounded-full font-black text-xs uppercase tracking-widest transition-all bg-genz-ink text-white hover:bg-genz-accent">
            Buy Now
          </button>
        ) : (
          <AddToCartButton productId={product.id} stock={product.totalStock ?? 1} variantId={directVariantId} requiresVariantSelection={false} />
        )}
      </div>
    </div>
  );
}
