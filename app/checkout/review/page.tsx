"use client";

import { useRouter } from "next/navigation";
import { useCheckout } from "@/app/context/CheckoutContext";
import { api } from "@/lib/api";
import { useEffect, useState } from "react";
import { 
  HiOutlineChevronRight, 
  HiCheckCircle, 
  HiOutlineTruck, 
  HiOutlineCreditCard, 
  HiOutlineShieldCheck 
} from "react-icons/hi2";

export default function CheckoutReviewPage() {
  const router = useRouter();
  const { address, paymentMethod } = useCheckout();

  const [cartItems, setCartItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!address) router.push("/checkout/address");
    if (!paymentMethod) router.push("/checkout/payment");
  }, [address, paymentMethod, router]);

  useEffect(() => {
    api.get("/cart").then((res) => {
      setCartItems(res.data.items || []);
    });
  }, []);

  const totalAmount = cartItems.reduce((sum, item) => {
    const unitPrice = item.size?.price ?? item.product.price;
    return sum + unitPrice * item.quantity;
  }, 0);

  const loadRazorpay = () =>
    new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });

  const placeOrder = async () => {
    try {
      setLoading(true);
      setError("");

      if (paymentMethod === "COD") {
        const res = await api.post("/orders", { address });
        router.push(`/checkout/success?orderId=${res.data.orderId}&type=COD`);
        return;
      }

      const loaded = await loadRazorpay();
      if (!loaded) {
        setError("Failed to load payment gateway. Please check your connection.");
        return;
      }

      const orderRes = await api.post("/orders", { address });
      const orderId = orderRes.data.orderId;

      const rpRes = await api.post("/payments/razorpay/create-order", { orderId });

      const options = {
        key: rpRes.data.key,
        amount: rpRes.data.amount * 100,
        currency: "INR",
        name: "ShopyBucks",
        description: `Order #${orderId}`,
        order_id: rpRes.data.razorpayOrderId,
        handler: async (response: any) => {
          const verifyRes = await api.post("/payments/razorpay/verify", response);
          if (verifyRes.data?.success) {
            router.replace(`/checkout/success?orderId=${orderId}&type=${paymentMethod}`);
          } else {
            setError("Payment verification failed. Please contact support.");
          }
        },
        theme: { color: "#FF9900" }, // Matches amazon-orange from your config
      };

      new (window as any).Razorpay(options).open();
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to place order. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!address || !paymentMethod) return null;

  return (
    <div className="bg-amazon-lightGray min-h-screen py-10 px-4 md:px-6">
      <div className="max-w-5xl mx-auto">
        
        {/* --- PROGRESS STEPPER --- */}
        <div className="flex items-center justify-center gap-4 mb-10 overflow-x-auto no-scrollbar py-2">
          <div className="flex items-center gap-2 shrink-0">
            <span className="w-8 h-8 rounded-full bg-amazon-success text-white flex items-center justify-center text-sm font-black"><HiCheckCircle size={20}/></span>
            <span className="font-bold text-amazon-success text-sm uppercase tracking-tight">Address</span>
          </div>
          <HiOutlineChevronRight className="text-gray-400 shrink-0" />
          <div className="flex items-center gap-2 shrink-0">
            <span className="w-8 h-8 rounded-full bg-amazon-success text-white flex items-center justify-center text-sm font-black"><HiCheckCircle size={20}/></span>
            <span className="font-bold text-amazon-success text-sm uppercase tracking-tight">Payment</span>
          </div>
          <HiOutlineChevronRight className="text-gray-400 shrink-0" />
          <div className="flex items-center gap-2 shrink-0">
            <span className="w-8 h-8 rounded-full bg-amazon-orange text-amazon-darkBlue flex items-center justify-center text-sm font-black shadow-sm">3</span>
            <span className="font-black text-amazon-text text-sm uppercase tracking-tight">Review</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* LEFT: ORDER PREVIEW */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* ADDRESS & PAYMENT SUMMARY */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white p-6 rounded-3xl border border-amazon-borderGray shadow-sm">
                <div className="flex items-center gap-2 mb-4 text-amazon-mutedText">
                  <HiOutlineTruck size={18} />
                  <h2 className="text-[11px] font-black uppercase tracking-widest">Shipping To</h2>
                </div>
                <div className="space-y-1 text-sm font-medium text-amazon-text">
                  <p className="font-black text-base">{address.name}</p>
                  <p>{address.street}</p>
                  <p>{address.city}, {address.state} - {address.pincode}</p>
                  <p className="pt-2 text-xs text-amazon-mutedText tracking-tighter">Phone: {address.phone}</p>
                </div>
              </div>

              <div className="bg-white p-6 rounded-3xl border border-amazon-borderGray shadow-sm">
                <div className="flex items-center gap-2 mb-4 text-amazon-mutedText">
                  <HiOutlineCreditCard size={18} />
                  <h2 className="text-[11px] font-black uppercase tracking-widest">Paying With</h2>
                </div>
                <div className="space-y-1">
                  <p className="font-black text-base text-amazon-text">
                    {paymentMethod === "COD" ? "Cash on Delivery" : "Online Payment"}
                  </p>
                  <p className="text-xs font-bold text-amazon-success bg-green-50 px-2 py-1 rounded-lg inline-block uppercase tracking-tight">
                    {paymentMethod === "COD" ? "Pay at Doorstep" : "Secure Online Transaction"}
                  </p>
                </div>
              </div>
            </div>

            {/* ITEMS LIST */}
            <div className="bg-white rounded-3xl border border-amazon-borderGray shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                <h2 className="text-xs font-black text-amazon-mutedText uppercase tracking-widest">Items In Order</h2>
                <span className="text-[11px] font-bold bg-gray-100 px-2 py-0.5 rounded-full">{cartItems.length} Products</span>
              </div>
              
              <div className="divide-y divide-gray-50">
                {cartItems.map((item) => {
                  const unitPrice = item.size?.price ?? item.product.price;
                  return (
                    <div key={item.id} className="p-6 flex justify-between items-center gap-4">
                      <div className="flex gap-4 items-center">
                         <div className="w-16 h-20 bg-amazon-lightGray rounded-xl overflow-hidden shrink-0 border border-gray-100">
                            <img 
                                src={`${process.env.NEXT_PUBLIC_API_URL}/uploads/products/${item.product.img1}`} 
                                className="w-full h-full object-cover" 
                                alt={item.product.title}
                            />
                         </div>
                         <div>
                            <p className="font-black text-amazon-text text-sm leading-tight mb-1">{item.product.title}</p>
                            <div className="flex items-center gap-2">
                                {item.size && <span className="text-[10px] font-bold bg-gray-50 text-amazon-mutedText border px-2 py-0.5 rounded uppercase">Size: {item.size.size}</span>}
                                <span className="text-[10px] font-bold bg-gray-50 text-amazon-mutedText border px-2 py-0.5 rounded uppercase">Qty: {item.quantity}</span>
                            </div>
                         </div>
                      </div>
                      <p className="font-black text-amazon-text whitespace-nowrap">
                        ₹{(unitPrice * item.quantity).toLocaleString()}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* RIGHT: ORDER TOTAL & CTA */}
          <div className="space-y-4 sticky top-24">
            <div className="bg-white p-8 rounded-3xl border border-amazon-borderGray shadow-sm">
              <h3 className="text-xs font-black text-amazon-mutedText uppercase tracking-widest mb-6">
                Price Summary
              </h3>

              <div className="space-y-4">
                <div className="flex justify-between text-sm font-medium text-amazon-mutedText">
                  <span>Subtotal</span>
                  <span>₹{totalAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm font-medium text-amazon-mutedText">
                  <span>Delivery</span>
                  <span className="text-amazon-success">FREE</span>
                </div>
                
                <div className="pt-4 border-t border-gray-100">
                  <div className="flex justify-between items-end">
                    <span className="text-base font-black text-amazon-text">Total Amount</span>
                    <span className="text-2xl font-black text-amazon-text tracking-tighter">
                        ₹{totalAmount.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {error && (
                <div className="mt-6 p-3 bg-red-50 border border-red-100 rounded-xl flex items-center gap-2 text-red-600 text-[11px] font-bold animate-in fade-in">
                  <div className="w-1 h-1 rounded-full bg-red-600" />
                  {error}
                </div>
              )}

              <button
                onClick={placeOrder}
                disabled={loading}
                className="w-full mt-8 bg-amazon-orange hover:bg-amazon-orangeHover text-amazon-darkBlue py-4 rounded-2xl font-black shadow-md shadow-orange-200 transition-all active:scale-95 disabled:opacity-50 disabled:grayscale flex items-center justify-center gap-2 group"
              >
                {loading ? (
                    <div className="w-5 h-5 border-2 border-amazon-darkBlue border-t-transparent rounded-full animate-spin" />
                ) : (
                    <>Place Your Order <HiOutlineChevronRight className="group-hover:translate-x-1 transition-transform" /></>
                )}
              </button>
              
              <p className="text-[10px] text-center text-amazon-mutedText mt-4 font-bold uppercase tracking-tight leading-relaxed">
                By placing your order, you agree to our <br/> 
                <span className="text-amazon-darkBlue underline cursor-pointer">Conditions of Use</span>
              </p>
            </div>

            <div className="flex items-center gap-3 px-4 py-3 bg-white/50 border border-amazon-borderGray rounded-xl text-[11px] font-bold text-amazon-mutedText uppercase">
              <HiOutlineShieldCheck size={18} className="text-amazon-success" />
              Secure Checkout • 256-Bit SSL Encryption
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}