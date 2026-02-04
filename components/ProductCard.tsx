"use client";

import Link from "next/link";
import AddToCartButton from "@/components/cart/AddToCartButton";
import AddToWishlistButton from "@/components/wishlist/AddToWishlistButton";
import { Star } from "lucide-react";
import { Product } from "@/lib/product";

export default function ProductCard({ product }: { product?: Product }) {
  if (!product) return null;

  const imageUrl = product.img1
    ? `${process.env.NEXT_PUBLIC_API_URL}/uploads/products/${product.img1}`
    : "/placeholder.png";

  const productUrl = `/${product.category?.slug}/${product.slug}`;

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
    <div className="group relative bg-white border border-genz-border rounded-genz flex flex-col h-full hover:shadow-[0_20px_50px_rgba(0,0,0,0.05)] transition-all duration-500 overflow-hidden">
      
      {/* 1. WISHLIST pill */}
      <div className="absolute top-3 right-3 z-20 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300">
        <div className="bg-white/80 backdrop-blur-md p-1 rounded-full shadow-sm border border-genz-border">
          <AddToWishlistButton productId={product.id} />
        </div>
      </div>

      <Link href={productUrl} className="flex flex-col flex-1">
        {/* 2. IMAGE CONTAINER: aspect-[4/5] ensures it never grows too big */}
        <div className="relative aspect-[4/5] w-full bg-genz-bg overflow-hidden p-6">
          <img
            src={imageUrl}
            alt={product.title}
            /* The classes below (absolute inset-0 w-full h-full object-contain) 
               mimic the Next.js 'fill' behavior perfectly.
            */
            className="absolute inset-0 w-full h-full object-contain p-6 transition-transform duration-700 group-hover:scale-110"
          />
          
          {/* 3. DISCOUNT BADGE */}
          {hasDiscount && (
            <div className="absolute top-3 left-3 bg-genz-ink text-white text-[10px] font-black px-3 py-1 rounded-full shadow-lg tracking-widest uppercase">
              -{discountPercent}%
            </div>
          )}
        </div>

        {/* 4. INFO AREA */}
        <div className="p-5 flex flex-col flex-1">
          <p className="text-[10px] font-black text-genz-accent uppercase tracking-[0.2em] mb-1">
            {product.category?.name}
          </p>

          <h3 className="text-sm font-bold text-genz-ink leading-snug line-clamp-2 group-hover:text-genz-accent transition-colors mb-2">
            {product.title}
          </h3>

          <div className="flex items-center gap-1.5 mb-3">
            <div className="flex text-genz-accent">
              {[...Array(5)].map((_, i) => (
                <Star 
                  key={i} 
                  size={12} 
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

          <div className="mt-auto pt-2">
            <div className="flex items-baseline gap-1.5">
              <span className="text-lg font-black text-genz-ink tracking-tight">
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
