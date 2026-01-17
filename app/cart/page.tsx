"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/app/context/AuthContext";
import Link from "next/link";
import AuthModal from "../auth/AuthModal";
import { useRouter } from "next/navigation";
import CartItemCard from "@/components/cart/CartItemCard";
import { HiOutlineArrowLeft, HiOutlineShoppingBag, HiOutlineShieldCheck } from "react-icons/hi2";

export default function CartPage() {
  const { user } = useAuth();
  const router = useRouter();

  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAuth, setShowAuth] = useState(false);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  /* ---------------- LOAD CART ---------------- */
  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    api
      .get("/cart")
      .then((res) => setItems(res.data.items || []))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, [user]);

  /* ---------------- REMOVE ITEM ---------------- */
  const removeItem = async (id: number) => {
    setUpdatingId(id);
    await api.delete(`/cart/${id}`);
    setItems((prev) => prev.filter((i) => i.id !== id));
    setUpdatingId(null);
  };

  /* ---------------- UPDATE QUANTITY ---------------- */
  const updateQty = async (id: number, qty: number) => {
    if (qty < 1) return;

    setUpdatingId(id);
    await api.put(`/cart/${id}`, { quantity: qty });

    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, quantity: qty } : i))
    );

    setUpdatingId(null);
  };

  /* ---------------- AUTH REQUIRED ---------------- */
  if (!user && !loading) {
    return (
      <div className="max-w-md mx-auto py-32 px-6 text-center">
        <div className="w-20 h-20 bg-amazon-lightGray rounded-full flex items-center justify-center mx-auto mb-6">
          <HiOutlineShoppingBag size={40} className="text-amazon-mutedText" />
        </div>
        <h2 className="text-2xl font-black text-amazon-text mb-2">
          Your cart feels lonely
        </h2>
        <p className="text-amazon-mutedText mb-8">
          Sign in to see the items you added previously or start shopping fresh.
        </p>

        <button
          onClick={() => setShowAuth(true)}
          className="w-full bg-amazon-orange hover:bg-amazon-orangeHover text-amazon-darkBlue font-black py-4 rounded-xl shadow-md transition-all active:scale-95"
        >
          Sign In to Your Account
        </button>

        <AuthModal show={showAuth} onClose={() => setShowAuth(false)} />
      </div>
    );
  }

  /* ---------------- LOADER ---------------- */
  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-6 py-16 grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-6">
          <div className="h-8 w-48 bg-gray-100 animate-pulse rounded mb-8" />
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-40 bg-gray-50 animate-pulse rounded-2xl border border-gray-100"
            />
          ))}
        </div>
        <div className="h-80 bg-gray-50 animate-pulse rounded-2xl border border-gray-100" />
      </div>
    );
  }

  /* ---------------- EMPTY CART ---------------- */
  if (items.length === 0) {
    return (
      <div className="max-w-md mx-auto py-32 px-6 text-center">
        <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <HiOutlineShoppingBag size={40} className="text-amazon-success" />
        </div>
        <h2 className="text-2xl font-black text-amazon-text mb-2">
          Your cart is empty
        </h2>
        <p className="text-amazon-mutedText mb-8">
          Looks like you haven't added anything to your cart yet.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 bg-amazon-darkBlue text-white px-8 py-4 rounded-xl font-bold transition-all hover:shadow-lg active:scale-95"
        >
          <HiOutlineArrowLeft /> Continue Shopping
        </Link>
      </div>
    );
  }

  /* ---------------- TOTALS ---------------- */
  const subtotal = items.reduce(
    (sum, i) => sum + i.product.price * i.quantity,
    0
  );

  return (
    <div className="bg-amazon-lightGray min-h-screen">
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-10">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-black text-amazon-text">
            Shopping Cart <span className="text-amazon-mutedText font-normal text-lg">({items.length} items)</span>
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* LEFT ITEMS */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <div key={item.id} className={updatingId === item.id ? "opacity-50 pointer-events-none transition-opacity" : ""}>
                <CartItemCard
                  item={item}
                  onIncrease={() => updateQty(item.id, item.quantity + 1)}
                  onDecrease={() => updateQty(item.id, item.quantity - 1)}
                  onRemove={() => removeItem(item.id)}
                />
              </div>
            ))}
          </div>

          {/* RIGHT SUMMARY */}
          <div className="space-y-4 sticky top-24">
            <div className="bg-white p-8 rounded-2xl border border-amazon-borderGray shadow-sm">
              <h3 className="text-xs font-black text-amazon-mutedText uppercase tracking-widest mb-6">
                Order Summary
              </h3>

              <div className="space-y-4 text-sm font-medium">
                <div className="flex justify-between text-amazon-mutedText">
                  <span>Price ({items.length} items)</span>
                  <span>₹{subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-amazon-mutedText">
                  <span>Delivery Charges</span>
                  <span className="text-amazon-success">FREE</span>
                </div>
                
                <div className="pt-4 border-t border-gray-100">
                  <div className="flex justify-between items-end">
                    <span className="text-base font-black text-amazon-text">Total Amount</span>
                    <span className="text-2xl font-black text-amazon-text">₹{subtotal.toLocaleString()}</span>
                  </div>
                  <p className="text-[10px] text-amazon-success font-bold mt-1 uppercase tracking-tight">
                    You are saving ₹0 on this order
                  </p>
                </div>
              </div>

              <button
                onClick={() => router.push("/checkout/address")}
                className="w-full mt-8 bg-amazon-orange hover:bg-amazon-orangeHover text-amazon-darkBlue py-4 rounded-xl font-black shadow-md shadow-orange-200 transition-all active:scale-95"
              >
                Proceed to Checkout
              </button>
            </div>

            <div className="flex items-center gap-3 px-4 py-3 bg-white/50 border border-amazon-borderGray rounded-xl text-[11px] font-bold text-amazon-mutedText uppercase">
              <HiOutlineShieldCheck size={18} className="text-amazon-success" />
              Safe and Secure Payments. Easy returns.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}