"use client";

import { useEffect, useMemo, useState } from "react";
import ProductImages from "@/components/ProductImages";
import AddToCartButton from "@/components/cart/AddToCartButton";
import ProductVariantSelector from "@/components/ui/ProductVariantSelector";
import TrendingNow from "@/components/TrendingSection";
import NewArrivals from "@/components/NewArrivals";
import { api } from "@/lib/api";
import { Star } from "lucide-react";

const IMG_BASE = process.env.NEXT_PUBLIC_API_URL
  ? `${process.env.NEXT_PUBLIC_API_URL}/uploads/products/`
  : "http://localhost:3030/uploads/products/";

// ─────────────────────────────────────────────
// TYPE — what the service returns
// ─────────────────────────────────────────────
interface Pricing {
  sellingPrice: number;
  discountedPrice: number | null;
  discountLabel: string | null;
}

interface Sku {
  id: number;
  color: string;
  size: string | null;
  stock: number;
  price: number;
  img1: string | null;
  img2: string | null;
  img3: string | null;
  pricing: Pricing;
  finalPrice: number;  // equals pricing.discountedPrice ?? pricing.sellingPrice
}

export default function ProductClient({ product }: any) {

  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedSize,  setSelectedSize]  = useState<Sku | null>(null);

  // ── SKUs ───────────────────────────────────
  const skus: Sku[] = useMemo(
    () => (Array.isArray(product?.skus) ? product.skus : []),
    [product?.skus],
  );

  // ── Default to first colour ────────────────
  useEffect(() => {
    if (!selectedColor && skus.length > 0) {
      const firstColor = skus.find((s) => s.color)?.color;
      if (firstColor) setSelectedColor(firstColor);
    }
  }, [skus, selectedColor]);

  // ── Reviews ─────────────────────────────────
  const [reviews, setReviews] = useState<any[]>([]);
  const [avg,     setAvg]     = useState<number | null>(null);

  useEffect(() => {
    api
      .get(`/reviews/product/${product.id}`)
      .then((res) => {
        setReviews(res.data.reviews || []);
        setAvg(res.data.averageRating || null);
      })
      .catch(() => {
        setReviews([]);
        setAvg(null);
      });
  }, [product.id]);

  // ── SKUs matching selected colour ──────────
  const skusForColor = useMemo(() => {
    if (!selectedColor) return [];
    return skus.filter((s) => s.color === selectedColor);
  }, [skus, selectedColor]);

  // ── Active SKU (colour + size selected) ────
  const activeSKU = useMemo(() => {
    if (!selectedColor || !selectedSize) return null;
    // selectedSize is the full Sku object, so compare by id
    return skus.find((s) => s.color === selectedColor && s.id === selectedSize.id) || null;
  }, [skus, selectedColor, selectedSize]);

  // ── Images ──────────────────────────────────
  const activeImages = useMemo(() => {
    // Priority 1: Exact SKU selected → use its images
    if (activeSKU) {
      const skuImgs = [activeSKU.img1, activeSKU.img2, activeSKU.img3]
        .filter(Boolean)
        .map((img) => IMG_BASE + img);
      if (skuImgs.length) return skuImgs;
    }

    // Priority 2: Colour selected but exact SKU has no images
    // → find ANY SKU in the same colour group that has images
    if (selectedColor && skusForColor.length > 0) {
      for (const sku of skusForColor) {
        const skuImgs = [sku.img1, sku.img2, sku.img3]
          .filter(Boolean)
          .map((img) => IMG_BASE + img);
        if (skuImgs.length) return skuImgs;
      }
    }

    // Priority 3: No colour selected or no SKU images available
    // → fall back to product-level images
    return [product.img1, product.img2, product.img3, product.img4]
      .filter(Boolean)
      .map((img) => IMG_BASE + img);
  }, [activeSKU, selectedColor, skusForColor, product]);

  // ── Pricing (correct shape) ─────────────────
  const displayPricing: Pricing = useMemo(() => {
    // Exact SKU → use its pricing
    if (activeSKU?.pricing) return activeSKU.pricing;

    // Colour group → lowest finalPrice SKU
    if (skusForColor.length > 0) {
      const lowestSKU = skusForColor.reduce((min, s) =>
        s.finalPrice < min.finalPrice ? s : min,
      );
      return lowestSKU.pricing;
    }

    // Fallback → product-level pricing
    return product.pricing || {
      sellingPrice: product.price,
      discountedPrice: null,
      discountLabel: null,
    };
  }, [activeSKU, skusForColor, product]);

  // ── Stock ───────────────────────────────────
  const displayStock = useMemo(() => {
    if (activeSKU) return activeSKU.stock;
    if (skusForColor.length) return skusForColor.reduce((s, sku) => s + sku.stock, 0);
    return product.totalStock ?? 0;
  }, [activeSKU, skusForColor, product.totalStock]);

  const isOutOfStock = displayStock <= 0;

  // ── Size requirement (colour-aware) ─────────
  const requiresSize = useMemo(() => {
    if (!selectedColor) return false;
    return skusForColor.some((s) => s.size);
  }, [skusForColor, selectedColor]);

  // ── Derived price fields ────────────────────
  const finalPrice     = displayPricing.discountedPrice ?? displayPricing.sellingPrice;
  const originalPrice  = displayPricing.sellingPrice;
  const hasDiscount    = displayPricing.discountedPrice != null;
  const savingsAmount  = hasDiscount ? originalPrice - finalPrice : 0;

  // ─────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────
  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 lg:py-12">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">

        {/* ── LEFT — IMAGES ─────────────────────── */}
        <div className="lg:col-span-5 sticky top-24">
          <ProductImages images={activeImages} />
        </div>

        {/* ── RIGHT — DETAILS ───────────────────── */}
        <div className="lg:col-span-7 flex flex-col space-y-8">

          {/* Header */}
          <div className="space-y-3">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-genz-accent">
              {product.category?.name}
            </p>
            <h1 className="text-2xl md:text-3xl font-black text-genz-ink leading-tight uppercase tracking-tighter">
              {product.title}
            </h1>

            {/* Ratings — hide if 0 */}
            {avg !== null && avg > 0 && (
              <div className="flex items-center gap-3">
                <div className="flex items-center bg-genz-ink text-white px-3 py-1 rounded-full text-xs font-black">
                  {avg.toFixed(1)}{" "}
                  <Star size={12} className="ml-1 fill-genz-accent text-genz-accent" />
                </div>
                <span className="text-xs font-bold text-genz-muted uppercase tracking-widest">
                  {reviews.length} Rating{reviews.length !== 1 ? "s" : ""}
                </span>
              </div>
            )}
          </div>

          {/* Price */}
          <div className="space-y-1">
            <div className="flex items-baseline gap-4 flex-wrap">
              <span className="text-4xl font-black text-genz-ink tracking-tighter">
                ₹{finalPrice.toLocaleString()}
              </span>
              {hasDiscount && (
                <>
                  <span className="text-xl line-through text-genz-muted opacity-50 font-bold">
                    ₹{originalPrice.toLocaleString()}
                  </span>
                  {displayPricing.discountLabel && (
                    <span className="text-xl font-black text-genz-accent uppercase">
                      {displayPricing.discountLabel}
                    </span>
                  )}
                </>
              )}
            </div>
            {hasDiscount && (
              <p className="text-xs text-genz-muted font-bold uppercase tracking-wide">
                You save ₹{savingsAmount.toLocaleString()}
              </p>
            )}
          </div>

          {/* Stock badge */}
          <div>
            <span
              className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                isOutOfStock
                  ? "bg-red-50 text-red-600"
                  : "bg-green-50 text-green-600"
              }`}
            >
              {isOutOfStock
                ? "Out of Stock"
                : `In Stock · ${displayStock} left`}
            </span>
          </div>

          {/* Variant selector */}
          <div className="py-4 border-y border-genz-border">
            <ProductVariantSelector
              product={product}
              selectedColor={selectedColor}
              selectedSize={selectedSize}
              baseUrl={IMG_BASE}
              onColorChange={(color) => {
                setSelectedColor(color);
                setSelectedSize(null);
              }}
              onSizeChange={setSelectedSize}
            />
          </div>

          {/* Add to cart button */}
          <AddToCartButton
            productId={product.id}
            stock={displayStock}
            sizeId={activeSKU?.id}
            selectedColor={selectedColor}
            disabled={isOutOfStock || (requiresSize && !selectedSize)}
          />

          {/* Product details grid */}
          <div className="space-y-6 pt-6 border-t border-genz-border">
            <h2 className="text-sm font-black uppercase tracking-widest text-genz-ink">
              Product Specifications
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              {/* Description card */}
              <div className="md:col-span-2 p-5 bg-genz-bg rounded-genz border border-genz-border">
                <h3 className="text-[10px] font-black uppercase tracking-widest mb-3 text-genz-muted">
                  Description
                </h3>
                <p className="text-sm text-genz-ink font-medium leading-relaxed">
                  {product.description || "Minimalist style for the modern wardrobe."}
                </p>
              </div>

              {/* Attributes card */}
              <div className="p-5 bg-genz-bg rounded-genz border border-genz-border">
                <h3 className="text-[10px] font-black uppercase tracking-widest mb-4 text-genz-muted">
                  Technical Specs
                </h3>
                <div className="space-y-3 text-xs font-bold uppercase">
                  <div className="flex justify-between border-b border-genz-border pb-2">
                    <span className="text-genz-muted">Category</span>
                    <span>{product.category?.name ?? "—"}</span>
                  </div>
                  <div className="flex justify-between border-b border-genz-border pb-2">
                    <span className="text-genz-muted">Weight</span>
                    <span>{product.weight ? `${product.weight}g` : "N/A"}</span>
                  </div>
                  <div className="flex justify-between border-b border-genz-border pb-2">
                    <span className="text-genz-muted">Season</span>
                    <span>{product.seasonTags?.[0] || "All Season"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-genz-muted">Occasion</span>
                    <span>{product.occasionTags?.[0] || "Casual"}</span>
                  </div>
                </div>
              </div>

              {/* Extras card */}
              <div className="p-5 bg-genz-bg rounded-genz border border-genz-border">
                <h3 className="text-[10px] font-black uppercase tracking-widest mb-4 text-genz-muted">
                  Extras
                </h3>
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

      {/* ── RECOMMENDATIONS ───────────────────── */}
      <div className="mt-24 space-y-24">
        <TrendingNow />
        <NewArrivals />
      </div>
    </div>
  );
}
