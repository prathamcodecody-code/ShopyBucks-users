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
  HiOutlineArrowPath
} from "react-icons/hi2";

/* ---------- STATUS HELPER ---------- */
function getOrderStatusClass(status?: string) {
  switch (status) {
    case "PENDING": return "bg-amber-50 text-amber-600 border-amber-100";
    case "ACCEPTED": return "bg-blue-50 text-blue-600 border-blue-100";
    case "PACKED": return "bg-indigo-50 text-indigo-600 border-indigo-100";
    case "SHIPPED": return "bg-teal-50 text-teal-600 border-teal-100";
    case "DELIVERED": return "bg-emerald-50 text-emerald-600 border-emerald-100";
    case "CANCELLED": return "bg-rose-50 text-rose-600 border-rose-100";
    case "RETURNED": return "bg-orange-50 text-orange-600 border-orange-100";
    default: return "bg-gray-50 text-gray-600 border-gray-100";
  }
}

export default function OrderDetailsPage() {
  const { id } = useParams();
  const router = useRouter();

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [reviewProduct, setReviewProduct] = useState<any>(null);
  const [items, setItems] = useState<any[]>([]);

  const paymentMethod =
  order?.paymentMethod ||
  order?.payment?.method ||
  (order?.isCOD ? "COD" : "ONLINE");

const isCOD = paymentMethod === "COD";

const paymentMethodLabel = isCOD
  ? "Cash on Delivery"
  : "Online Payment";

const paymentStatusLabel = isCOD
  ? order.status === "DELIVERED"
    ? "Paid on Delivery"
    : "Payment Pending"
  : "Payment Confirmed";


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
      <button onClick={() => router.push('/orders')} className="mt-4 text-amazon-orange font-bold">Back to My Orders</button>
    </div>
  );

  const totalAmount = items.reduce((sum: number, i: any) => sum + Number(i.price) * i.quantity, 0);

  return (
    <div className="bg-amazon-lightGray min-h-screen py-10">
      <div className="max-w-5xl mx-auto px-4 space-y-6">
        
        {/* BACK BUTTON */}
        <button onClick={() => router.back()} className="flex items-center gap-2 text-sm font-bold text-amazon-mutedText hover:text-amazon-text transition-colors">
          <HiOutlineArrowLeft size={18} /> Back to Orders
        </button>

        {/* HEADER CARD */}
        <div className="bg-white rounded-3xl border border-amazon-borderGray p-8 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-black text-amazon-text tracking-tight">Order #SB-{order.id}</h1>
              <span className={`px-3 py-1 rounded-lg text-[10px] font-black border uppercase tracking-wider ${getOrderStatusClass(order.status)}`}>
                {order.status}
              </span>
            </div>
            <p className="text-xs font-bold text-amazon-mutedText mt-1 flex items-center gap-1.5 uppercase">
              Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-black text-amazon-mutedText uppercase tracking-widest">Grand Total</p>
            <p className="text-3xl font-black text-amazon-text">₹{totalAmount.toLocaleString()}</p>
          </div>
        </div>

        {/* TRACKING SECTION */}
        <div className="bg-white rounded-3xl border border-amazon-borderGray p-8 shadow-sm">
          <OrderTracking status={order.status} />
        </div>

        {/* INFO GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* PAYMENT */}
          <div className="bg-white rounded-3xl border border-amazon-borderGray p-8 shadow-sm">
            <h2 className="text-xs font-black text-amazon-mutedText uppercase tracking-widest mb-4 flex items-center gap-2">
              <HiOutlineCreditCard size={18} /> Payment Information
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm font-medium text-amazon-mutedText">Method</span>
                <span className="text-sm font-bold text-amazon-text">{paymentMethodLabel}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium text-amazon-mutedText">Status</span>
                 <span
      className={`font-semibold ${
        isCOD
          ? order.status === "DELIVERED"
            ? "text-green-600"
            : "text-yellow-600"
          : "text-green-600"
      }`}
    >
      {paymentStatusLabel}
    </span>
              </div>
            </div>
          </div>

          {/* ADDRESS */}
          <div className="bg-white rounded-3xl border border-amazon-borderGray p-8 shadow-sm">
            <h2 className="text-xs font-black text-amazon-mutedText uppercase tracking-widest mb-4 flex items-center gap-2">
              <HiOutlineMapPin size={18} /> Shipping Address
            </h2>
            <div className="text-sm space-y-1 font-medium text-amazon-text">
              <p className="font-black">{order.address?.name}</p>
              <p className="text-amazon-mutedText">{order.address?.street}</p>
              <p className="text-amazon-mutedText">{order.address?.city}, {order.address?.state} - {order.address?.pincode}</p>
              <p className="pt-2 text-xs font-bold text-amazon-darkBlue">📞 {order.address?.phone}</p>
            </div>
          </div>
        </div>

        {/* ITEMS CARD */}
        <div className="bg-white rounded-3xl border border-amazon-borderGray shadow-sm overflow-hidden">
          <div className="px-8 py-4 border-b bg-gray-50 flex items-center gap-2">
            <HiOutlineShoppingBag className="text-amazon-mutedText" />
            <h2 className="text-xs font-black text-amazon-mutedText uppercase tracking-widest">Order Items</h2>
          </div>
          <div className="divide-y divide-gray-100">
            {items.map((item: any) => (
              <div key={item.id} className="p-8 flex flex-col sm:flex-row gap-6 items-start sm:items-center justify-between">
                <div className="flex gap-4">
                  <img
                    src={`${process.env.NEXT_PUBLIC_API_URL}/uploads/products/${item.product.img1}`}
                    alt={item.product.title}
                    className="w-20 h-24 rounded-xl object-cover bg-amazon-lightGray border border-gray-100"
                  />
                  <div className="space-y-1">
                    <p className="font-bold text-amazon-text leading-tight">{item.product.title}</p>
                    {item.size && (
                      <p className="text-xs font-bold text-amazon-mutedText">Size: <span className="text-amazon-darkBlue">{item.size.size}</span></p>
                    )}
                    <p className="text-xs font-medium text-gray-400 italic">Qty {item.quantity} × ₹{item.price}</p>
                    
                    {order.status === "DELIVERED" && (
                      <button
                        onClick={() => setReviewProduct({ product: item.product, orderId: order.id })}
                        className="text-xs font-black text-amazon-orange uppercase hover:underline pt-2 block"
                      >
                        Write a Review
                      </button>
                    )}
                  </div>
                </div>
                <div className="text-right w-full sm:w-auto">
                  <p className="text-lg font-black text-amazon-text">₹{(item.quantity * item.price).toLocaleString()}</p>
                  {item.originalPrice && item.originalPrice > item.price && (
                    <p className="text-xs text-amazon-mutedText line-through">₹{(item.originalPrice * item.quantity).toLocaleString()}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* BOTTOM ACTIONS */}
        <div className="flex flex-col sm:flex-row gap-4 pt-4">
          {order.status === "PENDING" && (
            <button
              onClick={async () => {
                if (!confirm("Are you sure you want to cancel this order?")) return;
                await api.put(`/orders/${order.id}/cancel`);
                fetchOrder();
              }}
              className="px-8 py-3 bg-white border-2 border-rose-100 text-rose-600 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-rose-50 transition-all"
            >
              <HiOutlineXMark size={20} /> Cancel Order
            </button>
          )}

          {["DELIVERED", "CANCELLED"].includes(order.status) && (
            <button
              onClick={async () => {
                await api.post(`/orders/${order.id}/reorder`);
                router.push("/cart");
              }}
              className="px-8 py-3 bg-amazon-orange text-amazon-darkBlue rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-amazon-orangeHover transition-all shadow-md active:scale-95"
            >
              <HiOutlineArrowPath size={20} /> Re-Order Items
            </button>
          )}
        </div>
      </div>

      {/* REVIEW MODAL */}
      {reviewProduct && (
        <ReviewModal
          product={reviewProduct.product}
          orderId={reviewProduct.orderId}
          onClose={() => setReviewProduct(null)}
          onSuccess={fetchOrder}
        />
      )}
    </div>
  );
}