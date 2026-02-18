"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useAuth } from "@/app/context/AuthContext";
import AuthModal from "../auth/AuthModal";
import AddToCartButton from "@/components/cart/AddToCartButton";

/** Bulletproof size check — same as ProductClient / ProductCard */
function hasRealSize(size: string | null | undefined): boolean {
  if (size == null) return false;
  const t = String(size).trim().toLowerCase();
  return t !== "" && t !== "null" && t !== "none" && t !== "no_size" && t !== "n/a";
}

export default function WishlistPage() {
  const { user } = useAuth();
  const router = useRouter();

  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAuth, setShowAuth] = useState(false);

  /* -------- LOAD -------- */
  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    api
      .get("/wishlist")
      .then((res) => setItems(res.data || []))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, [user]);

  /* -------- REMOVE -------- */
  const removeItem = async (item: any) => {
    await api.post("/wishlist/toggle", {
      productId: item.productId,
      sizeId: item.sizeId ?? undefined,
    });

    setItems((prev) =>
      prev.filter(
        (i) =>
          !(
            i.productId === item.productId &&
            (i.sizeId ?? null) === (item.sizeId ?? null)
          ),
      ),
    );
  };

  /* -------- AUTH GATE -------- */
  if (!user && !loading) {
    return (
      <div className="max-w-4xl mx-auto py-20 text-center">
        <h2 className="text-2xl font-bold mb-3">
          Please sign in to view your wishlist
        </h2>
        <button
          onClick={() => setShowAuth(true)}
          className="mt-4 bg-genz-accent text-white px-8 py-3 rounded-full font-black text-sm uppercase tracking-widest"
        >
          Sign In
        </button>
        <AuthModal show={showAuth} onClose={() => setShowAuth(false)} />
      </div>
    );
  }

  /* -------- EMPTY -------- */
  if (!loading && items.length === 0) {
    return (
      <div className="text-center py-24">
        <h2 className="text-2xl font-semibold mb-2">Your Wishlist is Empty</h2>
        <Link
          href="/"
          className="inline-block mt-4 bg-genz-accent text-white px-6 py-3 rounded-full font-black text-sm uppercase tracking-widest"
        >
          Continue Shopping
        </Link>
      </div>
    );
  }

  /* -------- UI -------- */
  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <h1 className="text-3xl font-bold mb-8">My Wishlist</h1>

      <div className="space-y-5">
        {items.map((item) => {
          const product = item.product;

          // The SKU saved in the wishlist (if any)
          // item.sizeId = the productSize id that was wishlisted
          // item.size   = the productSize object (joined by backend)
          const savedSku = item.size ?? null;

          // Does the saved SKU have a real size, OR does the product have
          // multiple SKUs? If so, user must pick on the PDP.
          const skuHasSize = hasRealSize(savedSku?.size);
          const productHasMultipleSkus = (product?.skus?.length ?? 0) > 1;

          // We can add directly only when we have a specific SKU id saved
          // AND that SKU needs no further selection (it's already specific).
          // For products where user wishlisted without a SKU, or the product
          // has multiple variants → send to PDP.
          const canAddDirectly = !!item.sizeId && !productHasMultipleSkus;

          // Product page URL
          const productUrl = product?.category?.slug && product?.slug
            ? `/${product.category.slug}/${product.slug}`
            : `/products/${item.productId}`;

          // Stock to show
          const stock = savedSku?.stock ?? product?.stock ?? product?.totalStock ?? 1;

          // Price to show
          const displayPrice = savedSku?.price ?? product?.finalPrice ?? product?.price ?? 0;

          return (
            <div
              key={item.id}
              className="flex gap-4 bg-white p-4 rounded-xl shadow border border-genz-border"
            >
              {/* Image */}
              <Link href={productUrl}>
                <img
                  src={`${process.env.NEXT_PUBLIC_API_URL}/uploads/products/${product?.img1}`}
                  className="w-24 h-28 rounded-lg object-cover bg-gray-100"
                  alt={product?.title}
                />
              </Link>

              <div className="flex-1 min-w-0">
                <Link href={productUrl}>
                  <h3 className="font-bold text-genz-ink leading-snug line-clamp-2 hover:text-genz-accent transition-colors">
                    {product?.title}
                  </h3>
                </Link>

                {/* Colour + size tags if saved with a specific SKU */}
                {savedSku && (
                  <div className="flex gap-2 mt-1 flex-wrap">
                    {savedSku.color && (
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-bold">
                        {savedSku.color}
                      </span>
                    )}
                    {skuHasSize && (
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-bold">
                        Size: {savedSku.size}
                      </span>
                    )}
                  </div>
                )}

                <p className="text-genz-accent font-black mt-2 text-lg">
                  ₹{Number(displayPrice).toLocaleString()}
                </p>

                <div className="flex gap-3 mt-4 items-center">
                  {canAddDirectly ? (
                    /* Has a specific SKU saved → add directly */
                    <AddToCartButton
                      productId={item.productId}
                      variantId={item.sizeId}
                      stock={stock}
                      requiresVariantSelection={false}
                      disabled={stock < 1}
                    />
                  ) : (
                    /* Multi-variant or no SKU saved → go to PDP to pick */
                    <button
                      onClick={() => router.push(productUrl)}
                      className="flex-1 py-3 rounded-full font-black text-xs uppercase tracking-widest bg-genz-ink text-white hover:bg-genz-accent transition-all"
                    >
                      Select Options
                    </button>
                  )}

                  <button
                    onClick={() => removeItem(item)}
                    className="text-red-500 text-xs font-bold uppercase tracking-widest hover:text-red-700 transition-colors shrink-0"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
