"use client";

import { useEffect, Suspense } from "react"; // Added Suspense
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthModal } from "@/app/auth/AuthModalContext";

// 1. Move the logic into a sub-component
function SignupContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { openRegister } = useAuthModal();

  useEffect(() => {
    const referralCode = searchParams.get("ref");

    if (referralCode) {
      localStorage.setItem("pendingReferralCode", referralCode);
    }

    openRegister();
    router.push("/");
  }, [searchParams, openRegister, router]);

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

// 2. Wrap the sub-component in Suspense
export default function SignupPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SignupContent />
    </Suspense>
  );
}
