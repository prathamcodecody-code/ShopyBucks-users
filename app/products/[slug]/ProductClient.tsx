"use client";

import { useEffect, useMemo, useState } from "react";
import ProductImages from "@/components/ProductImages";
import AddToCartButton from "@/components/cart/AddToCartButton";
import ProductVariantSelector from "@/components/ui/ProductVariantSelector";
import TrendingNow from "@/components/TrendingSection";
import NewArrivals from "@/components/NewArrivals";
import { api } from "@/lib/api";
import { Star } from "lucide-react";

export default function ProductClient({ product }: any) {
  /* -----------------------------------------
      STATE
  ----------------------------------------- */
  const [selectedSize, setSelectedSize] = useState<any | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);

  useEffect(() => {
    if (product.hasVariants && product.baseColor && !selectedColor) {
      setSelectedColor(product.baseColor);
    }
  }, [product.hasVariants, product.baseColor, selectedColor]);

  /* -----------------------------------------
      REVIEWS
  ----------------------------------------- */
  const [reviews, setReviews] = useState<any[]>([]);
  const [avg, setAvg] = useState<number | null>(null);

  useEffect(() => {
    api.get(`/reviews/product/${product.id}`)
      .then(res => {
        setReviews(res.data.reviews || []);
        setAvg(res.data.averageRating);
      })
      .catch(() => {
        setReviews([]);
        setAvg(null);
      });
  }, [product.id]);

  /* -----------------------------------------
      DERIVED VALUES
  ----------------------------------------- */
  const productSizes = Array.isArray(product.productsize) ? product.productsize : [];
  const hasColorVariants = product.hasVariants && Array.isArray(product.variants) && product.variants.length > 0;

  const activeVariant = useMemo(() => {
    if (!hasColorVariants || !selectedColor || selectedColor === product.baseColor) return null;
    if (selectedSize) return selectedSize;
    return product.variants.find((v: any) => v.color === selectedColor) || null;
  }, [hasColorVariants, selectedColor, selectedSize, product.variants, product.baseColor]);

  const activeImages = useMemo(() => {
    const variantImages = [activeVariant?.img1, activeVariant?.img2, activeVariant?.img3].filter(Boolean);
    if (variantImages.length > 0) return variantImages;
    return [product.img1, product.img2, product.img3, product.img4].filter(Boolean);
  }, [activeVariant, product]);

  const activePrice = useMemo(() => {
    if (!hasColorVariants && selectedSize?.price) return Number(selectedSize.price);
    if (activeVariant?.price) return Number(activeVariant.price);
    if (selectedSize?.price != null) return Number(selectedSize.price);
    return Number(product.finalPrice ?? product.price);
  }, [selectedSize, activeVariant, hasColorVariants, product]);

  const activeStock = useMemo(() => {
    if (selectedSize?.stock !== undefined) return Number(selectedSize.stock);
    if (activeVariant?.stock !== undefined) return Number(activeVariant.stock);
    return Number(product.stock ?? 0);
  }, [selectedSize, activeVariant, product.stock]);

  const isOutOfStock = activeStock <= 0;

  const pricing = product.pricing || { mrp: Number(product.price) || 0, discountPercent: 0 };
  const displayMRP = useMemo(() => {
    if (!hasColorVariants && selectedSize?.price) {
      const sizePrice = Number(selectedSize.price);
      return pricing.discountPercent > 0 ? Math.round(sizePrice / (1 - pricing.discountPercent / 100)) : sizePrice;
    }
    return pricing.mrp;
  }, [hasColorVariants, selectedSize, pricing]);

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 lg:py-12">
      {/* REFINED GRID: 
          Changed gap to 16 for better breathing room and adjusted column ratio
      */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
        
        {/* IMAGES: Taking up 5/12 columns to make images smaller and more focused */}
        <div className="lg:col-span-5 sticky top-24">
          <ProductImages images={activeImages} />
        </div>

        {/* DETAILS: Taking up 7/12 columns */}
        <div className="lg:col-span-7 flex flex-col space-y-6">
          <div className="space-y-3">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-genz-accent">
              {product.category?.name}
            </p>

            {/* REDUCED TITLE SIZE: Changed from 5xl to 3xl for better hierarchy */}
            <h1 className="text-2xl md:text-3xl font-black text-genz-ink leading-tight uppercase tracking-tighter">
              {product.title}
            </h1>

            {/* HIDE RATINGS IF 0: Uses logical AND to check for existence and non-zero value */}
            {avg !== null && avg > 0 && (
              <div className="flex items-center gap-3">
                <div className="flex items-center bg-genz-ink text-white px-3 py-1 rounded-full text-xs font-black">
                  {avg} <Star size={12} className="ml-1 fill-genz-accent text-genz-accent" />
                </div>
                <span className="text-xs font-bold text-genz-muted uppercase tracking-widest">
                  {reviews.length} Ratings
                </span>
              </div>
            )}
          </div>

          <div className="space-y-1">
            <div className="flex items-baseline gap-4">
              <span className="text-4xl font-black text-genz-ink tracking-tighter">₹{activePrice}</span>
              {pricing.discountPercent > 0 && (
                <>
                  <span className="text-xl line-through text-genz-muted opacity-50 font-bold">
                    ₹{displayMRP}
                  </span>
                  <span className="text-xl font-black text-genz-accent">
                    {pricing.discountPercent}% OFF
                  </span>
                </>
              )}
            </div>
            {pricing.discountPercent > 0 && (
              <p className="text-xs text-genz-muted font-bold uppercase tracking-wide">
                You save ₹{Math.round(displayMRP - activePrice)}
              </p>
            )}
          </div>

          <div>
            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
              isOutOfStock ? "bg-red-50 text-red-600" : "bg-green-50 text-green-600"
            }`}>
              {isOutOfStock ? "Out of Stock" : `In Stock · ${activeStock} left`}
            </span>
          </div>

          <div className="py-4 border-y border-genz-border">
            <ProductVariantSelector
              product={product}
              selectedColor={selectedColor}
              selectedSizeId={selectedSize?.id ?? null}
              baseUrl={`${process.env.NEXT_PUBLIC_API_URL}/uploads/products/`}
              onColorChange={(color) => {
                setSelectedColor(color);
                setSelectedSize(null);
              }}
              onSizeChange={setSelectedSize}
            />
          </div>

          <div className="pt-2">
            <AddToCartButton
              productId={product.id}
              stock={activeStock}
              sizeId={selectedSize?.id}
              variantId={activeVariant?.id}
              hasVariants={hasColorVariants}
              hasSizes={productSizes.length > 0}
              disabled={(hasColorVariants || productSizes.length > 0) && !selectedSize}
            />
          </div>

          {/* BENTO STYLE PRODUCT DETAILS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
            <div className="p-4 bg-genz-bg rounded-genz border border-genz-border">
              <h3 className="text-[10px] font-black uppercase tracking-widest mb-3 text-genz-muted">Specs</h3>
              <div className="space-y-2 text-xs font-bold uppercase">
                <div className="flex justify-between"><span>Weight</span><span className="text-genz-muted">{product.weight}g</span></div>
                <div className="flex justify-between"><span>Category</span><span className="text-genz-muted">{product.category?.name}</span></div>
                {activeVariant?.color && <div className="flex justify-between"><span>Color</span><span className="text-genz-muted">{activeVariant.color}</span></div>}
              </div>
            </div>
            <div className="p-4 bg-genz-bg rounded-genz border border-genz-border">
              <h3 className="text-[10px] font-black uppercase tracking-widest mb-2 text-genz-muted">Description</h3>
              <p className="text-xs text-genz-muted font-medium leading-relaxed line-clamp-4">
                {product.description || "Minimalist style for the modern wardrobe."}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* REVIEWS & RECOMMENDATIONS */}
      <div className="mt-24 space-y-16">
        {reviews.length > 0 && (
          <div className="pt-16 border-t border-genz-border">
            <h2 className="text-2xl font-black uppercase tracking-tighter mb-8">Customer Feedback</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {reviews.map((r) => (
                <div key={r.id} className="bg-white p-6 rounded-genz border border-genz-border shadow-sm">
                  <div className="flex justify-between mb-4">
                    <p className="font-black text-xs uppercase tracking-widest">{r.user?.name || "Verified Buyer"}</p>
                    <span className="text-genz-accent font-black text-xs">{r.rating} ★</span>
                  </div>
                  {r.comment && <p className="text-sm text-genz-muted font-medium italic">"{r.comment}"</p>}
                </div>
              ))}
            </div>
          </div>
        )}
        <TrendingNow />
        <NewArrivals />
      </div>
    </div>
  );
}
