"use client";

import { api } from "@/lib/api";
import { useAuth } from "@/app/context/AuthContext";
import { useState } from "react";
import AuthModal from "@/app/auth/AuthModal";
import Toast from "@/components/ui/toast";
import ButtonLoader from "@/components/ui/ButtonLoader";

interface AddToCartButtonProps {
  productId: number;
  stock: number;
  sizeId?: number;
  variantId?: number;
  disabled?: boolean;
  hasVariants?: boolean;
  hasSizes?: boolean;
}

export default function AddToCartButton({
  productId,
  stock,
  sizeId,
  variantId,
  disabled = false,
  hasVariants = false,
  hasSizes = false,
}: AddToCartButtonProps) {
  const { user } = useAuth();
  const [showAuth, setShowAuth] = useState(false);
  const [toast, setToast] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);

  const handleAddToCart = async () => {
    // Check if user is logged in
    if (!user) {
      setShowAuth(true);
      return;
    }

    // Validation: Check if size/variant selection is required
    if (hasVariants || hasSizes) {
      if (!sizeId && !variantId) {
        setToast({ type: "error", message: "Please select a size" });
        return;
      }
    }

    // Check stock
    if (stock < 1) {
      setToast({ type: "error", message: "This item is out of stock" });
      return;
    }

    try {
      setLoading(true);
      
      // Build payload based on what's available
      const payload: any = { productId };
      
      if (variantId) {
        payload.variantId = variantId;
      }
      
      if (sizeId) {
        payload.sizeId = sizeId;
      }

      await api.post("/cart/add", payload);
      setToast({ type: "success", message: "Added to your bag!" });
    } catch (err: any) {
      const message = err?.response?.data?.message || "Something went wrong";
      setToast({ type: "error", message });
    } finally {
      setLoading(false);
    }
  };

  // Determine button state
  const isOutOfStock = stock < 1;
  const isDisabled = disabled || loading || isOutOfStock;

  return (
    <>
      <button
        onClick={handleAddToCart}
        disabled={isDisabled}
        className={`w-full py-4 rounded-full font-black text-xs uppercase tracking-widest transition-all duration-300 active:scale-95 shadow-lg
          ${
            isOutOfStock
              ? "bg-genz-border text-genz-muted cursor-not-allowed"
              : disabled
              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
              : "bg-genz-ink text-white hover:bg-genz-accent hover:shadow-indigo-500/20"
          }
        `}
      >
        {loading ? (
          <ButtonLoader />
        ) : isOutOfStock ? (
          "Sold Out"
        ) : disabled ? (
          "Select Options"
        ) : (
          "Add to Bag"
        )}
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
