"use client";

import { useState } from "react";
import { MapPin, Truck, Banknote, AlertCircle, CheckCircle2, Loader2 } from "lucide-react";

type ServiceabilityResponse = {
  serviceable: boolean;
  codAllowed: boolean;
  maxCodAmount: number;
  message?: string;
};

export default function DeliveryCheck({
  productId,
  orderAmount,
}: {
  productId: number;
  orderAmount: number;
}) {
  const [pincode, setPincode] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ServiceabilityResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const checkServiceability = async () => {
    if (pincode.length !== 6) {
      setError("Enter a valid 6-digit pincode");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setResult(null);

      const res = await fetch(
        "https://apiv2.shopybucks.com/api/shipping/product-serviceability",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            productId,
            dropPincode: pincode,
            orderAmount,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
  throw new Error(data?.message || "Unable to check delivery");
};
      if (data.message === "EKART_TEMPORARILY_UNAVAILABLE") {
        throw new Error("Delivery check is temporarily down. Try later.");
      }

      setResult(data);
    } catch (err: any) {
      setError(err.message || "Unable to check delivery");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white border border-genz-border rounded-genz p-5 shadow-sm max-w-md">
      <div className="flex items-center gap-2 mb-4">
        <MapPin size={18} className="text-genz-accent" />
        <h3 className="text-xs font-black uppercase tracking-widest text-genz-ink">
          Delivery Options
        </h3>
      </div>

      <div className="flex gap-2 relative">
        <input
          type="text"
          placeholder="Enter Pincode"
          value={pincode}
          maxLength={6}
          onChange={(e) => setPincode(e.target.value.replace(/\D/g, ""))}
          className="flex-1 bg-genz-bg border border-genz-border rounded-xl px-4 py-3 text-sm font-bold focus:outline-none focus:border-genz-accent transition-all placeholder:text-genz-muted/50"
        />
        <button
          onClick={checkServiceability}
          disabled={loading || pincode.length < 6}
          className="bg-genz-ink text-white px-6 py-3 rounded-xl text-xs font-black uppercase tracking-tighter hover:opacity-90 disabled:opacity-30 disabled:cursor-not-allowed transition-all flex items-center gap-2"
        >
          {loading ? <Loader2 size={14} className="animate-spin" /> : "Check"}
        </button>
      </div>

      {/* Results Area */}
      <div className="mt-4 space-y-3 transition-all animate-in fade-in slide-in-from-top-2">
        {error && (
          <div className="flex items-start gap-2 text-red-500 bg-red-50 p-3 rounded-xl border border-red-100">
            <AlertCircle size={16} className="shrink-0 mt-0.5" />
            <p className="text-[11px] font-bold leading-tight">{error}</p>
          </div>
        )}

        {result && (
          <div className="space-y-2.5">
            {result.serviceable ? (
              <>
                <div className="flex items-center gap-2 text-green-600 bg-green-50 p-3 rounded-xl border border-green-100">
                  <Truck size={16} />
                  <span className="text-xs font-bold">Standard Delivery Available</span>
                </div>

                {result.codAllowed ? (
                  orderAmount <= result.maxCodAmount ? (
                    <div className="flex items-center gap-2 text-blue-600 bg-blue-50 p-3 rounded-xl border border-blue-100">
                      <Banknote size={16} />
                      <span className="text-xs font-bold">Cash on Delivery Available</span>
                    </div>
                  ) : (
                    <div className="flex items-start gap-2 text-amber-600 bg-amber-50 p-3 rounded-xl border border-amber-100">
                      <AlertCircle size={16} className="shrink-0 mt-0.5" />
                      <p className="text-xs font-bold">
                        COD only for orders up to ₹{result.maxCodAmount.toLocaleString()}
                      </p>
                    </div>
                  )
                ) : (
                  <div className="flex items-center gap-2 text-genz-muted bg-genz-bg p-3 rounded-xl border border-genz-border">
                    <CheckCircle2 size={16} className="opacity-40" />
                    <span className="text-xs font-bold opacity-60">Prepaid Orders Only</span>
                  </div>
                )}
              </>
            ) : (
              <div className="flex items-center gap-2 text-red-500 bg-red-50 p-3 rounded-xl border border-red-100">
                <AlertCircle size={16} />
                <span className="text-xs font-bold">Not serviceable to this area</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}