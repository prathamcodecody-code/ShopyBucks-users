"use client";

import { useState } from "react";
import { api } from "@/lib/api";

type ReviewModalProps = {
  orderId: number;
  product: {
    id: number;
    title: string;
  };
  onClose: () => void;
  onSuccess: () => void;
};


export default function ReviewModal({
  orderId,
  product,
  onClose,
  onSuccess,
}: ReviewModalProps) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async () => {
    try {
      setLoading(true);
      setError("");

      await api.post("/reviews", {
        orderId,
        productId: product.id,
        rating,
        comment,
      });

      onSuccess();
      onClose();
    } catch (e: any) {
      setError(
        e.response?.data?.message || "Failed to submit review"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center">
      <div className="bg-white rounded-xl p-6 w-full max-w-md">
        <h2 className="text-lg font-bold mb-2">Rate this product</h2>
        <p className="text-sm text-gray-500 mb-4">
          {product.title}
        </p>

        {/* STARS */}
        <div className="flex gap-2 mb-4">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              onClick={() => setRating(n)}
              className={`text-2xl ${
                n <= rating ? "text-yellow-400" : "text-gray-300"
              }`}
            >
              ★
            </button>
          ))}
        </div>

        {/* COMMENT */}
        <textarea
          className="w-full border rounded-lg p-3 text-sm"
          rows={3}
          placeholder="Write your feedback (optional)"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />

        {error && (
          <p className="text-red-500 text-sm mt-2">{error}</p>
        )}

        {/* ACTIONS */}
        <div className="flex justify-end gap-3 mt-5">
          <button onClick={onClose} className="px-4 py-2 border rounded">
            Cancel
          </button>

          <button
  onClick={submit}
  disabled={loading || !product}
  className={`px-4 py-2 rounded text-white ${
    loading || !product
      ? "bg-gray-300 cursor-not-allowed"
      : "bg-brandPink hover:bg-brandPinkLight"
  }`}
>

            {loading ? "Submitting…" : "Submit"}
          </button>
        </div>
      </div>
    </div>
  );
}
