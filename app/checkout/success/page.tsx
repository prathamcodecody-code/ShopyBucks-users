import { Suspense } from "react";
import CheckoutSuccessClient from "./checkoutclient";

export default function CheckoutSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[70vh] flex items-center justify-center">
          <p className="text-gray-500 animate-pulse font-medium">
            Processing your order...
          </p>
        </div>
      }
    >
      <CheckoutSuccessClient />
    </Suspense>
  );
}
