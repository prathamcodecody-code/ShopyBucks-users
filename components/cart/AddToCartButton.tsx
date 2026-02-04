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
      setToast({ type: "error", message: "Select your size first" });
      return;
    }

    try {
      setLoading(true);
      await api.post("/cart/add", { productId, sizeId });
      setToast({ type: "success", message: "Added to your bag!" });
    } catch (err: any) {
      const message = err?.response?.data?.message || "Something went wrong";
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
        className={`w-full py-4 rounded-full font-black text-xs uppercase tracking-widest transition-all duration-300 active:scale-95 shadow-lg
          ${
            stock < 1
              ? "bg-genz-border text-genz-muted cursor-not-allowed"
              : "bg-genz-ink text-white hover:bg-genz-accent hover:shadow-indigo-500/20"
          }
        `}
      >
        {loading ? <ButtonLoader /> : stock < 1 ? "Sold Out" : "Add to Bag"}
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
