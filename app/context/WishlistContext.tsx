"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useAuth } from "./AuthContext";

type WishlistItem = {
  id: number;
  productId: number;
  sizeId?: number | null;
};

type WishlistContextType = {
  wishlist: WishlistItem[];
  toggleWishlist: (productId: number, sizeId?: number) => Promise<void>;
};

const WishlistContext = createContext<WishlistContextType | null>(null);

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);

  /* -------- LOAD WISHLIST -------- */
  useEffect(() => {
    if (!user) {
      setWishlist([]);
      return;
    }

    api.get("/wishlist").then((res) => {
      setWishlist(res.data || []);
    });
  }, [user]);

  /* -------- TOGGLE -------- */
  const toggleWishlist = async (productId: number, sizeId?: number) => {
    const res = await api.post("/wishlist/toggle", {
      productId,
      sizeId,
    });

    setWishlist((prev) => {
      const exists = prev.find(
        (i) =>
          i.productId === productId &&
          (i.sizeId ?? null) === (sizeId ?? null)
      );

      if (exists) {
        return prev.filter((i) => i.id !== exists.id);
      }

      return [
        ...prev,
        {
          id: Date.now(), // temporary, backend truth comes on reload
          productId,
          sizeId: sizeId ?? null,
        },
      ];
    });

    return res.data;
  };

  return (
    <WishlistContext.Provider value={{ wishlist, toggleWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
}

export const useWishlist = () => {
  const ctx = useContext(WishlistContext);
  if (!ctx) {
    throw new Error("useWishlist must be used inside WishlistProvider");
  }
  return ctx;
};
