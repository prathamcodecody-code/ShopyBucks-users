"use client";

import { useEffect, useState } from "react";
import ProductImages from "@/components/ProductImages";
import AddToCartButton from "@/components/cart/AddToCartButton";
import TrendingNow from "@/components/TrendingSection";
import NewArrivals from "@/components/NewArrivals";
import { api } from "@/lib/api";
import { Star } from "lucide-react"; // Assuming you use lucide for icons

export default function ProductClient({ product }: any) {
  const sizes = Array.isArray(product.sizes)
    ? product.sizes
    : Array.isArray(product.productsize)
    ? product.productsize
    : [];

  const [reviews, setReviews] = useState<any[]>([]);
  const [avg, setAvg] = useState<number | null>(null);
  const [selectedSize, setSelectedSize] = useState<any>(null);

  const isOutOfStock = product.stock <= 0;
  const price = Number(product.price) || 0;
  const discountType = product.discountType;
  const discountValue = Number(product.discountValue || 0);

  let finalPrice = price;
  let discountLabel = null;
  let savings = 0;

  if (discountType === "PERCENT" && discountValue > 0) {
    savings = (price * discountValue) / 100;
    finalPrice = price - savings;
    discountLabel = `${discountValue}% OFF`;
  }

  if (discountType === "FLAT" && discountValue > 0) {
    savings = discountValue;
    finalPrice = price - discountValue;
    discountLabel = `₹${discountValue} OFF`;
  }

  finalPrice = Math.max(0, Math.round(finalPrice));
  savings = Math.round(savings);

  useEffect(() => {
    api
      .get(`/reviews/product/${product.id}`)
      .then((res) => {
        setReviews(res.data.reviews || []);
        setAvg(res.data.averageRating);
      })
      .catch(() => {
        setReviews([]);
        setAvg(null);
      });
  }, [product.id]);

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 md:py-16">
      {/* PRODUCT SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">
        <div className="sticky top-24">
          <ProductImages
            images={[
              product.img1,
              product.img2,
              product.img3,
              product.img4,
            ].filter(Boolean)}
          />
        </div>

        <div className="flex flex-col space-y-6">
          {/* Header */}
          <div className="space-y-2">
            <p className="text-sm font-bold uppercase tracking-widest text-brandPink">
              {product.category?.name}
            </p>
            <h1 className="text-3xl md:text-5xl font-extrabold text-gray-900 leading-tight">
              {product.title}
            </h1>
            {avg && (
              <div className="flex items-center gap-2">
                <div className="flex items-center bg-green-100 text-green-700 px-2 py-0.5 rounded text-sm font-bold">
                  {avg} <Star size={14} className="ml-1 fill-current" />
                </div>
                <span className="text-sm text-gray-400 font-medium">
                  {reviews.length} Ratings
                </span>
              </div>
            )}
          </div>

          <hr className="border-gray-100" />

          {/* Price Section */}
          <div className="space-y-2">
            <div className="flex items-baseline gap-4">
              <span className="text-4xl font-bold text-gray-900">
                ₹{finalPrice}
              </span>
              {discountLabel && (
                <>
                  <span className="text-xl text-gray-400 line-through">
                    ₹{price}
                  </span>
                  <span className="text-xl font-bold text-green-600">
                    {discountLabel}
                  </span>
                </>
              )}
            </div>
            <div className="flex flex-col text-sm">
              {discountLabel && (
                <span className="text-green-600 font-bold">
                  Special Price: You save ₹{savings}
                </span>
              )}
              <span className="text-gray-400">Inclusive of all taxes</span>
            </div>
          </div>

          {/* Stock Status */}
          <div className="flex items-center gap-2">
            {isOutOfStock ? (
              <div className="px-3 py-1 bg-red-50 text-red-600 rounded-full text-xs font-bold border border-red-100 uppercase">
                Out of Stock
              </div>
            ) : (
              <div className="px-3 py-1 bg-green-50 text-green-600 rounded-full text-xs font-bold border border-green-100 uppercase">
                In Stock &bull; {product.stock} units left
              </div>
            )}
          </div>

          {/* Size Selection */}
          {sizes.length > 0 && (
            <div className="space-y-4 pt-2">
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">
                Select Size
              </h3>
              <div className="flex gap-3 flex-wrap">
                {sizes.map((s: any) => (
                  <button
                    key={s.id}
                    disabled={s.stock <= 0}
                    onClick={() => setSelectedSize(s)}
                    className={`
                      min-w-[50px] h-[50px] flex items-center justify-center rounded-lg border-2 font-bold transition-all
                      ${
                        selectedSize?.id === s.id
                          ? "border-brandPink bg-brandPink/5 text-brandPink"
                          : "border-gray-200 text-gray-600 hover:border-gray-400"
                      }
                      ${s.stock <= 0 ? "bg-gray-50 opacity-40 cursor-not-allowed border-gray-100" : ""}
                    `}
                  >
                    {s.size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Action Button */}
          <div className="pt-4">
            <AddToCartButton
              productId={product.id}
              stock={product.stock}
              sizeId={selectedSize?.id}
              disabled={sizes.length > 0 && !selectedSize}
            />
          </div>

          {/* Details */}
          <div className="pt-8 border-t border-gray-100">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-3">
              Product Description
            </h3>
            <p className="text-gray-600 leading-relaxed text-base">
              {product.description || "No description available."}
            </p>
          </div>
        </div>
      </div>

      {/* REVIEWS - ONLY SHOW IF REVIEWS EXIST */}
      {reviews.length > 0 && (
        <div className="mt-20 pt-16 border-t border-gray-100">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-gray-900">
              Customer Reviews
            </h2>
            <div className="flex items-center gap-2 font-bold text-lg">
              {avg} <Star className="fill-yellow-400 text-yellow-400" size={20} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {reviews.map((r) => (
              <div
                key={r.id}
                className="bg-gray-50 p-6 rounded-2xl border border-gray-100 space-y-3"
              >
                <div className="flex justify-between items-start">
                  <p className="font-bold text-gray-900">
                    {r.user?.name || "Verified Buyer"}
                  </p>
                  <div className="flex bg-white px-2 py-1 rounded border border-gray-200 text-xs font-black text-green-700">
                    {r.rating} ★
                  </div>
                </div>
                {r.comment && (
                  <p className="text-gray-600 italic leading-relaxed">
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