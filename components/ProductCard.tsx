"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import AddToCartButton from "@/components/cart/AddToCartButton";
import AddToWishlistButton from "@/components/wishlist/AddToWishlistButton";
import { Star } from "lucide-react";
import { Product } from "@/lib/product";

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
      setCurrentImg(2); // Show second image immediately on hover
    }
  };

  const handleMouseLeave = () => {
    if (product?.img2) {
      setCurrentImg(1); // Reset to first image
      startInterval();
    }
  };

  if (!product) return null;

  const baseImgUrl = `${process.env.NEXT_PUBLIC_API_URL}/uploads/products/`;
  const img1 = product.img1 ? `${baseImgUrl}${product.img1}` : "/placeholder.png";
  const img2 = product.img2 ? `${baseImgUrl}${product.img2}` : null;
  
  const productUrl = `/${product.category?.slug}/${product.slug}`;

  // Pricing Logic
  const price = Number(product.price) || 0;
  let finalPrice = price;
  let discountPercent: number | null = null;

  if (product.discountType === "PERCENT" && product.discountValue) {
    finalPrice = Math.round(price - (price * product.discountValue) / 100);
    discountPercent = product.discountValue;
  } else if (product.discountType === "FLAT" && product.discountValue) {
    finalPrice = Math.max(0, price - product.discountValue);
    discountPercent = Math.round(((price - finalPrice) / price) * 100);
  }

  const hasDiscount = finalPrice < price;

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
          {img2 && (
            <img
              src={img2}
              alt={`${product.title} view 2`}
              className={`absolute inset-0 w-full h-full object-cover object-top transition-all duration-1000 ease-in-out group-hover:scale-110
                ${currentImg === 2 ? "opacity-100" : "opacity-0"}`}
            />
          )}

          {/* IMAGE INDICATORS (Dots) */}
          {img2 && (
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
              <div className={`h-1 rounded-full transition-all duration-500 ${currentImg === 1 ? "w-4 bg-genz-accent" : "w-1 bg-white/50"}`} />
              <div className={`h-1 rounded-full transition-all duration-500 ${currentImg === 2 ? "w-4 bg-genz-accent" : "w-1 bg-white/50"}`} />
            </div>
          )}
          
          {/* 3. DISCOUNT BADGE */}
          {hasDiscount && (
            <div className="absolute top-3 left-3 bg-genz-ink text-white text-[9px] font-black px-3 py-1 rounded-full shadow-xl tracking-tighter uppercase z-10">
              -{discountPercent}%
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
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl font-black text-genz-ink tracking-tight">
                ₹{finalPrice.toLocaleString()}
              </span>
              {hasDiscount && (
                <span className="text-xs text-genz-muted line-through font-medium">
                  ₹{price.toLocaleString()}
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
          stock={product.stock ?? 0}
        />
      </div>
    </div>
  );
}
