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

    console.log("Rendering ProductCard for:", product.title , product.category?.slug);
  const productUrl = `/${product.category?.slug}/${product.slug}-${product.id}`;

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
    <div className="group relative bg-white border border-amazon-borderGray rounded-sm flex flex-col h-full hover:shadow-xl transition-shadow duration-300">
      
      {/* Wishlist - Positioned for Amazon style */}
      <div className="absolute top-2 right-2 z-20 opacity-0 group-hover:opacity-100 transition-opacity">
        <AddToWishlistButton productId={product.id} />
      </div>

      <Link href={productUrl} className="flex flex-col flex-1">
        {/* Image Container */}
        <div className="relative aspect-square w-full bg-amazon-lightGray/30 p-4 overflow-hidden">
          <img
            src={imageUrl}
            alt={product.title}
            className="w-full h-full object-contain mix-blend-multiply transition-transform duration-500 group-hover:scale-105"
          />
          
          {/* Discount Badge */}
          {hasDiscount && (
            <div className="absolute top-0 left-0 bg-amazon-danger text-white text-[11px] font-bold px-2 py-1 rounded-br-sm shadow-sm">
              {discountPercent}% OFF
            </div>
          )}
        </div>

        {/* Info Area */}
        <div className="p-3 flex flex-col flex-1 space-y-1.5">
          {/* Brand/Category Label */}
          <p className="text-[11px] font-bold text-amazon-mutedText uppercase tracking-wider">
            {product.brand || product.category.name}
          </p>

          {/* Title */}
          <h3 className="text-[13px] leading-tight text-amazon-text font-medium line-clamp-2 group-hover:text-amazon-orangeHover transition-colors">
            {product.title}
          </h3>

          {/* Ratings */}
          <div className="flex items-center gap-1">
            <div className="flex text-amazon-orange">
              {[...Array(5)].map((_, i) => (
                <Star 
                  key={i} 
                  size={12} 
                  fill={i < Math.floor(product.rating || 0) ? "currentColor" : "none"} 
                  className={i < Math.floor(product.rating || 0) ? "" : "text-amazon-borderGray"}
                />
              ))}
            </div>
            {product.reviewCount && (
              <span className="text-xs text-blue-600 font-medium">
                {product.reviewCount.toLocaleString()}
              </span>
            )}
          </div>

          {/* Price Section */}
          <div className="pt-1">
            <div className="flex items-baseline gap-1">
              <span className="text-xs font-bold text-amazon-text">₹</span>
              <span className="text-2xl font-bold text-amazon-text tracking-tighter">
                {finalPrice.toLocaleString()}
              </span>
            </div>
            
            {hasDiscount && (
              <div className="text-xs text-amazon-mutedText">
                M.R.P: <span className="line-through">₹{price.toLocaleString()}</span>
              </div>
            )}
          </div>

          {/* Delivery Tag (Amazon aesthetic) */}
          <div className="flex items-center gap-1 mt-auto">
            <span className="text-[11px] font-bold text-amazon-success">Free Delivery</span>
            <span className="text-[11px] text-amazon-mutedText">by tomorrow</span>
          </div>
        </div>
      </Link>

      {/* Add to Cart - Amazon style yellow button */}
      <div className="px-3 pb-4 mt-2">
        <AddToCartButton
          productId={product.id}
          stock={product.stock ?? 0}
        />
      </div>
    </div>
  );
}
