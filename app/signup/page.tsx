"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthModal } from "@/app/auth/AuthModalContext";

export default function SignupPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { openRegister } = useAuthModal();

  useEffect(() => {
    // Get referral code from URL
    const referralCode = searchParams.get("ref");

    // Store referral code in localStorage temporarily
    if (referralCode) {
      localStorage.setItem("pendingReferralCode", referralCode);
    }

    // Open register modal
    openRegister();

    // Redirect to home page (modal will be open)
    router.push("/");
  }, [searchParams, openRegister, router]);

  // Show loading while redirecting
  return (
    <div className="min-h-screen bg-genz-bg flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="w-16 h-16 border-4 border-genz-accent border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-genz-muted font-bold uppercase tracking-widest text-sm">
          Opening registration...
        </p>
      </div>
    </div>
  );
}