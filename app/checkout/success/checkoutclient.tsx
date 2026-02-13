"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { api } from "@/lib/api";
import { useCheckout } from "@/app/context/CheckoutContext";
import Link from "next/link";
import { 
  HiCheckCircle, 
  HiOutlineShoppingBag, 
  HiOutlineHome,
  HiOutlineTruck,
  HiOutlineCurrencyRupee,
  HiOutlineCreditCard
} from "react-icons/hi2";

export default function CheckoutSuccessClient() {
  const router = useRouter();
  const params = useSearchParams();
  const { resetCheckout } = useCheckout();

  const type = params.get("type");
  const orderId = params.get("orderId");

  const [loading, setLoading] = useState(true);
  const [orderData, setOrderData] = useState<any>(null);
  const [verificationFailed, setVerificationFailed] = useState(false);

  const isCOD = type === "COD";
  const isOnline = type === "ONLINE";

  useEffect(() => {
    if (!orderId) {
      router.replace("/");
      return;
    }

    // Clear checkout context immediately
    resetCheckout();

    // Verify order exists using user endpoint
    api
      .get(`/orders/verify/${orderId}`)
      .then((res) => {
        setOrderData(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Verify failed", err);

        if (err.response?.status === 404) {
          setVerificationFailed(true);
          setLoading(false);
          // Redirect after 3 seconds
          setTimeout(() => router.replace("/"), 3000);
        } else {
          // Allow success page even if verification has issues
          // Order was created, just show success
          setLoading(false);
        }
      });
  }, [orderId, router, resetCheckout]);

  if (loading) {
    return (
      <div className="min-h-screen bg-genz-bg flex items-center justify-center px-4">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-genz-accent border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-genz-muted font-bold animate-pulse">
            Verifying your order...
          </p>
        </div>
      </div>
    );
  }

  if (verificationFailed) {
    return (
      <div className="min-h-screen bg-genz-bg flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-genz-card rounded-genz shadow-lg p-8 text-center border-2 border-red-200">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">⚠️</span>
          </div>
          <h1 className="text-2xl font-black mb-2 text-genz-ink">Order Not Found</h1>
          <p className="text-genz-muted font-medium mb-4">
            We couldn't verify this order. Redirecting you to home...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-genz-bg flex items-center justify-center px-4 py-12">
      <div className="max-w-2xl w-full">
        
        {/* Success Animation */}
        <div className="bg-genz-card rounded-genz shadow-2xl p-8 md:p-12 text-center border-2 border-genz-border">
          
          {/* Checkmark Circle */}
          <div className="relative inline-flex items-center justify-center mb-6">
            <div className="absolute w-24 h-24 bg-green-100 rounded-full animate-ping opacity-75" />
            <div className="relative w-24 h-24 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
              <HiCheckCircle className="text-white" size={56} />
            </div>
          </div>

          {/* Success Message */}
          <h1 className="text-3xl md:text-4xl font-black mb-3 text-genz-ink">
            {isCOD ? "Order Placed Successfully! 🎉" : isOnline ? "Payment Successful! 🎉" : "Order Confirmed! 🎉"}
          </h1>
          
          <p className="text-genz-muted font-medium mb-8">
            Thank you for your purchase. Your order has been confirmed.
          </p>

          {/* Order Details Card */}
          <div className="bg-genz-bg rounded-xl p-6 mb-8 border-2 border-genz-border">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Order ID */}
              <div className="text-left">
                <p className="text-xs font-black uppercase tracking-widest text-genz-muted mb-2">
                  Order ID
                </p>
                <p className="font-black text-xl text-genz-accent">
                  #{orderId}
                </p>
              </div>

              {/* Payment Method */}
              <div className="text-left">
                <p className="text-xs font-black uppercase tracking-widest text-genz-muted mb-2">
                  Payment Method
                </p>
                <div className="flex items-center gap-2">
                  {isCOD ? (
                    <>
                      <HiOutlineCurrencyRupee size={20} className="text-genz-ink" />
                      <p className="font-bold text-genz-ink">Cash on Delivery</p>
                    </>
                  ) : (
                    <>
                      <HiOutlineCreditCard size={20} className="text-green-600" />
                      <p className="font-bold text-green-600">Paid Online</p>
                    </>
                  )}
                </div>
              </div>

            </div>

            {/* Status Banner */}
            <div className="mt-6 pt-6 border-t-2 border-genz-border">
              <div className="flex items-center justify-center gap-2 text-green-600 bg-green-50 py-3 px-4 rounded-lg">
                <HiOutlineTruck size={20} />
                <p className="font-black text-sm uppercase tracking-tight">
                  {isCOD ? "Order Processing - Pay at Delivery" : "Order Processing"}
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Link 
              href="/orders" 
              className="block w-full bg-genz-accent hover:brightness-110 text-white py-4 rounded-genz font-black text-lg shadow-lg shadow-genz-accent/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
            >
              <HiOutlineShoppingBag size={22} />
              View My Orders
            </Link>

            <Link 
              href="/" 
              className="block w-full border-2 border-genz-border hover:bg-genz-bg text-genz-ink py-4 rounded-genz font-bold transition-all flex items-center justify-center gap-2"
            >
              <HiOutlineHome size={22} />
              Continue Shopping
            </Link>
          </div>

          {/* Additional Info */}
          <div className="mt-8 pt-6 border-t-2 border-genz-border">
            <p className="text-xs text-genz-muted font-medium leading-relaxed">
              You will receive an email confirmation shortly.<br/>
              Track your order status in the <span className="font-bold text-genz-ink">My Orders</span> section.
            </p>
          </div>

        </div>

        {/* Trust Badge */}
        <div className="mt-6 text-center">
          <p className="text-xs font-bold text-genz-muted uppercase tracking-widest">
            Thank you for shopping with us! 💚
          </p>
        </div>

      </div>
    </div>
  );
}
