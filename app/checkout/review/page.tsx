"use client";

import { useRouter } from "next/navigation";
import { useCheckout } from "@/app/context/CheckoutContext";
import { api } from "@/lib/api";
import { useEffect, useState } from "react";
import { 
  HiCheckCircle, 
  HiOutlineChevronRight, 
  HiOutlineCreditCard, 
  HiOutlineShieldCheck, 
  HiOutlineTruck,
  HiCheck,
  HiArrowLeft,
  HiOutlineMapPin,
  HiOutlineTicket,
  HiOutlineWallet // ✅ NEW ICON
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

export default function CheckoutReviewPage() {
  const router = useRouter();
  const { addressId, paymentMethod, resetCheckout, isHydrated } = useCheckout();

  const [address, setAddress] = useState<any>(null);
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState("");
  const [discount, setDiscount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const [error, setError] = useState("");
  const [shippingFee, setShippingFee] = useState(0);
  const [shippingLoading, setShippingLoading] = useState(false);
  const [shippingError, setShippingError] = useState("");
  const [couponError, setCouponError] = useState("");

  // ✅ NEW: Wallet states
  const [walletBalance, setWalletBalance] = useState(0);
  const [useWallet, setUseWallet] = useState(false);
  const [walletLoading, setWalletLoading] = useState(false);

  /* ================= GUARDS - WAIT FOR HYDRATION ================= */
  useEffect(() => {
    if (!isHydrated) return;
    
    if (loading) return;

    if (!addressId) {
      console.log("No addressId, redirecting to address page");
      toast.error("Please select an address first");
      router.replace("/checkout/address");
      return;
    }
    if (!paymentMethod) {
      console.log("No paymentMethod, redirecting to payment page");
      toast.error("Please select a payment method");
      router.replace("/checkout/payment");
      return;
    }
  }, [addressId, paymentMethod, router, isHydrated, loading]);

  /* ================= FETCH DATA ================= */
  useEffect(() => {
    if (!isHydrated || !addressId) return;

    const fetchData = async () => {
      try {
        setDataLoading(true);

        // Fetch all addresses and find the selected one
        const addressRes = await api.get(`/user/addresses`);
        const selectedAddress = addressRes.data?.find((addr: any) => addr.id === addressId);
        
        if (!selectedAddress) {
          toast.error("Selected address not found");
          router.replace("/checkout/address");
          return;
        }
        
        setAddress(selectedAddress);

        // Fetch cart
        const cartRes = await api.get("/cart");
        setCartItems(cartRes.data.items || []);

        // ✅ NEW: Fetch wallet balance (only for online payment)
        if (paymentMethod === "ONLINE") {
          try {
            setWalletLoading(true);
            const walletRes = await api.get("/wallet");
            setWalletBalance(Number(walletRes.data.balance) || 0);
          } catch (err) {
            console.error("Failed to fetch wallet:", err);
            setWalletBalance(0);
          } finally {
            setWalletLoading(false);
          }
        }

      } catch (err: any) {
        toast.error("Failed to load order details");
        console.error(err);
      } finally {
        setDataLoading(false);
      }
    };

    fetchData();
  }, [addressId, isHydrated, router, paymentMethod]);

  /* ================= CALCULATE SHIPPING ================= */
  useEffect(() => {
    if (!address || cartItems.length === 0) return;

    const calculateShipping = async () => {
      try {
        setShippingLoading(true);
        setShippingError("");

        let totalShipping = 0;

        for (const item of cartItems) {
          const res = await api.post("/api/shipping/product-serviceability", {
            productId: item.product.id,
            dropPincode: address.pincode,
            orderAmount: item.unitPrice * item.quantity,
          });

          if (!res.data.serviceable) {
            throw new Error(
              `${item.product.title} is not deliverable to your location`
            );
          }

          totalShipping += res.data.shippingCharge;
        }

        setShippingFee(totalShipping);
      } catch (err: any) {
        setShippingError(
          err?.response?.data?.message ||
            "Delivery not available for one or more items"
        );
      } finally {
        setShippingLoading(false);
      }
    };

    calculateShipping();
  }, [address, cartItems]);

  /* ================= PRICE CALCULATIONS ================= */
  const subtotal = cartItems.reduce((sum, item) => {
    const unitPrice = Number(item.unitPrice);
    return sum + unitPrice * item.quantity;
  }, 0);

  const mrpTotal = cartItems.reduce((sum, item) => {
    const mrp = Number(item.mrp || item.unitPrice);
    return sum + mrp * item.quantity;
  }, 0);

  const productDiscount = mrpTotal - subtotal;
  const deliveryFee = shippingFee;
  const totalBeforeDiscount = subtotal + deliveryFee;
  const finalTotal = Math.max(0, totalBeforeDiscount - discount);

  // ✅ NEW: Wallet calculations
  const walletUsable = useWallet && paymentMethod === "ONLINE" ? Math.min(walletBalance, finalTotal) : 0;
  const remainingPayable = Math.max(0, finalTotal - walletUsable);

  /* ================= APPLY COUPON ================= */
  const applyCoupon = async () => {
    if (!couponCode.trim()) {
      setCouponError("Please enter a coupon code");
      return;
    }

    try {
      setCouponError("");
      const res = await api.post("/coupons/validate", {
        code: couponCode,
        cartTotal: subtotal,
      });
      setDiscount(res.data.discount);
      setAppliedCoupon(couponCode);
      toast.success(`Coupon applied! You saved ₹${res.data.discount}`);
    } catch (err: any) {
      setDiscount(0);
      setAppliedCoupon("");
      setCouponError(err?.response?.data?.message || "Invalid coupon code");
    }
  };

  const removeCoupon = () => {
    setDiscount(0);
    setAppliedCoupon("");
    setCouponCode("");
    setCouponError("");
  };

  /* ================= PLACE ORDER ================= */
  const placeOrder = async () => {
    console.log("appliedCoupon state:", appliedCoupon);
    console.log("useWallet:", useWallet);
    console.log("Sending body:", { 
      addressId, 
      paymentMethod, 
      couponCode: appliedCoupon,
      useWallet: useWallet && paymentMethod === "ONLINE",
    });
    
    try {
      setLoading(true);
      setError("");

      // ✅ NEW: Full Wallet Payment (if wallet covers entire amount)
      if (useWallet && walletBalance >= finalTotal && paymentMethod === "ONLINE") {
        const res = await api.post("/orders", {
          addressId,
          paymentMethod: "WALLET", // ✅ Use WALLET payment method
          couponCode: appliedCoupon || undefined,
        });

        router.replace(`/checkout/success?orderId=${res.data.orderId}&type=WALLET`);
        return;
      }

      // COD Flow
      if (paymentMethod === "COD") {
        const res = await api.post("/orders", {
          addressId,
          paymentMethod,
          couponCode: appliedCoupon || undefined,
        });

        router.replace(`/checkout/success?orderId=${res.data.orderId}&type=COD`);
        return;
      }

      // ✅ UPDATED: Online Payment Flow (with or without wallet)
      const orderRes = await api.post("/orders", {
        addressId,
        paymentMethod: "ONLINE",
        couponCode: appliedCoupon || undefined,
        useWallet: useWallet, // ✅ NEW: Send wallet preference
      });

      // ✅ NEW: If wallet covered entire amount, no payment gateway needed
      if (orderRes.data.remainingPayable === 0) {
        router.replace(`/checkout/success?orderId=${orderRes.data.orderId}&type=WALLET`);
        return;
      }

      const payment = orderRes.data.payment ?? orderRes.data;

      console.log("Payment data received:", payment);
      if (!payment?.paymentUrl) {
        console.error("Unexpected payment response:", orderRes.data);
        throw new Error("Payment gateway initialization failed");
      }

      // Validate payment data
      if (!payment || !payment.paymentUrl) {
        throw new Error("Invalid payment data received from server");
      }

      console.log("Redirecting to:", payment.paymentUrl);
      
      const walletMessage = useWallet && walletUsable > 0 
        ? `₹${walletUsable} will be deducted from wallet. ` 
        : '';
      
      toast.loading(`${walletMessage}Redirecting to payment gateway...`, { duration: 2000 });

      // Small delay for user to see the loading message
      setTimeout(() => {
        window.location.href = payment.paymentUrl;
      }, 500);
      
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to place order");
      setLoading(false);
      toast.error(err?.response?.data?.message || "Failed to place order");
      console.error("Order placement error:", err);
    }
  }; 

  /* ================= LOADING STATES ================= */
  
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

  // Loading state
  if (dataLoading) {
    return (
      <div className="bg-genz-bg min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-genz-accent border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-genz-muted font-bold">Loading order details...</p>
        </div>
      </div>
    );
  }

  // Guard render
  if (!address || !paymentMethod) {
    return null;
  }

  /* ================= MAIN RENDER ================= */
  return (
    <div className="bg-genz-bg min-h-screen py-12 px-4 text-genz-ink">
      <div className="max-w-5xl mx-auto">
        
        <CheckoutStepper currentStep="review" />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* LEFT: ORDER PREVIEW */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* ADDRESS & PAYMENT SUMMARY */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Shipping Address */}
              <div className="bg-genz-card p-6 rounded-genz border-2 border-genz-border shadow-sm">
                <div className="flex items-center gap-2 mb-4 text-genz-muted">
                  <HiOutlineMapPin size={20} />
                  <h2 className="text-xs font-black uppercase tracking-widest">Shipping To</h2>
                </div>
                <div className="space-y-1 text-sm font-medium text-genz-ink">
                  <p className="font-black text-base">{address.fullName}</p>
                  <p className="text-genz-muted">{address.phone}</p>
                  <p className="pt-2 leading-relaxed">
                    {address.addressLine1}
                    {address.addressLine2 && `, ${address.addressLine2}`}
                    <br />
                    {address.city}, {address.state} - {address.pincode}
                  </p>
                </div>
              </div>

              {/* Payment Method */}
              <div className="bg-genz-card p-6 rounded-genz border-2 border-genz-border shadow-sm">
                <div className="flex items-center gap-2 mb-4 text-genz-muted">
                  <HiOutlineCreditCard size={20} />
                  <h2 className="text-xs font-black uppercase tracking-widest">Payment Method</h2>
                </div>
                <div className="space-y-2">
                  <p className="font-black text-base text-genz-ink">
                    {paymentMethod === "COD" ? "Cash on Delivery" : "Online Payment"}
                  </p>
                  <p className="text-xs font-bold text-green-600 bg-green-50 px-3 py-1.5 rounded-lg inline-block uppercase tracking-tight">
                    {paymentMethod === "COD" ? "Pay at Doorstep" : "Easebuzz Secure"}
                  </p>
                </div>
              </div>
            </div>

            {/* ITEMS LIST */}
            <div className="bg-genz-card rounded-genz border-2 border-genz-border shadow-sm overflow-hidden">
              <div className="px-6 py-4 bg-genz-bg border-b-2 border-genz-border flex items-center justify-between">
                <h2 className="text-xs font-black text-genz-ink uppercase tracking-widest">Order Items</h2>
                <span className="text-xs font-bold bg-genz-accent/10 text-genz-accent px-3 py-1 rounded-full">
                  {cartItems.length} {cartItems.length === 1 ? 'Item' : 'Items'}
                </span>
              </div>
              
              <div className="divide-y-2 divide-genz-border">
                {cartItems.map((item) => {
                  const unitPrice = Number(item.unitPrice);
                  const mrp = Number(item.mrp || item.unitPrice);
                  const hasDiscount = mrp > unitPrice;
                  
                  return (
                    <div key={item.id} className="p-6 flex justify-between items-center gap-4 hover:bg-genz-bg/50 transition-colors">
                      <div className="flex gap-4 items-center flex-1">
                        <div className="w-20 h-24 bg-genz-bg rounded-xl overflow-hidden shrink-0 border-2 border-genz-border">
                          <img 
                            src={`${process.env.NEXT_PUBLIC_API_URL}/uploads/products/${item.product.img1}`} 
                            className="w-full h-full object-cover" 
                            alt={item.product.title}
                          />
                        </div>
                        <div className="flex-1">
                          <p className="font-black text-genz-ink leading-tight mb-2">{item.product.title}</p>
                          <div className="flex items-center gap-2 flex-wrap">
                            {item.productsize && (
                              <span className="text-xs font-bold bg-genz-bg text-genz-muted border-2 border-genz-border px-2.5 py-1 rounded uppercase">
                                Size: {item.productsize.size}
                              </span>
                            )}
                            <span className="text-xs font-bold bg-genz-bg text-genz-muted border-2 border-genz-border px-2.5 py-1 rounded uppercase">
                              Qty: {item.quantity}
                            </span>
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-bold text-genz-ink">
                                ₹{unitPrice.toLocaleString()} each
                              </span>
                              {hasDiscount && (
                                <span className="text-xs font-medium text-genz-muted line-through">
                                  ₹{mrp.toLocaleString()}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-black text-lg text-genz-ink whitespace-nowrap">
                          ₹{(unitPrice * item.quantity).toLocaleString()}
                        </p>
                        {hasDiscount && (
                          <p className="text-xs font-medium text-green-600">
                            Save ₹{((mrp - unitPrice) * item.quantity).toLocaleString()}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* RIGHT: PRICE SUMMARY & CTA */}
          <div className="space-y-4 lg:sticky lg:top-24">
            
            {/* ✅ NEW: Wallet Section (only for online payment) */}
            {paymentMethod === "ONLINE" && (
              <div className="bg-gradient-to-br from-purple-50 to-blue-50 p-6 rounded-genz border-2 border-purple-200 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <HiOutlineWallet size={20} className="text-purple-600" />
                  <h3 className="text-xs font-black text-purple-900 uppercase tracking-widest">
                    Use Wallet Balance
                  </h3>
                </div>

                {walletLoading ? (
                  <div className="flex items-center gap-2 text-sm text-purple-600">
                    <div className="w-4 h-4 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
                    Loading wallet...
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-purple-700">Available Balance</span>
                      <span className="text-xl font-black text-purple-900">₹{walletBalance.toLocaleString()}</span>
                    </div>

                    {walletBalance > 0 ? (
                      <>
                        <label className="flex items-center gap-3 p-3 bg-white border-2 border-purple-200 rounded-xl cursor-pointer hover:border-purple-400 transition-colors">
                          <input
                            type="checkbox"
                            checked={useWallet}
                            onChange={(e) => setUseWallet(e.target.checked)}
                            className="w-5 h-5 accent-purple-600 cursor-pointer"
                          />
                          <div className="flex-1">
                            <p className="text-sm font-black text-purple-900">
                              Use ₹{Math.min(walletBalance, finalTotal).toLocaleString()} from wallet
                            </p>
                            <p className="text-xs font-medium text-purple-600">
                              {walletBalance >= finalTotal 
                                ? "Pay entire amount from wallet" 
                                : `Save ₹${Math.min(walletBalance, finalTotal).toLocaleString()} on this order`}
                            </p>
                          </div>
                        </label>

                        {useWallet && (
                          <div className="bg-purple-100 border-2 border-purple-300 rounded-xl p-3 space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="font-bold text-purple-700">Wallet Deduction</span>
                              <span className="font-black text-purple-900">-₹{walletUsable.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="font-bold text-purple-700">
                                {walletBalance >= finalTotal ? "Balance After" : "Pay via Gateway"}
                              </span>
                              <span className="font-black text-purple-900">
                                {walletBalance >= finalTotal 
                                  ? `₹${(walletBalance - finalTotal).toLocaleString()}` 
                                  : `₹${remainingPayable.toLocaleString()}`}
                              </span>
                            </div>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="text-center py-3">
                        <p className="text-sm font-bold text-purple-600">No wallet balance available</p>
                        <button
                          onClick={() => router.push("/profile/wallet")}
                          className="text-xs font-bold text-purple-700 underline mt-1 hover:text-purple-900"
                        >
                          Add money to wallet
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Coupon Section */}
            <div className="bg-genz-card p-6 rounded-genz border-2 border-genz-border shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <HiOutlineTicket size={20} className="text-genz-accent" />
                <h3 className="text-xs font-black text-genz-ink uppercase tracking-widest">
                  Apply Coupon
                </h3>
              </div>

              {appliedCoupon ? (
                <div className="flex items-center justify-between p-3 bg-green-50 border-2 border-green-200 rounded-xl">
                  <div className="flex items-center gap-2">
                    <HiCheckCircle className="text-green-600" size={20} />
                    <div>
                      <p className="font-black text-sm text-green-800">{appliedCoupon}</p>
                      <p className="text-xs font-bold text-green-600">-₹{discount.toLocaleString()} saved</p>
                    </div>
                  </div>
                  <button
                    onClick={removeCoupon}
                    className="text-xs font-bold text-red-600 hover:text-red-700 underline"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Enter coupon code"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      className="flex-1 border-2 border-genz-border rounded-xl px-4 py-3 text-sm font-bold focus:border-genz-accent outline-none transition-colors uppercase"
                    />
                    <button
                      onClick={applyCoupon}
                      className="bg-genz-ink text-white px-6 py-3 rounded-xl font-bold hover:bg-black transition-colors text-sm whitespace-nowrap"
                    >
                      Apply
                    </button>
                  </div>
                  {couponError && (
                    <p className="text-xs font-bold text-red-600 flex items-center gap-1">
                      <span className="w-1 h-1 bg-red-600 rounded-full" />
                      {couponError}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Price Summary */}
            <div className="bg-genz-card p-6 rounded-genz border-2 border-genz-border shadow-sm">
              <h3 className="text-xs font-black text-genz-muted uppercase tracking-widest mb-6">
                Order Summary
              </h3>

              <div className="space-y-4">
                <div className="flex justify-between text-sm font-bold text-genz-ink">
                  <span>Price ({cartItems.length} items)</span>
                  <span>₹{mrpTotal.toLocaleString()}</span>
                </div>

                {productDiscount > 0 && (
                  <div className="flex justify-between text-sm font-bold text-green-600">
                    <span>Product Discount</span>
                    <span>-₹{productDiscount.toLocaleString()}</span>
                  </div>
                )}
                
                <div className="flex justify-between text-sm font-bold text-genz-ink">
                  <span>Delivery Fee</span>
                  {shippingLoading ? (
                    <span className="text-genz-muted">Calculating...</span>
                  ) : shippingFee > 0 ? (
                    <span>₹{shippingFee.toLocaleString()}</span>
                  ) : (
                    <span className="text-green-600">FREE</span>
                  )}
                </div>

                {discount > 0 && (
                  <div className="flex justify-between text-sm font-bold text-green-600">
                    <span>Coupon Discount</span>
                    <span>-₹{discount.toLocaleString()}</span>
                  </div>
                )}

                {/* ✅ NEW: Wallet deduction line */}
                {useWallet && walletUsable > 0 && (
                  <div className="flex justify-between text-sm font-bold text-purple-600">
                    <span>Wallet Deduction</span>
                    <span>-₹{walletUsable.toLocaleString()}</span>
                  </div>
                )}
                
                <div className="pt-4 border-t-2 border-genz-border">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-bold text-genz-muted">Order Total</span>
                    <span className="text-lg font-black text-genz-ink">
                      ₹{finalTotal.toLocaleString()}
                    </span>
                  </div>

                  {/* ✅ NEW: Show remaining payable if using wallet */}
                  {useWallet && walletUsable > 0 && (
                    <div className="flex justify-between items-center pt-2 border-t-2 border-purple-200">
                      <span className="text-base font-black text-purple-900">
                        {remainingPayable === 0 ? "Paid from Wallet" : "Pay Now"}
                      </span>
                      <span className="text-2xl font-black text-purple-900">
                        ₹{remainingPayable.toLocaleString()}
                      </span>
                    </div>
                  )}

                  {!useWallet && (
                    <div className="flex justify-between items-center pt-2 border-t-2 border-genz-border">
                      <span className="text-base font-black text-genz-ink">Total Amount</span>
                      <span className="text-2xl font-black text-genz-ink">
                        ₹{finalTotal.toLocaleString()}
                      </span>
                    </div>
                  )}

                  {(productDiscount + discount + walletUsable) > 0 && (
                    <p className="text-xs font-bold text-green-600 mt-2 text-right">
                      You saved ₹{(productDiscount + discount + (useWallet ? walletUsable : 0)).toLocaleString()}!
                    </p>
                  )}
                </div>
              </div>

              {error && (
                <div className="mt-6 p-3 bg-red-50 border-2 border-red-200 rounded-xl flex items-center gap-2 text-red-600 text-xs font-bold">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse" />
                  {error}
                </div>
              )}

              {shippingError && (
                <div className="mt-4 p-3 bg-red-50 border-2 border-red-200 rounded-xl text-xs font-bold text-red-600">
                  {shippingError}
                </div>
              )}

              <div className="mt-6 space-y-3">
                <button
                  onClick={placeOrder}
                  disabled={loading || shippingLoading || !!shippingError}
                  className="w-full bg-genz-accent hover:brightness-110 text-white py-5 rounded-genz font-black text-lg shadow-lg shadow-genz-accent/20 transition-all active:scale-[0.98] disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed flex items-center justify-center gap-2 group"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      {useWallet && remainingPayable === 0 ? "Place Order (Wallet)" : "Place Order"}
                      <HiOutlineChevronRight className="group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>

                <button
                  onClick={() => router.back()}
                  disabled={loading}
                  className="w-full border-2 border-genz-border hover:bg-genz-bg text-genz-ink py-4 rounded-genz font-bold transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <HiArrowLeft size={20} />
                  Back to Payment
                </button>
              </div>
              
              <p className="text-[10px] text-center text-genz-muted mt-4 font-bold uppercase tracking-tight leading-relaxed">
                By placing your order, you agree to our<br/>
                <span className="text-genz-ink underline cursor-pointer hover:text-genz-accent transition-colors">
                  Terms & Conditions
                </span>
              </p>
            </div>

            {/* Security Badge */}
            <div className="flex items-center gap-3 px-4 py-3 bg-green-50 border-2 border-green-100 rounded-xl">
              <HiOutlineShieldCheck size={20} className="text-green-600 shrink-0" />
              <p className="text-[10px] font-bold text-green-700 uppercase tracking-tight">
                Secure Checkout • 256-Bit SSL Encrypted
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
