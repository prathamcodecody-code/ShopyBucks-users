"use client";

import { api } from "@/lib/api";
import { useAuth } from "@/app/context/AuthContext";
import { useState } from "react";
import AuthModal from "@/app/auth/AuthModal";
import Toast from "@/components/ui/toast";
import ButtonLoader from "@/components/ui/ButtonLoader";

export interface AddToCartButtonProps {
  productId: number;
  stock: number; // ✅ This should be the current SKU's stock (or total stock)
  sizeId?: number; // ✅ Selected SKU ID
  disabled?: boolean;
  selectedColor?: string | null;
}

export default function AddToCartButton({
  productId,
  stock,
  sizeId,
  disabled = false,
  selectedColor = null,
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
      console.error("Invalid productId:", productId);
      setToast({ type: "error", message: "Invalid product" });
      return;
    }

    // ✅ Check authentication
    if (!user) {
      setShowAuth(true);
      return;
    }

    // ✅ Check stock FIRST (before validation)
    // This prevents showing "select color/size" when item is out of stock
    if (stock < 1) {
      setToast({ type: "error", message: "This item is out of stock" });
      return;
    }

    // ✅ Validation: If sizeId is undefined, selection is required
    // The parent (ProductClient) should pass sizeId only when a full selection is made
    if (!sizeId) {
      // Determine what's missing
      if (!selectedColor) {
        setToast({ type: "error", message: "Please select a color" });
      } else {
        setToast({ type: "error", message: "Please select a size" });
      }
      return;
    }

    try {
      setLoading(true);

      // ✅ Simple payload - backend handles validation
      await api.post("/cart/add", {
        productId,
        sizeId, // This is the SKU ID
      });

      setToast({ type: "success", message: "Added to your bag!" });
    } catch (err: any) {
      const message = err?.response?.data?.message || "Something went wrong";
      setToast({ type: "error", message });
    } finally {
      setLoading(false);
    }
  };

  // ✅ Button state
  const isOutOfStock = stock < 1;
  const isDisabled = disabled || loading || isOutOfStock;

  // ✅ Button text logic
  let buttonText = "Add to Bag";
  
  if (loading) {
    buttonText = "Adding...";
  } else if (isOutOfStock) {
    buttonText = "Sold Out";
  } else if (disabled) {
    // Disabled means selection is incomplete
    buttonText = "Select Options";
  }

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
