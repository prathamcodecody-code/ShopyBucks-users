"use client";

import { useEffect, useMemo, useState } from "react";
import ProductImages from "@/components/ProductImages";
import AddToCartButton from "@/components/cart/AddToCartButton";
import ProductVariantSelector from "@/components/ui/ProductVariantSelector";
import TrendingNow from "@/components/TrendingSection";
import NewArrivals from "@/components/NewArrivals";
import { api } from "@/lib/api";
import { Star } from "lucide-react";
import DeliveryCheck from "@/components/ui/DeliveryCheck";

const IMG_BASE = process.env.NEXT_PUBLIC_API_URL
  ? `${process.env.NEXT_PUBLIC_API_URL}/uploads/products/`
  : "http://localhost:3030/uploads/products/";

interface Pricing {
  sellingPrice: number;        // final/discounted price
  discountedPrice: number | null;
  discountLabel: string | null;
}

interface Sku {
  id: number;
  color: string;
  size: string | null;
  stock: number;
  price: number;               // ← MRP (before discount)
  img1: string | null;
  img2: string | null;
  img3: string | null;
  pricing: Pricing;
  finalPrice: number;          // = pricing.discountedPrice ?? pricing.sellingPrice
}

// Derived display shape — always has both final + original price
interface DisplayPricing {
  finalPrice: number;
  originalPrice: number;       // MRP
  hasDiscount: boolean;
  discountLabel: string | null;
  savingsAmount: number;
}

/** Bulletproof size check — handles null / "" / "null" / "none" etc. */
function hasRealSize(size: string | null | undefined): boolean {
  if (size == null) return false;
  const t = String(size).trim().toLowerCase();
  return t !== "" && t !== "null" && t !== "none" && t !== "no_size" && t !== "n/a";
}

/**
 * Given a SKU (which has both .price = MRP and .pricing = computed pricing),
 * return a clean DisplayPricing object.
 */
function skuToDisplayPricing(sku: Sku): DisplayPricing {
  const finalPrice = sku.pricing?.discountedPrice ?? sku.pricing?.sellingPrice ?? sku.price;
  const originalPrice = sku.price;           // raw MRP from seller
  const hasDiscount = originalPrice > finalPrice;

  return {
    finalPrice,
    originalPrice,
    hasDiscount,
    discountLabel: sku.pricing?.discountLabel ?? null,
    savingsAmount: hasDiscount ? originalPrice - finalPrice : 0,
  };
}

/** Fallback when we only have the product-level pricing (no SKU selected yet) */
function productToDisplayPricing(product: any): DisplayPricing {
  // product.pricing.sellingPrice = discounted final price
  // product.price                = raw MRP
  const finalPrice = product.pricing?.sellingPrice ?? product.price;
  const originalPrice = product.price;
  const hasDiscount = originalPrice > finalPrice;

  return {
    finalPrice,
    originalPrice,
    hasDiscount,
    discountLabel: product.pricing?.discountLabel ?? null,
    savingsAmount: hasDiscount ? originalPrice - finalPrice : 0,
  };
}

// ─────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────
export default function ProductClient({ product }: any) {
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<Sku | null>(null);

  const skus: Sku[] = useMemo(
    () => (Array.isArray(product?.skus) ? product.skus : []),
    [product?.skus],
  );

  // Auto-select first colour on mount
  useEffect(() => {
    if (!selectedColor && skus.length > 0) {
      const firstColor = skus.find((s) => s.color)?.color;
      if (firstColor) setSelectedColor(firstColor);
    }
  }, [skus, selectedColor]);

  // Reviews
  const [reviews, setReviews] = useState<any[]>([]);
  const [avg, setAvg] = useState<number | null>(null);

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

  // SKUs for selected colour
  const skusForColor = useMemo(() => {
    if (!selectedColor) return [];
    return skus.filter((s) => s.color === selectedColor);
  }, [skus, selectedColor]);

  // Does the selected colour have real sizes?
  const colorHasSizes = useMemo(
    () => skusForColor.some((s) => hasRealSize(s.size)),
    [skusForColor],
  );

  // Active SKU
  const activeSKU = useMemo(() => {
    if (!selectedColor) return null;
    if (!colorHasSizes) return skusForColor[0] ?? null;
    if (!selectedSize) return null;
    return skus.find((s) => s.color === selectedColor && s.id === selectedSize.id) ?? null;
  }, [skus, selectedColor, selectedSize, skusForColor, colorHasSizes]);

  // Images
  const activeImages = useMemo(() => {
    if (activeSKU) {
      const skuImgs = [activeSKU.img1, activeSKU.img2, activeSKU.img3]
        .filter(Boolean)
        .map((img) => IMG_BASE + img);
      if (skuImgs.length) return skuImgs;
    }
    if (selectedColor && skusForColor.length > 0) {
      for (const sku of skusForColor) {
        const skuImgs = [sku.img1, sku.img2, sku.img3]
          .filter(Boolean)
          .map((img) => IMG_BASE + img);
        if (skuImgs.length) return skuImgs;
      }
    }
    return [product.img1, product.img2, product.img3, product.img4]
      .filter(Boolean)
      .map((img) => IMG_BASE + img);
  }, [activeSKU, selectedColor, skusForColor, product]);

  // ─── PRICING ────────────────────────────────────────────────────────────────
  // Use the active SKU's .price (MRP) + .pricing (computed) for accurate display.
  // Fall back through: activeSKU → cheapest SKU in colour → product level.
  const displayPricing: DisplayPricing = useMemo(() => {
    // 1. Exact SKU selected
    if (activeSKU) return skuToDisplayPricing(activeSKU);

    // 2. Colour selected but no size yet → show cheapest SKU in this colour group
    if (skusForColor.length > 0) {
      const cheapest = skusForColor.reduce((min, s) =>
        s.finalPrice < min.finalPrice ? s : min,
      );
      return skuToDisplayPricing(cheapest);
    }

    // 3. Nothing selected → product-level pricing
    return productToDisplayPricing(product);
  }, [activeSKU, skusForColor, product]);

  // Stock
  const displayStock = useMemo(() => {
    if (activeSKU) return activeSKU.stock;
    if (skusForColor.length) return skusForColor.reduce((s, sku) => s + sku.stock, 0);
    return product.totalStock ?? 0;
  }, [activeSKU, skusForColor, product.totalStock]);

  const isOutOfStock = displayStock <= 0;

  // Cart readiness
  const requiresVariantSelection = useMemo(() => {
    if (!selectedColor) return true;
    if (colorHasSizes && !selectedSize) return true;
    return false;
  }, [selectedColor, colorHasSizes, selectedSize]);

  // Dev debug
  if (process.env.NODE_ENV === "development") {
    console.log("[PDP Pricing debug]", {
      activeSKUid: activeSKU?.id,
      skuPrice_MRP: activeSKU?.price,
      skuPricing: activeSKU?.pricing,
      displayPricing,
    });
  }

  const { finalPrice, originalPrice, hasDiscount, discountLabel, savingsAmount } = displayPricing;

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 lg:py-12">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">

        {/* LEFT — IMAGES */}
        <div className="lg:col-span-5 sticky top-24">
          <ProductImages images={activeImages} />
        </div>

        {/* RIGHT — DETAILS */}
        <div className="lg:col-span-7 flex flex-col space-y-8">

          {/* Header */}
          <div className="space-y-3">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-genz-accent">
              {product.category?.name}
            </p>
            <h1 className="text-2xl md:text-3xl font-black text-genz-ink leading-tight uppercase tracking-tighter">
              {product.title}
            </h1>

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
              {/* Final price (after discount) */}
              <span className="text-4xl font-black text-genz-ink tracking-tighter">
                ₹{finalPrice.toLocaleString()}
              </span>

              {hasDiscount && (
                <>
                  {/* MRP strikethrough */}
                  <span className="text-xl line-through text-genz-muted opacity-50 font-bold">
                    ₹{originalPrice.toLocaleString()}
                  </span>

                  {/* Discount label e.g. "61% off" */}
                  {discountLabel && (
                    <span className="text-xl font-black text-genz-accent uppercase">
                      {discountLabel}
                    </span>
                  )}
                </>
              )}
            </div>

            {/* Savings amount */}
            {hasDiscount && savingsAmount > 0 && (
              <p className="text-xs text-genz-muted font-bold uppercase tracking-wide">
                You save ₹{savingsAmount.toLocaleString()}
              </p>
            )}
          </div>

          {/* Stock badge */}
          <div>
            <span
              className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                isOutOfStock ? "bg-red-50 text-red-600" : "bg-green-50 text-green-600"
              }`}
            >
              {isOutOfStock ? "Out of Stock" : `In Stock · ${displayStock} left`}
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

          {/* Add to cart */}
          <AddToCartButton
            productId={product.id}
            stock={displayStock}
            variantId={activeSKU?.id}
            requiresVariantSelection={requiresVariantSelection}
            disabled={isOutOfStock}
          />

          <DeliveryCheck
          productId={product.id}
          orderAmount={product.finalPrice}
            />
          
          {/* Product details */}
          <div className="space-y-6 pt-6 border-t border-genz-border">
            <h2 className="text-sm font-black uppercase tracking-widest text-genz-ink">
              Product Specifications
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2 p-5 bg-genz-bg rounded-genz border border-genz-border">
                <h3 className="text-[10px] font-black uppercase tracking-widest mb-3 text-genz-muted">
                  Description
                </h3>
                <p className="text-sm text-genz-ink font-medium leading-relaxed">
                  {product.description || "Minimalist style for the modern wardrobe."}
                </p>
              </div>
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

      <div className="mt-24 space-y-24">
        <TrendingNow />
        <NewArrivals />
      </div>
    </div>
  );
}

