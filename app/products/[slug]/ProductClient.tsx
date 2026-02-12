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
  const baseUrl = `${process.env.NEXT_PUBLIC_API_URL}/uploads/products/`;

  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<any | null>(null);

  /* =========================================================
      1️⃣ SKUs
  ========================================================= */

  const skus = useMemo(
    () => (Array.isArray(product?.skus) ? product.skus : []),
    [product?.skus]
  );

  /* =========================================================
      2️⃣ DEFAULT COLOR (FIRST AVAILABLE SKU COLOR)
  ========================================================= */

  useEffect(() => {
    if (!selectedColor && skus.length > 0) {
      const firstColor = skus.find((s: any) => s.color)?.color;
      if (firstColor) setSelectedColor(firstColor);
    }
  }, [skus, selectedColor]);

  /* =========================================================
      3️⃣ REVIEWS
  ========================================================= */

  const [reviews, setReviews] = useState<any[]>([]);
  const [avg, setAvg] = useState<number | null>(null);

  useEffect(() => {
    api.get(`/reviews/product/${product.id}`)
      .then(res => {
        setReviews(res.data.reviews || []);
        setAvg(res.data.averageRating || null);
      })
      .catch(() => {
        setReviews([]);
        setAvg(null);
      });
  }, [product.id]);

  /* =========================================================
      4️⃣ COLOR GROUP
  ========================================================= */

  const skusForColor = useMemo(() => {
    if (!selectedColor) return [];
    return skus.filter((s: any) => s.color === selectedColor);
  }, [skus, selectedColor]);

  /* =========================================================
      5️⃣ ACTIVE SKU (COLOR + SIZE)
  ========================================================= */

  const activeSKU = useMemo(() => {
    if (!selectedColor) return null;
    if (!selectedSize) return null;

    return skus.find(
      (s: any) =>
        s.color === selectedColor &&
        s.id === selectedSize.id
    ) || null;
  }, [skus, selectedColor, selectedSize]);

  /* =========================================================
      6️⃣ IMAGES
  ========================================================= */

  const activeImages = useMemo(() => {
    // If exact SKU selected → use its images
    if (activeSKU) {
      const skuImgs = [activeSKU.img1, activeSKU.img2, activeSKU.img3]
        .filter(Boolean)
        .map((img: string) => baseUrl + img);

      if (skuImgs.length > 0) return skuImgs;
    }

    // Otherwise use product main images
    return [product.img1, product.img2, product.img3, product.img4]
      .filter(Boolean)
      .map((img: string) => baseUrl + img);
  }, [activeSKU, product, baseUrl]);

  /* =========================================================
      7️⃣ PRICE & DISCOUNT (✅ FIXED)
  ========================================================= */

  const displayPricing = useMemo(() => {
    // ✅ Exact SKU selected → use its pricing
    if (activeSKU?.pricing) {
      return activeSKU.pricing;
    }

    // ✅ Color group → find lowest price
    if (skusForColor.length > 0) {
      const lowestSKU = skusForColor.reduce((min: any, s: any) => {
        const sPrice = s.finalPrice ?? s.pricing?.sellingPrice ?? s.price;
        const minPrice = min.finalPrice ?? min.pricing?.sellingPrice ?? min.price;
        return sPrice < minPrice ? s : min;
      });

      return lowestSKU.pricing || {
        mrp: lowestSKU.price,
        sellingPrice: lowestSKU.finalPrice || lowestSKU.price,
        hasDiscount: false,
      };
    }

    // ✅ Fallback to product-level pricing
    return product.pricing || {
      mrp: product.price,
      sellingPrice: product.finalPrice || product.price,
      hasDiscount: false,
    };
  }, [activeSKU, skusForColor, product]);

  /* =========================================================
      8️⃣ STOCK
  ========================================================= */

  const displayStock = useMemo(() => {
    if (activeSKU) return activeSKU.stock;

    if (skusForColor.length > 0) {
      return skusForColor.reduce(
        (sum: number, s: any) => sum + s.stock,
        0
      );
    }

    return product.totalStock;
  }, [activeSKU, skusForColor, product.totalStock]);

  const isOutOfStock = displayStock <= 0;

  /* =========================================================
      9️⃣ SIZE REQUIREMENT (COLOR AWARE)
  ========================================================= */

  const requiresSize = useMemo(() => {
    if (!selectedColor) return false;
    return skusForColor.some((s: any) => s.size);
  }, [skusForColor, selectedColor]);

  /* =========================================================
      🔟 RENDER
  ========================================================= */

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 lg:py-12">
  <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">

    {/* LEFT: IMAGES */}
    <div className="lg:col-span-5 sticky top-24">
      <ProductImages images={activeImages} />
    </div>

    {/* RIGHT: DETAILS */}
    <div className="lg:col-span-7 flex flex-col space-y-8">
      
      {/* HEADER SECTION */}
      <div className="space-y-3">
        <p className="text-xs font-black uppercase tracking-[0.2em] text-genz-accent">
          {product.category?.name}
        </p>
        <h1 className="text-2xl md:text-3xl font-black text-genz-ink leading-tight uppercase tracking-tighter">
          {product.title}
        </h1>

        {/* HIDE RATINGS IF 0 */}
        {avg !== null && avg > 0 && (
          <div className="flex items-center gap-3">
            <div className="flex items-center bg-genz-ink text-white px-3 py-1 rounded-full text-xs font-black">
              {avg.toFixed(1)} <Star size={12} className="ml-1 fill-genz-accent text-genz-accent" />
            </div>
            <span className="text-xs font-bold text-genz-muted uppercase tracking-widest">
              {reviews.length} Ratings
            </span>
          </div>
        )}
      </div>

      {/* PRICE SECTION */}
      <div className="space-y-1">
        <div className="flex items-baseline gap-4">
          <span className="text-4xl font-black text-genz-ink tracking-tighter">
            ₹{displayPricing.sellingPrice.toLocaleString()}
          </span>
          {displayPricing.hasDiscount && (
            <>
              <span className="text-xl line-through text-genz-muted opacity-50 font-bold">
                ₹{displayPricing.mrp.toLocaleString()}
              </span>
              <span className="text-xl font-black text-genz-accent uppercase">
                {displayPricing.discountPercent}% OFF
              </span>
            </>
          )}
        </div>
        {displayPricing.hasDiscount && (
          <p className="text-xs text-genz-muted font-bold uppercase tracking-wide">
            You save ₹{displayPricing.discountAmount.toLocaleString()}
          </p>
        )}
      </div>

      {/* STOCK BADGE */}
      <div>
        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
          isOutOfStock ? "bg-red-50 text-red-600" : "bg-green-50 text-green-600"
        }`}>
          {isOutOfStock ? "Out of Stock" : `In Stock · ${displayStock} left`}
        </span>
      </div>

      {/* VARIANT SELECTOR */}
      <div className="py-4 border-y border-genz-border">
        <ProductVariantSelector
          product={product}
          selectedColor={selectedColor}
          selectedSize={selectedSize}
          baseUrl={baseUrl}
          onColorChange={(color: string | null) => {
            setSelectedColor(color);
            setSelectedSize(null);
          }}
          onSizeChange={setSelectedSize}
        />
      </div>

      {/* ACTION BUTTON */}
      <div className="pt-2">
        <AddToCartButton
          productId={product.id}
          stock={displayStock}
          sizeId={activeSKU?.id}
          selectedColor={selectedColor}
          disabled={isOutOfStock || (requiresSize && !selectedSize)}
        />
      </div>

      {/* NEW: PRODUCT DETAILS SECTION (Bento Layout) */}
      <div className="space-y-6 pt-6 border-t border-genz-border">
        <h2 className="text-sm font-black uppercase tracking-widest text-genz-ink">
          Product Specifications
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* DESCRIPTION CARD */}
          <div className="md:col-span-2 p-5 bg-genz-bg rounded-genz border border-genz-border">
            <h3 className="text-[10px] font-black uppercase tracking-widest mb-3 text-genz-muted">Description</h3>
            <p className="text-sm text-genz-ink font-medium leading-relaxed">
              {product.description || "Minimalist style for the modern wardrobe."}
            </p>
          </div>

          {/* ATTRIBUTES CARD */}
          <div className="p-5 bg-genz-bg rounded-genz border border-genz-border">
            <h3 className="text-[10px] font-black uppercase tracking-widest mb-4 text-genz-muted">Technical Specs</h3>
            <div className="space-y-3 text-xs font-bold uppercase">
              <div className="flex justify-between border-b border-genz-border pb-2">
                <span className="text-genz-muted">Category</span>
                <span>{product.category?.name}</span>
              </div>
              <div className="flex justify-between border-b border-genz-border pb-2">
                <span className="text-genz-muted">Weight</span>
                <span>{product.weight || "N/A"}g</span>
              </div>
              <div className="flex justify-between">
                <span className="text-genz-muted">Season</span>
                <span>{product.season || "ALL SEASON"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-genz-muted">Occasion</span>
                <span>{product.occasion || "FORMAL"}</span>
              </div>
            </div>
          </div>

          {/* TAGS/INFO CARD */}
          <div className="p-5 bg-genz-bg rounded-genz border border-genz-border">
            <h3 className="text-[10px] font-black uppercase tracking-widest mb-4 text-genz-muted">Extras</h3>
            <div className="space-y-3 text-xs font-bold uppercase">
              <div className="flex justify-between border-b border-genz-border pb-2">
                <span className="text-genz-muted">Shipping</span>
                <span>Calculated at checkout</span>
              </div>
              <div className="flex justify-between border-b border-genz-border pb-2">
                <span className="text-genz-muted">Returns</span>
                <span>7 Days Easy Policy</span>
              </div>
              <div className="flex justify-between">
                <span className="text-genz-muted">Authentic</span>
                <span>100% Genuine product</span>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  </div>

  {/* REVIEWS & RECOMMENDATIONS */}
  <div className="mt-24 space-y-24">
    <TrendingNow />
    <NewArrivals />
  </div>
</div>
  );
}
