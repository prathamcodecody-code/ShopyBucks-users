"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { api } from "@/lib/api";
import Link from "next/link";
import { CheckCircle } from "lucide-react";

export default function CheckoutSuccessClient() {
  const router = useRouter();
  const params = useSearchParams();

  const type = params.get("type");
  const orderId = params.get("orderId");

  const [loading, setLoading] = useState(true);
  const isCOD = type === "COD";
  const isOnline = type === "ONLINE";

  useEffect(() => {
  if (!orderId) {
    router.replace("/");
    return;
  }

  api
    .get(`/seller/orders/${orderId}/verify`)
    .then(() => {
      setLoading(false);
    })
    .catch((err) => {
      console.error("Verify failed", err);

      if (err.response?.status === 404) {
        router.replace("/");
      } else {
        // Allow success page even if auth not ready yet
        setLoading(false);
      }
    });
}, [orderId, router]);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <p className="text-gray-500 animate-pulse font-medium">
          Verifying order...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
        <CheckCircle className="mx-auto text-green-500" size={72} />

        <h1 className="text-2xl font-bold mt-4">
  {isCOD
    ? "Order Placed Successfully 🎉"
    : isOnline
    ? "Payment Successful 🎉"
    : "Order Confirmed 🎉"}
</h1>
        <p className="mt-2 text-sm text-gray-500">
          Order ID: <span className="font-semibold text-brandPink">#{orderId}</span>
        </p>

        <div className="mt-6 space-y-3">
          <Link href="/orders" className="block w-full bg-brandPink text-white py-3 rounded-lg font-semibold">
            View My Orders
          </Link>

          <Link href="/" className="block w-full border py-3 rounded-lg font-semibold">
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
