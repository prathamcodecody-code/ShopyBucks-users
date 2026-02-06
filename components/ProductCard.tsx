"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import AddToWishlistButton from "@/components/wishlist/AddToWishlistButton";

type Product = {
  id: number;
  slug?: string;
  title: string;
  brand?: string;
  price: number | string;
  discountType?: "PERCENT" | "FLAT" | null;
  discountValue?: number | null;
  rating?: number;
  reviewCount?: number;
  img1?: string | null;
  img2?: string | null;
  stock?: number;
};

export default function ProductCard({ product }: { product?: Product }) {
  const [currentImg, setCurrentImg] = useState(1);
  const [rotate, setRotate] = useState({ x: 0, y: 0 });
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // ---------- AUTO-SWAP LOGIC ----------
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

  // ---------- REFINED TILT HANDLERS ----------
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget;
    const box = card.getBoundingClientRect();
    
    // Calculate mouse position relative to center of card
    const x = e.clientX - box.left;
    const y = e.clientY - box.top;
    const centerX = box.width / 2;
    const centerY = box.height / 2;
    
    // Calculate rotation (Max 12 degrees for a noticeable but elegant tilt)
    const rotateX = (centerY - y) / 10; 
    const rotateY = (x - centerX) / 10;

    setRotate({ x: rotateX, y: rotateY });
  };

  const handleMouseEnter = () => {
    if (product?.img2) {
      stopInterval();
      setCurrentImg(2);
    }
  };

  const handleMouseLeave = () => {
    setRotate({ x: 0, y: 0 }); // Smoothly snap back to center
    if (product?.img2) {
      setCurrentImg(1);
      startInterval();
    }
  };

  if (!product) return null;

  const baseImgUrl = `${process.env.NEXT_PUBLIC_API_URL}/uploads/products/`;
  const img1 = product.img1 ? `${baseImgUrl}${product.img1}` : "/placeholder.png";
  const img2 = product.img2 ? `${baseImgUrl}${product.img2}` : null;
  const productUrl = `/products/${product.slug}-${product.id}`;
  const price = Number(product.price) || 0;

  let finalPrice = price;
  let discountText: string | null = null;
  if (product.discountType === "PERCENT" && product.discountValue) {
    finalPrice = Math.round(price - (price * product.discountValue) / 100);
    discountText = `${product.discountValue}% OFF`;
  } else if (product.discountType === "FLAT" && product.discountValue) {
    finalPrice = Math.max(0, price - product.discountValue);
    discountText = `₹${product.discountValue} OFF`;
  }

  const hasDiscount = finalPrice < price;

  return (
    <div 
      className="group relative bg-white border-none"
      onMouseEnter={handleMouseEnter}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ perspective: "1000px" }} 
    >
      <div className="absolute top-3 right-3 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <AddToWishlistButton productId={product.id} />
      </div>

      <Link href={productUrl} className="block">
        {/* Animated Container */}
        <div 
          className="relative w-full aspect-[3/4] bg-[#F9F9F9] overflow-hidden rounded-sm transition-all duration-200 ease-out shadow-sm group-hover:shadow-2xl"
          style={{ 
            transform: `rotateX(${rotate.x}deg) rotateY(${rotate.y}deg) scale3d(1.05, 1.05, 1.05)`,
            transformStyle: "preserve-3d",
            willChange: "transform"
          }}
        >
          {/* PRIMARY IMAGE */}
          <img
            src={img1}
            alt={product.title}
            className={`absolute inset-0 w-full h-full object-contain p-2 transition-all duration-1000 ease-in-out 
              ${currentImg === 1 ? "opacity-100 scale-100" : "opacity-0 scale-110"}`}
            style={{ transform: "translateZ(20px)" }} // Adds depth to the image
          />

          {/* SECONDARY IMAGE */}
          {img2 && (
            <img
              src={img2}
              alt={`${product.title} alternate view`}
              className={`absolute inset-0 w-full h-full object-contain p-2 transition-all duration-1000 ease-in-out
                ${currentImg === 2 ? "opacity-100 scale-100" : "opacity-0 scale-110"}`}
              style={{ transform: "translateZ(20px)" }}
            />
          )}
          
          {/* Progress Indicators */}
          {img2 && (
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1 z-10">
              <div className={`h-0.5 w-4 rounded-full transition-all ${currentImg === 1 ? "bg-brandPink" : "bg-gray-200"}`} />
              <div className={`h-0.5 w-4 rounded-full transition-all ${currentImg === 2 ? "bg-brandPink" : "bg-gray-200"}`} />
            </div>
          )}

          {hasDiscount && (
            <span 
              className="absolute bottom-3 left-3 z-10 bg-brandBlack text-white text-[9px] px-2 py-1 font-black uppercase tracking-widest shadow-sm"
              style={{ transform: "translateZ(30px)" }} // Badge floats higher
            >
              {discountText}
            </span>
          )}
        </div>

        {/* Text Section */}
        <div className="mt-4 space-y-1 px-1 transition-all duration-300 group-hover:translate-y-[-4px]">
          <p className="text-[10px] text-gray-400 uppercase tracking-[0.2em] font-black">
            {product.brand || "Boutique"}
          </p>

          <h3 className="text-[13px] font-bold text-gray-800 leading-tight group-hover:text-brandPink transition-colors line-clamp-1">
            {product.title}
          </h3>

          <div className="flex items-center gap-2 pt-1">
            <span className="text-sm font-black text-brandBlack">
              ₹{finalPrice.toLocaleString()}
            </span>
            {hasDiscount && (
              <span className="text-[11px] text-gray-400 line-through font-medium">
                ₹{price.toLocaleString()}
              </span>
            )}
          </div>
        </div>
      </Link>
    </div>
  );
}
