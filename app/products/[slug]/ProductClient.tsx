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

  // Auto-select baseColor on mount if it exists
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
    api
      .get(`/reviews/product/${product.id}`)
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
     DERIVED VALUES - CRITICAL LOGIC
  ----------------------------------------- */
  
  // Determine if product has color variants
  const hasColorVariants = product.hasVariants && 
    Array.isArray(product.variants) && 
    product.variants.length > 0;

  // Get the active variant based on selected color/size
  const activeVariant = useMemo(() => {
    if (!hasColorVariants) return null;
    if (!selectedColor) return null;
    
    // If baseColor is selected, no variant is active (use main product)
    if (selectedColor === product.baseColor) return null;

    // If size is selected, return that specific variant
    if (selectedSize) return selectedSize;

    // Otherwise return first variant matching the color
    return product.variants.find((v: any) => v.color === selectedColor) || null;
  }, [hasColorVariants, selectedColor, selectedSize, product.variants, product.baseColor]);

  // Get active images
  const activeImages = useMemo(() => {
    if (activeVariant?.img1 || activeVariant?.img2 || activeVariant?.img3) {
      return [
        activeVariant.img1,
        activeVariant.img2,
        activeVariant.img3,
      ].filter(Boolean);
    }

    return [
      product.img1,
      product.img2,
      product.img3,
      product.img4,
    ].filter(Boolean);
  }, [activeVariant, product]);

  // Get active price - FIXED LOGIC
  const activePrice = useMemo(() => {
    // Priority 1: Selected size from non-variant product
    if (!hasColorVariants && selectedSize?.price) {
      return Number(selectedSize.price);
    }

    // Priority 2: Selected variant
    if (activeVariant?.price) {
      return Number(activeVariant.price);
    }

    // Priority 3: Selected size price (even if null)
    if (selectedSize?.price !== undefined && selectedSize?.price !== null) {
      return Number(selectedSize.price);
    }

    // Priority 4: Product final price or base price
    return Number(product.finalPrice ?? product.price);
  }, [selectedSize, activeVariant, hasColorVariants, product]);

  // Get active stock - FIXED LOGIC
  const activeStock = useMemo(() => {
    // Priority 1: Selected size stock
    if (selectedSize?.stock !== undefined) {
      return Number(selectedSize.stock);
    }

    // Priority 2: Active variant stock
    if (activeVariant?.stock !== undefined) {
      return Number(activeVariant.stock);
    }

    // Priority 3: Product base stock
    return Number(product.stock ?? 0);
  }, [selectedSize, activeVariant, product.stock]);

  const isOutOfStock = activeStock <= 0;

  /* -----------------------------------------
     PRICING DISPLAY
  ----------------------------------------- */
  const pricing = product.pricing || {
    mrp: Number(product.price) || 0,
    sellingPrice: Number(product.price) || 0,
    discountPercent: 0,
    discountAmount: 0,
  };

  // Calculate MRP based on active price
  const displayMRP = useMemo(() => {
    if (!hasColorVariants && selectedSize?.price) {
      // For non-variant products with size-specific prices
      const sizePrice = Number(selectedSize.price);
      if (pricing.discountPercent > 0) {
        return Math.round(sizePrice / (1 - pricing.discountPercent / 100));
      }
      return sizePrice;
    }
    return pricing.mrp;
  }, [hasColorVariants, selectedSize, pricing]);

  const { discountPercent } = pricing;

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 md:py-16">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
        {/* IMAGES */}
        <div className="sticky top-24">
          <ProductImages images={activeImages} />
        </div>

        {/* DETAILS */}
        <div className="flex flex-col space-y-6">
          {/* HEADER */}
          <div className="space-y-2">
            <p className="text-sm font-bold uppercase tracking-widest text-brandPink">
              {product.category?.name}
            </p>

            <h1 className="text-3xl md:text-5xl font-extrabold">
              {product.title}
            </h1>

            {avg && (
              <div className="flex items-center gap-2">
                <div className="flex items-center bg-green-100 text-green-700 px-2 py-0.5 rounded text-sm font-bold">
                  {avg} <Star size={14} className="ml-1 fill-current" />
                </div>
                <span className="text-sm text-gray-400">
                  {reviews.length} Ratings
                </span>
              </div>
            )}
          </div>

          {/* PRICE - ALWAYS VISIBLE */}
          <div className="space-y-2">
            <div className="flex items-baseline gap-4">
              <span className="text-4xl font-bold">₹{activePrice}</span>

              {discountPercent > 0 && (
                <>
                  <span className="text-xl line-through text-gray-400">
                    ₹{displayMRP}
                  </span>
                  <span className="text-xl font-bold text-green-600">
                    {discountPercent}% OFF
                  </span>
                </>
              )}
            </div>

            {discountPercent > 0 && (
              <span className="text-sm text-green-600 font-bold">
                You save ₹{Math.round(displayMRP - activePrice)}
              </span>
            )}
          </div>

          {/* STOCK */}
          <div>
            {isOutOfStock ? (
              <span className="px-3 py-1 bg-red-50 text-red-600 rounded-full text-xs font-bold">
                Out of Stock
              </span>
            ) : (
              <span className="px-3 py-1 bg-green-50 text-green-600 rounded-full text-xs font-bold">
                In Stock · {activeStock} left
              </span>
            )}
          </div>

          {/* VARIANT/SIZE SELECTOR - ALWAYS SHOW IF SIZES/VARIANTS EXIST */}
          <ProductVariantSelector
            product={product}
            selectedColor={selectedColor}
            selectedSizeId={selectedSize?.id ?? null}
            baseUrl={`${process.env.NEXT_PUBLIC_API_URL}/uploads/products/`}
            onColorChange={(color) => {
              setSelectedColor(color);
              setSelectedSize(null); // reset size on color change
            }}
            onSizeChange={(size) => {
              setSelectedSize(size);
            }}
          />

          {/* ADD TO CART */}
          <div className="pt-4">
            <AddToCartButton
              productId={product.id}
              stock={activeStock}
              sizeId={selectedSize?.id}
              disabled={
                // Require size selection if ANY sizes exist
                (hasColorVariants || (product.productsize?.length > 0))
                  ? !selectedSize
                  : activeStock <= 0
              }
            />
          </div>

          {/* PRODUCT DETAILS */}
          <div className="pt-8 border-t">
            <h3 className="text-sm font-bold uppercase mb-3">
              Product Details
            </h3>

            <div className="grid grid-cols-2 gap-y-3 text-sm">
              <div className="text-gray-500">Category</div>
              <div>{product.category?.name}</div>

              <div className="text-gray-500">Weight</div>
              <div>{product.weight} g</div>

              {activeVariant?.color && (
                <>
                  <div className="text-gray-500">Color</div>
                  <div>{activeVariant.color}</div>
                </>
              )}

              {selectedSize?.size && (
                <>
                  <div className="text-gray-500">Size</div>
                  <div>{selectedSize.size}</div>
                </>
              )}

              {product.seasonTags?.length > 0 && (
                <>
                  <div className="text-gray-500">Season</div>
                  <div>{product.seasonTags.join(", ")}</div>
                </>
              )}

              {product.occasionTags?.length > 0 && (
                <>
                  <div className="text-gray-500">Occasion</div>
                  <div>{product.occasionTags.join(", ")}</div>
                </>
              )}
            </div>
          </div>

          {/* DESCRIPTION */}
          <div className="pt-6 border-t">
            <h3 className="text-sm font-bold uppercase mb-2">
              Description
            </h3>
            <p className="text-gray-600 leading-relaxed">
              {product.description || "No description available."}
            </p>
          </div>
        </div>
      </div>

      {/* REVIEWS */}
      {reviews.length > 0 && (
        <div className="mt-20 pt-16 border-t">
          <h2 className="text-2xl font-bold mb-8">
            Customer Reviews
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            {reviews.map((r) => (
              <div key={r.id} className="bg-gray-50 p-6 rounded-xl border">
                <div className="flex justify-between">
                  <p className="font-bold">
                    {r.user?.name || "Verified Buyer"}
                  </p>
                  <span className="text-green-700 font-bold">
                    {r.rating} ★
                  </span>
                </div>

                {r.comment && (
                  <p className="mt-2 text-gray-600 italic">
                    "{r.comment}"
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* RECOMMENDATIONS */}
      <div className="mt-24 space-y-16">
        <TrendingNow />
        <NewArrivals />
      </div>
    </div>
  );
}
