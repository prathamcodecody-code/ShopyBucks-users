"use client";

import { useRouter } from "next/navigation";
import { useCheckout } from "@/app/context/CheckoutContext";
import { useState } from "react";
import { 
  HiOutlineChevronRight, 
  HiOutlineCreditCard, 
  HiOutlineCurrencyRupee,
  HiOutlineShieldCheck,
  HiCheckCircle
} from "react-icons/hi2";

export default function CheckoutPaymentPage() {
  const router = useRouter();
  const { paymentMethod, setPaymentMethod } = useCheckout();
  const [error, setError] = useState("");

  const continueToReview = () => {
    if (!paymentMethod) {
      setError("Please select a payment method to continue with your order.");
      return;
    }

    setError("");
    router.push("/checkout/review");
  };

  return (
    <div className="bg-amazon-lightGray min-h-screen py-12 px-4">
      <div className="max-w-3xl mx-auto">
        
        {/* --- CHECKOUT STEPS --- */}
        <div className="flex items-center justify-center gap-4 mb-10">
          <div className="flex items-center gap-2 text-amazon-success">
            <span className="w-7 h-7 rounded-full bg-amazon-success text-white flex items-center justify-center text-xs font-black">
              <HiCheckCircle size={18} />
            </span>
            <span className="font-bold text-sm">Address</span>
          </div>
          <HiOutlineChevronRight className="text-gray-400" />
          <div className="flex items-center gap-2 text-amazon-orange">
            <span className="w-7 h-7 rounded-full bg-amazon-orange text-amazon-darkBlue flex items-center justify-center text-xs font-black">2</span>
            <span className="font-bold text-sm">Payment</span>
          </div>
          <HiOutlineChevronRight className="text-gray-400" />
          <div className="flex items-center gap-2 text-gray-400">
            <span className="w-7 h-7 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center text-xs font-black">3</span>
            <span className="font-bold text-sm">Review</span>
          </div>
        </div>

        {/* --- MAIN PAYMENT BOX --- */}
        <div className="bg-white rounded-3xl shadow-sm border border-amazon-borderGray overflow-hidden">
          <div className="p-8 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h1 className="text-xl font-black text-amazon-text leading-tight">Payment Method</h1>
              <p className="text-xs text-amazon-mutedText uppercase font-bold tracking-wider mt-0.5">Select how you'd like to pay</p>
            </div>
            <div className="hidden sm:flex items-center gap-1.5 text-[10px] font-bold text-amazon-success border border-green-100 bg-green-50 px-3 py-1 rounded-full uppercase">
              <HiOutlineShieldCheck size={14} /> 100% Secure
            </div>
          </div>

          <div className="p-8 space-y-4">
            {/* CASH ON DELIVERY */}
            <div
              onClick={() => setPaymentMethod("COD")}
              className={`group border-2 rounded-2xl p-5 cursor-pointer flex justify-between items-center transition-all duration-200 ${
                paymentMethod === "COD"
                  ? "border-amazon-orange bg-amazon-orange/5 shadow-inner"
                  : "border-gray-100 hover:border-gray-300 bg-gray-50/30"
              }`}
            >
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl transition-colors ${paymentMethod === "COD" ? "bg-amazon-orange text-amazon-darkBlue" : "bg-white text-gray-400 shadow-sm"}`}>
                  <HiOutlineCurrencyRupee size={24} />
                </div>
                <div>
                  <p className="font-black text-amazon-text">Cash on Delivery (COD)</p>
                  <p className="text-xs text-amazon-mutedText font-medium mt-0.5">
                    Pay via Cash/UPI upon receiving your package
                  </p>
                </div>
              </div>
              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${paymentMethod === "COD" ? "border-amazon-orange bg-amazon-orange" : "border-gray-300"}`}>
                 {paymentMethod === "COD" && <div className="w-2 h-2 bg-amazon-darkBlue rounded-full" />}
              </div>
            </div>

            {/* RAZORPAY / ONLINE */}
            <div
              onClick={() => setPaymentMethod("RAZORPAY")}
              className={`group border-2 rounded-2xl p-5 cursor-pointer flex justify-between items-center transition-all duration-200 ${
                paymentMethod === "RAZORPAY"
                  ? "border-amazon-orange bg-amazon-orange/5 shadow-inner"
                  : "border-gray-100 hover:border-gray-300 bg-gray-50/30"
              }`}
            >
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl transition-colors ${paymentMethod === "RAZORPAY" ? "bg-amazon-orange text-amazon-darkBlue" : "bg-white text-gray-400 shadow-sm"}`}>
                  <HiOutlineCreditCard size={24} />
                </div>
                <div>
                  <p className="font-black text-amazon-text">Online Payment</p>
                  <p className="text-xs text-amazon-mutedText font-medium mt-0.5">
                    UPI, Credit/Debit Cards, or Net Banking
                  </p>
                </div>
              </div>
              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${paymentMethod === "RAZORPAY" ? "border-amazon-orange bg-amazon-orange" : "border-gray-300"}`}>
                 {paymentMethod === "RAZORPAY" && <div className="w-2 h-2 bg-amazon-darkBlue rounded-full" />}
              </div>
            </div>

            {/* ERROR MESSAGE */}
            {error && (
              <div className="mt-4 flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-xl text-sm font-medium border border-red-100 animate-in fade-in slide-in-from-top-1">
                <span className="w-1.5 h-1.5 rounded-full bg-red-600" />
                {error}
              </div>
            )}

            {/* CTA BUTTON */}
            <div className="pt-6">
              <button
                onClick={continueToReview}
                className="w-full bg-amazon-orange hover:bg-amazon-orangeHover text-amazon-darkBlue py-4 rounded-2xl font-black text-lg transition-all shadow-md active:scale-[0.98]"
              >
                Continue to Review
              </button>
              <p className="text-center text-[10px] text-amazon-mutedText uppercase font-bold tracking-widest mt-4">
                You won't be charged until the final step
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 flex items-center justify-center gap-6">
          <img src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" alt="PayPal" className="h-4 opacity-30 grayscale" />
          <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" alt="Mastercard" className="h-6 opacity-30 grayscale" />
          <img src="https://upload.wikimedia.org/wikipedia/commons/0/04/Visa.svg" alt="Visa" className="h-3 opacity-30 grayscale" />
          <img src="https://upload.wikimedia.org/wikipedia/commons/8/89/Razorpay_logo.svg" alt="Razorpay" className="h-4 opacity-30 grayscale" />
        </div>
      </div>
    </div>
  );
}