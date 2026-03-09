"use client";

import { api } from "@/lib/api";
import { useAuth } from "@/app/context/AuthContext";
import { useState } from "react";
import AuthModal from "@/app/auth/AuthModal";
import Toast from "@/components/ui/toast";
import ButtonLoader from "@/components/ui/ButtonLoader";

export interface AddToCartButtonProps {
  productId: number;
  stock: number;
  variantId?: number; // renamed from sizeId (IMPORTANT)
  requiresVariantSelection: boolean;
  disabled?: boolean;
}

export default function AddToCartButton({
  productId,
  stock,
  variantId,
  requiresVariantSelection,
  disabled = false,
}: AddToCartButtonProps) {
  const { user } = useAuth();
  const [showAuth, setShowAuth] = useState(false);
  const [toast, setToast] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);

  const handleAddToCart = async () => {
  if (!productId) {
    setToast({ type: "error", message: "Invalid product" });
    return;
  }

  if (!user) {
    setShowAuth(true);
    return;
  }

  // 🚫 BLOCKED USER CHECK
  if (user?.isBlocked) {
    setToast({
      type: "error",
      message: user.blockedReason || "Your account has been blocked",
    });
    return;
  }

  if (stock < 1) {
    setToast({ type: "error", message: "This item is out of stock" });
    return;
  }

  if (requiresVariantSelection && !variantId) {
    setToast({ type: "error", message: "Please select an option" });
    return;
  }

  try {
    setLoading(true);

    await api.post("/cart/add", {
      productId,
      sizeId: variantId ?? null,
    });

    setToast({ type: "success", message: "Added to cart!" });
  } catch (err: any) {
    setToast({
      type: "error",
      message: err?.response?.data?.message || "Something went wrong",
    });
  } finally {
    setLoading(false);
  }
};;

  const isOutOfStock = stock < 1;
  const isDisabled = disabled || loading || isOutOfStock || user?.isBlocked;

  let buttonText = "Buy Now";
if (loading) buttonText = "Adding...";
else if (user?.isBlocked) buttonText = "Account Blocked";
else if (isOutOfStock) buttonText = "Sold Out";
else if (requiresVariantSelection && !variantId)
  buttonText = "Select Options";

  return (
    <>
      <button
        onClick={handleAddToCart}
        disabled={isDisabled}
        className={`w-full py-4 rounded-full font-black text-xs uppercase tracking-widest transition-all
          ${
            isOutOfStock
              ? "bg-gray-300 text-gray-500"
              : "bg-genz-ink text-white hover:bg-genz-accent"
          }`}
      >
        {loading ? <ButtonLoader /> : buttonText}
      </button>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <AuthModal show={showAuth} onClose={() => setShowAuth(false)} />
    </>
  );
}
