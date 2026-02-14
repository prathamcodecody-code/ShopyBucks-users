"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import AddToCartButton from "@/components/cart/AddToCartButton";
import AddToWishlistButton from "@/components/wishlist/AddToWishlistButton";
import { Star } from "lucide-react";
import { Product } from "@/lib/product";

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

// ================= ✅ FIXED PRICING LOGIC =================
// This should match your backend's computePricing function
function resolvePricing(item: {
  price: number; // This is the MRP/base price
  finalPrice?: number; // If backend already computed it
  discountType?: "PERCENT" | "FLAT";
  discountValue?: number;
  pricing?: any; // If backend returns pricing object
}) {
  // ✅ If backend already computed pricing, use it
  if (item.pricing) {
    return {
      finalPrice: item.pricing.sellingPrice ?? item.pricing.finalPrice ?? item.price,
      mrp: item.pricing.mrp ?? item.price,
      discountPercent: item.pricing.discountPercent ?? 0,
      discountAmount: item.pricing.discountAmount ?? 0,
      hasDiscount: item.pricing.hasDiscount ?? false,
    };
  }

  // ✅ If finalPrice exists, use it
  if (item.finalPrice) {
    const discountAmount = item.price - item.finalPrice;
    const discountPercent = item.price > 0 ? Math.round((discountAmount / item.price) * 100) : 0;

    return {
      finalPrice: item.finalPrice,
      mrp: item.price,
      discountPercent,
      discountAmount,
      hasDiscount: discountPercent > 0,
    };
  }

  // ✅ Calculate from discount type/value
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

  return {
    finalPrice,
    mrp,
    discountPercent,
    discountAmount,
    hasDiscount: discountPercent > 0,
  };
}

export default function ProductCard({ product }: { product?: Product }) {
  const [currentImg, setCurrentImg] = useState(1);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // ---------- IMAGE SWAP LOGIC ----------
  const startInterval = () => {
    if (!product?.img2) return;
    intervalRef.current = setInterval(() => {
      setCurrentImg((prev) => (prev === 1 ? 2 : 1));
    }, 3000);
  };

  const stopInterval = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  useEffect(() => {
    startInterval();
    return () => stopInterval();
  }, [product?.img2]);

  const handleMouseEnter = () => {
    if (product?.img2) {
      stopInterval();
      setCurrentImg(2);
    }
  };

  const handleMouseLeave = () => {
    if (product?.img2) {
      setCurrentImg(1);
      startInterval();
    }
  };

  if (!product) return null;

  // ✅ Use helper function for images
  const img1 = buildImageUrl(product.img1);
  const img2 = buildImageUrl(product.img2);
  
  const productUrl = `/${product.category?.slug}/${product.slug}`;

  // ================= ✅ FIXED PRICING LOGIC =================
  // 1️⃣ Collect all possible prices (from SKUs/variants)
  const prices: number[] = [];

  // SKU prices (if using SKU system)
  if (product.skus?.length) {
    product.skus.forEach((sku: any) => {
      const skuFinal = sku.finalPrice ?? sku.pricing?.sellingPrice ?? sku.price;
      if (skuFinal != null && Number(skuFinal) > 0) {
        prices.push(Number(skuFinal));
      }
    });
  }

  // Variant prices (old system)
  if (product.variants?.length) {
    product.variants.forEach((v: any) => {
      if (v.price != null && Number(v.price) > 0) {
        prices.push(Number(v.price));
      }
    });
  }

  // Size prices (old system)
  if (product.sizes?.length) {
    product.sizes.forEach((s: any) => {
      if (s.price != null && Number(s.price) > 0) {
        prices.push(Number(s.price));
      }
    });
  }

  // 2️⃣ Get the base price to display
  let displayPrice = product.price;
  
  // ✅ If backend sent finalPrice, use it
  if (product.finalPrice) {
    displayPrice = product.finalPrice;
  }
  // ✅ If we have SKU prices, use the lowest
  else if (prices.length > 0) {
    displayPrice = Math.min(...prices);
  }

  // 3️⃣ Apply pricing logic
  const pricing = resolvePricing({
    price: product.price, // MRP
    finalPrice: displayPrice, // Final price after discount
    discountType: product.discountType,
    discountValue: product.discountValue,
    pricing: product.pricing, // If backend sent pricing object
  });

  // 4️⃣ Flags
  const hasVariants = (product.skus?.length ?? 0) > 0 || 
                      (product.variants?.length ?? 0) > 0 || 
                      (product.sizes?.length ?? 0) > 0;

  // ✅ 5️⃣ Calculate total stock (AGGRESSIVE FALLBACK FOR LISTING PAGE)
  let totalStock = 0;

  // For product listing, we might not have SKU data from API
  // So we use multiple fallbacks to prevent false "sold out"
  
  if (product.totalStock !== undefined && product.totalStock !== null && product.totalStock > 0) {
    totalStock = product.totalStock;
  } else if (product.skus?.length) {
    totalStock = product.skus.reduce((sum: number, sku: any) => sum + (sku.stock ?? 0), 0);
  } else if (product.variants?.length) {
    totalStock = product.variants.reduce((sum: number, v: any) => sum + (v.stock ?? 0), 0);
  } else if (product.sizes?.length) {
    totalStock = product.sizes.reduce((sum: number, s: any) => sum + (s.stock ?? 0), 0);
  } else if (product.stock !== undefined && product.stock !== null && product.stock > 0) {
    totalStock = product.stock;
  } else {
    // ⚠️ CRITICAL FALLBACK for listing pages
    // If product exists in listing but has no stock data, assume it's available
    // The actual stock will be validated on PDP and during add-to-cart
    totalStock = 1;
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`⚠️ Product ${product.id} has no stock data - assuming available for listing`);
    }
  }

  return (
    <div 
      className="group relative bg-white border border-genz-border rounded-genz flex flex-col h-full hover:shadow-[0_30px_60px_rgba(0,0,0,0.08)] transition-all duration-500 overflow-hidden"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* 1. WISHLIST */}
      <div className="absolute top-3 right-3 z-20 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300">
        <div className="bg-white/90 backdrop-blur-md p-1 rounded-full shadow-sm border border-genz-border hover:bg-genz-ink hover:text-white transition-colors">
          <AddToWishlistButton productId={product.id} />
        </div>
      </div>

      <Link href={productUrl} className="flex flex-col flex-1">
        {/* 2. IMAGE CONTAINER */}
        <div className="relative aspect-[4/5] w-full bg-[#F3F4F6] overflow-hidden">
          {/* PRIMARY IMAGE */}
          <img
            src={img1}
            alt={product.title}
            className={`absolute inset-0 w-full h-full object-cover object-top transition-all duration-1000 ease-in-out group-hover:scale-110 
              ${currentImg === 1 ? "opacity-100" : "opacity-0"}`}
          />

          {/* SECONDARY IMAGE */}
          {img2 && img2 !== "/placeholder.png" && (
            <img
              src={img2}
              alt={`${product.title} view 2`}
              className={`absolute inset-0 w-full h-full object-cover object-top transition-all duration-1000 ease-in-out group-hover:scale-110
                ${currentImg === 2 ? "opacity-100" : "opacity-0"}`}
            />
          )}

          {/* IMAGE INDICATORS (Dots) */}
          {img2 && img2 !== "/placeholder.png" && (
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
              <div className={`h-1 rounded-full transition-all duration-500 ${currentImg === 1 ? "w-4 bg-genz-accent" : "w-1 bg-white/50"}`} />
              <div className={`h-1 rounded-full transition-all duration-500 ${currentImg === 2 ? "w-4 bg-genz-accent" : "w-1 bg-white/50"}`} />
            </div>
          )}
          
          {/* 3. DISCOUNT BADGE */}
          {pricing.hasDiscount && pricing.discountPercent > 0 && (
            <div className="absolute top-3 left-3 bg-genz-ink text-white text-[9px] font-black px-3 py-1 rounded-full">
              -{pricing.discountPercent}%
            </div>
          )}
        </div>

        {/* 4. INFO AREA */}
        <div className="p-5 flex flex-col flex-1">
          <p className="text-[10px] font-black text-genz-accent uppercase tracking-[0.2em] mb-1">
            {product.category?.name}
          </p>

          <h3 className="text-sm font-bold text-genz-ink leading-snug line-clamp-2 transition-colors mb-2">
            {product.title}
          </h3>

          <div className="flex items-center gap-1.5 mb-3">
            <div className="flex text-genz-ink">
              {[...Array(5)].map((_, i) => (
                <Star 
                  key={i} 
                  size={10} 
                  fill={i < Math.floor(product.rating || 0) ? "currentColor" : "none"} 
                  className={i < Math.floor(product.rating || 0) ? "" : "text-genz-border"}
                />
              ))}
            </div>
            {product.reviewCount && (
              <span className="text-[10px] text-genz-muted font-bold tracking-tighter">
                ({product.reviewCount.toLocaleString()})
              </span>
            )}
          </div>

          <div className="mt-auto pt-2 flex items-center justify-between">
            <div className="flex items-baseline gap-1.5 flex-wrap">
              {/* ✅ Show FINAL PRICE (after discount) */}
              <span className="text-xl font-black text-genz-ink tracking-tight">
                ₹{pricing.finalPrice.toLocaleString()}
              </span>

              {/* ✅ Show "onwards" for variant products */}
              {hasVariants && (
                <span className="text-[10px] text-genz-muted font-bold">
                  onwards
                </span>
              )}

              {/* ✅ Show MRP if there's a discount */}
              {pricing.hasDiscount && (
                <span className="text-xs text-genz-muted line-through font-medium">
                  ₹{pricing.mrp.toLocaleString()}
                </span>
              )}
            </div>
          </div>
        </div>
      </Link>

      {/* 5. ADD TO CART */}
      <div className="px-4 pb-5">
        <AddToCartButton
          productId={product.id}
          stock={totalStock}
          disabled={false}
        />
      </div>
    </div>
  );
}
