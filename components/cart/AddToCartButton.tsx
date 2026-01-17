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
  disabled?: boolean;
}

export default function AddToCartButton({
  productId,
  stock,
  sizeId,
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
    if (!user) {
      setShowAuth(true);
      return;
    }

    if (!sizeId) {
  setToast({
    type: "error",
    message: "Please select a size",
  });
  return;
}

    try {
      setLoading(true);

      await api.post("/cart/add", {
        productId,
        sizeId, // ✅ THIS WAS MISSING
      });

      setToast({
        type: "success",
        message: "Product added to cart!",
      });
    } catch (err: any) {
      const message =
        err?.response?.data?.message || "Failed to add product to cart";
      setToast({ type: "error", message });
    } finally {
      setLoading(false);
    }
  };

  

  return (
    <>
      <button
        onClick={handleAddToCart}
        disabled={disabled || loading || stock < 1}
        className={`w-full px-6 py-3 rounded-lg font-semibold transition
          ${
            stock < 1
              ? "bg-gray-300 text-gray-600 cursor-not-allowed"
              : "bg-amazon-orange text-white hover:bg-amazon-orangeHover"
          }
        `}
      >
        {loading ? <ButtonLoader /> : "Add to Cart"}
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
