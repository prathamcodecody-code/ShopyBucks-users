"use client";

import { useRouter } from "next/navigation";
import { useCheckout } from "@/app/context/CheckoutContext";
import { useState, useEffect } from "react";
import { 
  HiOutlineCreditCard, 
  HiOutlineCurrencyRupee,
  HiOutlineShieldCheck,
  HiCheck,
  HiArrowLeft
} from "react-icons/hi2";
import toast from "react-hot-toast";

/* ================= STEPPER COMPONENT ================= */
const steps = [
  { id: "address", label: "Address" },
  { id: "payment", label: "Payment" },
  { id: "review", label: "Review" },
];

function CheckoutStepper({ currentStep }: { currentStep: string }) {
  return (
    <div className="flex items-center justify-center mb-12">
      {steps.map((step, idx) => {
        const isCompleted = steps.findIndex(s => s.id === currentStep) > idx;
        const isActive = step.id === currentStep;

        return (
          <div key={step.id} className="flex items-center">
            <div className="flex flex-col items-center relative">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                  isActive 
                    ? "border-genz-accent bg-genz-accent text-white shadow-lg shadow-genz-accent/30" 
                    : isCompleted 
                    ? "border-genz-ink bg-genz-ink text-white" 
                    : "border-genz-border bg-white text-genz-muted"
                }`}
              >
                {isCompleted ? <HiCheck size={20} /> : <span className="font-black text-sm">{idx + 1}</span>}
              </div>
              <span className={`absolute -bottom-7 text-[10px] font-black uppercase tracking-wider whitespace-nowrap ${
                isActive ? "text-genz-ink" : "text-genz-muted"
              }`}>
                {step.label}
              </span>
            </div>
            {idx !== steps.length - 1 && (
              <div className={`w-16 md:w-24 h-[2px] mx-2 ${isCompleted ? "bg-genz-ink" : "bg-genz-border"}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function CheckoutPaymentPage() {
  const router = useRouter();
  const { paymentMethod, setPaymentMethod, addressId, isHydrated } = useCheckout(); 
  const [error, setError] = useState("");

  // Guard: redirect if no address selected (wait for hydration)
  useEffect(() => {
    if (!isHydrated) return;
    
    if (!addressId) {
      console.log("No addressId in payment page, redirecting...");
      toast.error("Please select an address first");
      router.replace("/checkout/address");
    }
  }, [addressId, router, isHydrated]);

  const continueToReview = () => {
    if (!paymentMethod) {
      setError("Please select a payment method to continue.");
      return;
    }
    setError("");
    console.log("Continuing to review with:", { addressId, paymentMethod });
    router.push("/checkout/review");
  };

  const goBack = () => {
    router.back();
  };

  // Wait for hydration
  if (!isHydrated) {
    return (
      <div className="bg-genz-bg min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-genz-accent border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-genz-muted font-bold">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render until we have addressId
  if (!addressId) {
    return null;
  }

  return (
    <div className="bg-genz-bg min-h-screen py-12 px-4 text-genz-ink">
      <div className="max-w-2xl mx-auto">
        
        <CheckoutStepper currentStep="payment" />

        <div className="mb-8 flex items-end justify-between">
          <div>
            <h1 className="text-3xl font-black tracking-tight">Payment</h1>
            <p className="text-genz-muted font-medium">How would you like to pay?</p>
          </div>
          <div className="hidden md:flex items-center gap-2 text-[10px] font-bold text-green-600 uppercase tracking-widest bg-green-50 px-3 py-1 rounded-full border border-green-100">
            <HiOutlineShieldCheck size={14} />
            Secure Encrypted
          </div>
        </div>

        <div className="space-y-4">
          {/* CASH ON DELIVERY */}
          <label
            className={`relative block border-2 rounded-genz p-6 cursor-pointer transition-all duration-200 shadow-sm
              ${paymentMethod === "COD" 
                ? "border-genz-accent bg-genz-softAccent ring-4 ring-genz-accent/5" 
                : "border-genz-border bg-genz-card hover:border-genz-muted"
              }`}
          >
            <input
              type="radio"
              className="hidden"
              checked={paymentMethod === "COD"}
              onChange={() => setPaymentMethod("COD")}
            />
            <div className="flex items-center gap-5">
              <div className={`p-4 rounded-2xl ${paymentMethod === "COD" ? "bg-genz-accent text-white" : "bg-genz-bg text-genz-muted"}`}>
                <HiOutlineCurrencyRupee size={28} />
              </div>
              <div className="flex-1">
                <p className="font-black text-lg">Cash on Delivery (COD)</p>
                <p className="text-sm text-genz-muted font-medium">Pay when your package arrives</p>
              </div>
              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${paymentMethod === "COD" ? "border-genz-accent" : "border-genz-border"}`}>
                {paymentMethod === "COD" && <div className="w-3 h-3 bg-genz-accent rounded-full" />}
              </div>
            </div>
          </label>

          {/* ONLINE PAYMENT */}
          <label
            className={`relative block border-2 rounded-genz p-6 cursor-pointer transition-all duration-200 shadow-sm
              ${paymentMethod === "RAZORPAY" 
                ? "border-genz-accent bg-genz-softAccent ring-4 ring-genz-accent/5" 
                : "border-genz-border bg-genz-card hover:border-genz-muted"
              }`}
          >
            <input
              type="radio"
              className="hidden"
              checked={paymentMethod === "ONLINE"}
              onChange={() => setPaymentMethod("ONLINE")}
            />
            <div className="flex items-center gap-5">
              <div className={`p-4 rounded-2xl ${paymentMethod === "ONLINE" ? "bg-genz-accent text-white" : "bg-genz-bg text-genz-muted"}`}>
                <HiOutlineCreditCard size={28} />
              </div>
              <div className="flex-1">
                <p className="font-black text-lg">Online Payment</p>
                <p className="text-sm text-genz-muted font-medium">UPI, Cards, or Net Banking</p>
              </div>
              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${paymentMethod === "ONLINE" ? "border-genz-accent" : "border-genz-border"}`}>
                {paymentMethod === "ONLINE" && <div className="w-3 h-3 bg-genz-accent rounded-full" />}
              </div>
            </div>
          </label>
        </div>

        {error && (
          <div className="mt-6 p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm font-bold flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-red-600 rounded-full animate-pulse" />
            {error}
          </div>
        )}

        <div className="mt-10 pt-6 border-t border-genz-border space-y-3">
          <button
            onClick={continueToReview}
            className="w-full bg-genz-accent hover:brightness-110 text-white py-5 rounded-genz font-black text-xl transition-all shadow-lg shadow-genz-accent/20 active:scale-[0.98]"
          >
            Review Order
          </button>
          
          <button
            onClick={goBack}
            className="w-full border-2 border-genz-border hover:bg-genz-card text-genz-ink py-4 rounded-genz font-bold transition-all flex items-center justify-center gap-2"
          >
            <HiArrowLeft size={20} />
            Back to Address
          </button>
        </div>

        <p className="text-center text-[10px] text-genz-muted uppercase font-black tracking-[0.2em] mt-6">
          Trusted by 10,000+ customers
        </p>

        {/* TRUST LOGOS */}
        <div className="mt-12 flex flex-wrap justify-center items-center gap-8 opacity-40 grayscale contrast-125">
           <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" alt="MC" className="h-6" />
           <img src="https://upload.wikimedia.org/wikipedia/commons/0/04/Visa.svg" alt="Visa" className="h-4" />
           <img src="https://easebuzz.in/assets/images/logo.png" alt="Easebuzz" className="h-5" />
        </div>
      </div>
    </div>
  );
}
