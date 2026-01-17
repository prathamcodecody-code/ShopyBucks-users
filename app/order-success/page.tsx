import { Suspense } from "react";
import OrderSuccessClient from "./OrderSuccessClient";

export default function OrderSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[70vh] flex items-center justify-center">
          <p className="text-gray-500 animate-pulse font-medium">
            Loading order details...
          </p>
        </div>
      }
    >
      <OrderSuccessClient />
    </Suspense>
  );
}
