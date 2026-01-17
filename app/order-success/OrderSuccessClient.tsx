"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { CheckCircle } from "lucide-react";

export default function OrderSuccessClient() {
  const params = useSearchParams();
  const router = useRouter();
  const orderId = params.get("orderId");

  if (!orderId) {
    router.replace("/");
    return null;
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="bg-white max-w-xl w-full rounded-2xl shadow-lg p-10 text-center">
        <div className="flex justify-center mb-6">
          <CheckCircle className="w-20 h-20 text-green-600" />
        </div>

        <h1 className="text-3xl font-bold text-brandBlack">
          Order Placed Successfully
        </h1>

        <p className="mt-3 text-gray-600 text-lg">
          Your Order ID is{" "}
          <span className="font-semibold text-brandPink">
            #{orderId}
          </span>
        </p>

        <p className="mt-2 text-gray-500">
          You’ll receive order updates on your registered phone number.
        </p>

        <div className="border-t my-8" />

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => router.push(`/orders/${orderId}`)}
            className="px-6 py-3 bg-brandPink text-white rounded-xl font-semibold"
          >
            View Order
          </button>

          <button
            onClick={() => router.push("/")}
            className="px-6 py-3 border rounded-xl font-semibold"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    </div>
  );
}
