"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useAuth } from "@/app/context/AuthContext";
import AuthModal from "../auth/AuthModal";
import AddToCartButton from "@/components/cart/AddToCartButton";

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
          )
      )
    );
  };

  /* -------- AUTH -------- */
  if (!user && !loading) {
    return (
      <div className="max-w-4xl mx-auto py-20 text-center">
        <h2 className="text-2xl font-bold mb-3">
          Please sign in to view your wishlist
        </h2>

        <button
          onClick={() => setShowAuth(true)}
          className="mt-4 bg-brandPink text-white px-8 py-3 rounded-lg"
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
        <h2 className="text-2xl font-semibold mb-2">
          Your Wishlist is Empty
        </h2>
        <Link
          href="/"
          className="inline-block mt-4 bg-brandPink text-white px-6 py-3 rounded-lg"
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
        {items.map((item) => (
          <div
            key={item.id}
            className="flex gap-4 bg-white p-4 rounded-xl shadow"
          >
            <img
              src={`${process.env.NEXT_PUBLIC_API_URL}/uploads/products/${item.product.img1}`}
              className="w-24 h-28 rounded object-cover"
            />

            <div className="flex-1">
              <h3 className="font-semibold">{item.product.title}</h3>

              {item.size && (
                <p className="text-sm text-gray-500">
                  Size: <span className="font-medium">{item.size.size}</span>
                </p>
              )}

              <p className="text-brandPink font-bold mt-1">
                ₹{item.size?.price ?? item.product.price}
              </p>

              <div className="flex gap-3 mt-4">
                {/* ✅ REUSE YOUR AddToCartButton */}
                <AddToCartButton
                  productId={item.productId}
                  sizeId={item.sizeId ?? undefined}
                  stock={item.size?.stock ?? item.product.stock}
                />

                <button
                  onClick={() => removeItem(item)}
                  className="text-red-500 text-sm"
                >
                  Remove
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
