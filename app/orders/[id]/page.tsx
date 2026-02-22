"use client";

import { api } from "@/lib/api";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import OrderTracking from "@/components/OrderTracking";
import ReviewModal from "@/components/reviews/reviews";
import { 
  HiOutlineArrowLeft, 
  HiOutlineMapPin, 
  HiOutlineCreditCard, 
  HiOutlineShoppingBag, 
  HiOutlineXMark,
  HiOutlineArrowPath,
  HiOutlineReceiptPercent,
  HiOutlineTruck,
  HiOutlineTag,
} from "react-icons/hi2";

/* ---------- STATUS HELPER ---------- */
function getOrderStatusClass(status?: string) {
  switch (status) {
    case "PENDING":   return "bg-amber-50 text-amber-600 border-amber-100";
    case "ACCEPTED":  return "bg-blue-50 text-blue-600 border-blue-100";
    case "PACKED":    return "bg-indigo-50 text-indigo-600 border-indigo-100";
    case "SHIPPED":   return "bg-teal-50 text-teal-600 border-teal-100";
    case "DELIVERED": return "bg-emerald-50 text-emerald-600 border-emerald-100";
    case "CANCELLED": return "bg-rose-50 text-rose-600 border-rose-100";
    case "RETURNED":  return "bg-orange-50 text-orange-600 border-orange-100";
    default:          return "bg-gray-50 text-gray-600 border-gray-100";
  }
}

export default function OrderDetailsPage() {
  const { id } = useParams();
  const router = useRouter();

  const [order, setOrder]           = useState<any>(null);
  const [loading, setLoading]       = useState(true);
  const [reviewProduct, setReviewProduct] = useState<any>(null);
  const [items, setItems]           = useState<any[]>([]);

  const fetchOrder = async () => {
    try {
      const res = await api.get(`/orders/my/${id}`);
      setOrder(res.data);
      setItems(res.data.orderitem ?? []);
    } catch {
      setOrder(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchOrder();
  }, [id]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-amazon-orange border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!order) return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
      <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-4">
        <HiOutlineXMark size={32} />
      </div>
      <h2 className="text-xl font-black text-amazon-text">Order not found</h2>
      <button onClick={() => router.push('/orders')} className="mt-4 text-amazon-orange font-bold">
        Back to My Orders
      </button>
    </div>
  );

  /* ── Payment helpers ── */
  const paymentMethod      = order?.paymentMethod ?? (order?.isCOD ? "COD" : "ONLINE");
  const isCOD              = paymentMethod === "COD";
  const paymentMethodLabel = isCOD ? "Cash on Delivery" : "Online Payment";
  const paymentStatusLabel = isCOD
    ? order.status === "DELIVERED" ? "Paid on Delivery" : "Payment Pending"
    : "Payment Confirmed";

  /* ── Price breakdown ── */
  const totalAmount    = Number(order.totalAmount ?? 0);
  const couponDiscount = Number(order.couponDiscount ?? 0);
  const couponCode     = order.couponCode ?? null;

  // Sum shippingCharge from sellerOrders (included via backend)
  const shippingCharge = order.sellerOrders?.reduce(
    (s: number, so: any) => s + Number(so.shippingCharge ?? 0), 0
  ) ?? 0;

  // Product subtotal = what user paid for items only
  const productSubtotal = totalAmount + couponDiscount - shippingCharge;

  // MRP total from items
  const mrpTotal = items.reduce(
    (sum: number, i: any) => sum + Number(i.originalPrice ?? i.unitPrice) * i.quantity, 0
  );
  const productDiscount = mrpTotal - productSubtotal;

  /* ── Address snapshot (matches your backend shape) ── */
  const addr = order.address ?? {};

  return (
  <div className="bg-genz-bg min-h-screen py-10">
    <div className="max-w-4xl mx-auto px-4 space-y-8">

      {/* BACK BUTTON */}
      <button
        onClick={() => router.back()}
        className="group flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-genz-muted hover:text-genz-ink transition-all"
      >
        <HiOutlineArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> 
        Back to Orders
      </button>

      {/* HERO HEADER */}
      <div className="bg-white rounded-[2rem] border border-genz-border p-8 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-end gap-6 relative overflow-hidden">
        {/* Subtle background decoration */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-genz-accent/5 rounded-full -mr-16 -mt-16 blur-3xl" />
        
        <div className="relative z-10">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-3xl font-black text-genz-ink tracking-tighter">#SB-{order.id}</h1>
            <span className={`px-4 py-1.5 rounded-full text-[10px] font-black border uppercase tracking-[0.15em] ${getOrderStatusClass(order.status)}`}>
              {order.status}
            </span>
          </div>
          <p className="text-[11px] font-bold text-genz-muted mt-2 uppercase tracking-widest flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-genz-border" />
            Placed {new Date(order.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
          </p>
        </div>

        <div className="md:text-right relative z-10">
          <p className="text-[10px] font-black text-genz-muted uppercase tracking-[0.2em] mb-1">Grand Total</p>
          <p className="text-4xl font-black text-genz-ink tracking-tighter">
            ₹{totalAmount.toLocaleString('en-IN')}
          </p>
          {(productDiscount + couponDiscount) > 0 && (
            <div className="inline-flex items-center gap-1.5 bg-green-50 text-green-600 px-3 py-1 rounded-full mt-2 border border-green-100">
              <HiOutlineTag size={12} />
              <span className="text-[10px] font-black uppercase tracking-tight">
                Saved ₹{(productDiscount + couponDiscount).toLocaleString('en-IN')}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* PROGRESS TRACKING */}
      <div className="bg-white rounded-[2rem] border border-genz-border p-8 shadow-sm">
        <OrderTracking status={order.status} />
      </div>

      {/* TWO-COLUMN INFO GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* SHIPPING */}
        <div className="bg-white rounded-[2rem] border border-genz-border p-8 shadow-sm">
          <h2 className="text-[11px] font-black text-genz-muted uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
            <HiOutlineMapPin size={18} className="text-genz-accent" /> Shipping
          </h2>
          <div className="space-y-1">
            <p className="text-sm font-black text-genz-ink">{addr.fullName}</p>
            <p className="text-xs font-bold text-genz-muted leading-relaxed">
              {addr.addressLine1}{addr.addressLine2 ? `, ${addr.addressLine2}` : ""}<br />
              {addr.landmark && <span className="italic">{addr.landmark}<br /></span>}
              {addr.city}, {addr.state} — {addr.pincode}
            </p>
            <div className="pt-4">
              <span className="bg-genz-bg px-3 py-1.5 rounded-lg text-[11px] font-bold text-genz-ink border border-genz-border">
                📞 {addr.phone}
              </span>
            </div>
          </div>
        </div>

        {/* PAYMENT */}
        <div className="bg-white rounded-[2rem] border border-genz-border p-8 shadow-sm">
          <h2 className="text-[11px] font-black text-genz-muted uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
            <HiOutlineCreditCard size={18} className="text-genz-accent" /> Payment
          </h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-[11px] font-bold text-genz-muted uppercase tracking-widest">Method</span>
              <span className="text-xs font-black text-genz-ink bg-genz-bg px-3 py-1 rounded-lg border border-genz-border italic">
                {paymentMethodLabel}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[11px] font-bold text-genz-muted uppercase tracking-widest">Status</span>
              <span className={`text-[11px] font-black uppercase tracking-tighter ${
                isCOD && order.status !== "DELIVERED" ? "text-amber-500" : "text-green-500"
              }`}>
                {paymentStatusLabel}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ITEMS LIST */}
      <div className="bg-white rounded-[2rem] border border-genz-border shadow-sm overflow-hidden">
        <div className="px-8 py-5 border-b border-genz-border bg-genz-bg/50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <HiOutlineShoppingBag className="text-genz-muted" />
            <h2 className="text-[11px] font-black text-genz-muted uppercase tracking-[0.2em]">Package Contents</h2>
          </div>
          <span className="text-[10px] font-black text-genz-muted opacity-50 uppercase tracking-widest">
            {items.length} {items.length === 1 ? 'Item' : 'Items'}
          </span>
        </div>
        
        <div className="divide-y divide-genz-border/50">
          {items.map((item: any) => {
            const unitPrice = Number(item.unitPrice);
            const originalPrice = Number(item.originalPrice ?? item.unitPrice);
            return (
              <div key={item.id} className="p-8 flex flex-col sm:flex-row gap-8 items-start sm:items-center">
                <div className="relative group">
                  <img
                    src={`${process.env.NEXT_PUBLIC_API_URL}/uploads/products/${item.product.img1}`}
                    alt={item.product.title}
                    className="w-24 h-28 rounded-2xl object-cover bg-genz-bg border border-genz-border transition-transform group-hover:scale-105"
                  />
                  <span className="absolute -top-2 -right-2 bg-genz-ink text-white w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black border-2 border-white">
                    {item.quantity}
                  </span>
                </div>
                
                <div className="flex-1 space-y-2">
                  <h3 className="text-base font-black text-genz-ink tracking-tight leading-tight">
                    {item.product.title}
                  </h3>
                  
                  <div className="flex flex-wrap gap-2">
                    {item.productsize?.size && (
                      <span className="text-[10px] font-black bg-white border border-genz-border text-genz-muted px-2 py-0.5 rounded-md">
                        SIZE: {item.productsize.size}
                      </span>
                    )}
                    {item.productsize?.color && (
                      <span className="text-[10px] font-black bg-white border border-genz-border text-genz-muted px-2 py-0.5 rounded-md">
                        COLOR: {item.productsize.color}
                      </span>
                    )}
                  </div>

                  {order.status === "DELIVERED" && (
                    <button
                      onClick={() => setReviewProduct({ product: item.product, orderId: order.id })}
                      className="text-[10px] font-black text-genz-accent uppercase tracking-widest hover:translate-x-1 transition-transform flex items-center gap-1 pt-2"
                    >
                      Write Review <HiOutlineArrowLeft size={10} className="rotate-180" />
                    </button>
                  )}
                </div>

                <div className="text-right w-full sm:w-auto self-end sm:self-center">
                  <p className="text-xl font-black text-genz-ink tracking-tight">
                    ₹{(unitPrice * item.quantity).toLocaleString('en-IN')}
                  </p>
                  {originalPrice > unitPrice && (
                    <p className="text-[11px] text-genz-muted line-through font-bold">
                      ₹{(originalPrice * item.quantity).toLocaleString('en-IN')}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* PRICE BREAKDOWN (BENTO STYLE) */}
      <div className="bg-genz-ink text-white rounded-[2rem] p-8 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32 blur-3xl pointer-events-none" />
        
        <h2 className="text-[11px] font-black text-white/40 uppercase tracking-[0.3em] mb-8 relative z-10">
          Financial Summary
        </h2>
        
        <div className="space-y-5 relative z-10">
          <div className="flex justify-between items-center border-b border-white/10 pb-4">
            <span className="text-[11px] font-bold text-white/60 uppercase tracking-widest">Subtotal</span>
            <span className="font-bold tracking-tight">₹{mrpTotal.toLocaleString('en-IN')}</span>
          </div>

          <div className="flex justify-between items-center border-b border-white/10 pb-4">
            <span className="text-[11px] font-bold text-white/60 uppercase tracking-widest">Shipping</span>
            <span className={shippingCharge > 0 ? "font-bold" : "text-green-400 font-black tracking-[0.1em] text-[10px]"}>
              {shippingCharge > 0 ? `₹${shippingCharge.toLocaleString('en-IN')}` : "COMPLIMENTARY"}
            </span>
          </div>

          {(productDiscount + couponDiscount) > 0 && (
            <div className="flex justify-between items-center border-b border-white/10 pb-4">
              <span className="text-[11px] font-bold text-white/60 uppercase tracking-widest">Total Savings</span>
              <span className="text-green-400 font-black tracking-tight">-₹{(productDiscount + couponDiscount).toLocaleString('en-IN')}</span>
            </div>
          )}

          <div className="flex justify-between items-end pt-4">
            <div>
              <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] mb-1">Final Amount</p>
              <p className="text-4xl font-black tracking-tighter">₹{totalAmount.toLocaleString('en-IN')}</p>
            </div>
            <div className="bg-white/10 p-3 rounded-2xl border border-white/10">
              <HiOutlineReceiptPercent size={24} className="text-genz-accent" />
            </div>
          </div>
        </div>
      </div>

      {/* ACTION BUTTONS */}
      <div className="flex flex-col sm:flex-row gap-4 pt-4">
        {order.status === "PENDING" && (
          <button
            onClick={async () => {
              if (!confirm("Are you sure?")) return;
              await api.put(`/orders/${order.id}/cancel`);
              fetchOrder();
            }}
            className="flex-1 px-8 py-5 bg-white border border-red-100 text-red-500 rounded-2xl font-black uppercase text-[11px] tracking-widest hover:bg-red-50 transition-all flex items-center justify-center gap-2"
          >
            <HiOutlineXMark size={18} /> Cancel Order
          </button>
        )}

        {["DELIVERED", "CANCELLED"].includes(order.status) && (
          <button
            onClick={async () => {
              await api.post(`/orders/${order.id}/reorder`);
              router.push("/cart");
            }}
            className="flex-1 px-8 py-5 bg-genz-ink text-white rounded-[1.5rem] font-black uppercase text-[11px] tracking-[0.2em] hover:opacity-90 transition-all shadow-2xl active:scale-[0.98] flex items-center justify-center gap-3"
          >
            <HiOutlineArrowPath size={18} className="text-genz-accent" /> Re-Order Items
          </button>
        )}
      </div>

    </div>
  </div>
);
}
