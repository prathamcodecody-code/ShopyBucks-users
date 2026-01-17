"use client";

import { AiOutlineHeart, AiFillHeart } from "react-icons/ai";
import { useWishlist } from "@/app/context/WishlistContext";
import { useAuth } from "@/app/context/AuthContext";
import AuthModal from "@/app/auth/AuthModal";
import { useState } from "react";

export default function AddToWishlistButton({
  productId,
  sizeId,
}: {
  productId: number;
  sizeId?: number;
}) {
  const { user, loading } = useAuth();
  const { wishlist, toggleWishlist } = useWishlist();
  const [showAuth, setShowAuth] = useState(false);

  if (loading) return null;

  const isWished = wishlist.some(
    (i) =>
      i.productId === productId &&
      (i.sizeId ?? null) === (sizeId ?? null)
  );

  const handleClick = async () => {
    if (!user) {
      setShowAuth(true);
      return;
    }

    await toggleWishlist(productId, sizeId);
  };

  return (
    <>
      <button
        onClick={handleClick}
        className="absolute top-3 right-3 z-10 bg-white rounded-full p-2 shadow hover:scale-110 transition"
      >
        {isWished ? (
          <AiFillHeart size={20} className="text-brandPink" />
        ) : (
          <AiOutlineHeart size={20} className="text-gray-500" />
        )}
      </button>

      <AuthModal show={showAuth} onClose={() => setShowAuth(false)} />
    </>
  );
}
