"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useRouter } from "next/navigation";
import { 
  HiOutlineShoppingBag, 
  HiOutlineChevronRight, 
  HiOutlineCalendar, 
  HiOutlineCube,
  HiOutlineTag,
  HiOutlineTruck,
  HiOutlineReceiptPercent,
  HiOutlineBanknotes,
  HiOutlineCreditCard,
} from "react-icons/hi2";

export default function OrdersPage() {
  const router = useRouter();

  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);

  const limit = 5;

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await api.get("/orders/my", {
        params: { page, limit },
      });
      setOrders(res.data.orders || []);
      setPages(res.data.pages || 1);
    } catch {
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [page]);

  function getStatusClass(status?: string) {
    switch (status) {
      case "PENDING":
        return "bg-amber-50 text-amber-600 border-amber-100";
      case "CONFIRMED":
        return "bg-blue-50 text-blue-600 border-blue-100";
      case "SHIPPED":
        return "bg-indigo-50 text-indigo-600 border-indigo-100";
      case "DELIVERED":
        return "bg-emerald-50 text-emerald-600 border-emerald-100";
      case "CANCELLED":
        return "bg-rose-50 text-rose-600 border-rose-100";
      default:
        return "bg-gray-50 text-gray-600 border-gray-100";
    }
  }

  /* --- LOADER SKELETON --- */
  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-12 space-y-6">
        <div className="h-10 w-48 bg-gray-100 animate-pulse rounded-lg mb-8" />
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-48 bg-gray-50 animate-pulse rounded-2xl border border-gray-100" />
        ))}
      </div>
    );
  }

  return (
    <div className="bg-amazon-lightGray min-h-screen">
      <div className="max-w-4xl mx-auto px-4 md:px-6 py-12">
        <div className="flex items-center justify-between mb-10">
          <h1 className="text-3xl font-black text-amazon-text tracking-tight">My Orders</h1>
          <div className="text-xs font-bold text-amazon-mutedText uppercase tracking-widest bg-white px-4 py-2 rounded-full border border-amazon-borderGray shadow-sm">
            Total: {orders.length} Orders
          </div>
        </div>

        {orders.length === 0 ? (
          <div className="bg-white rounded-3xl p-16 text-center border border-amazon-borderGray">
            <div className="w-20 h-20 bg-amazon-lightGray rounded-full flex items-center justify-center mx-auto mb-6 text-amazon-mutedText">
              <HiOutlineShoppingBag size={40} />
            </div>
            <h2 className="text-xl font-bold text-amazon-text mb-2">No orders found</h2>
            <p className="text-amazon-mutedText mb-8">You haven't placed any orders yet. Start shopping to see them here!</p>
            <button
              onClick={() => router.push('/')}
              className="bg-amazon-orange text-amazon-darkBlue font-black px-8 py-3 rounded-xl shadow-md active:scale-95 transition-all"
            >
              Start Shopping
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((o) => {
              const statusClass = getStatusClass(o.status);

              // ── Derived price values ──────────────────────────
              const totalAmount      = Number(o.totalAmount ?? 0);
              const couponDiscount   = Number(o.couponDiscount ?? 0);
              const shippingCharge   = Number(o.shippingCharge ?? o.sellerOrders?.reduce((s: number, so: any) => s + Number(so.shippingCharge ?? 0), 0) ?? 0);
              // subtotal = what user paid for products (before shipping, after coupon)
              const subtotal         = totalAmount - shippingCharge + couponDiscount;
              const totalSaved       = couponDiscount;
              const itemCount        = o.items?.length ?? o._count?.items ?? o.orderItems?.length ?? null;
              const paymentMethod    = o.paymentMethod ?? null;
              const couponCode       = o.couponCode ?? null;

              return (
                <div
                  key={o.id}
                  onClick={() => router.push(`/orders/${o.id}`)}
                  className="group bg-white rounded-2xl border border-amazon-borderGray hover:border-amazon-orange shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden"
                >
                  {/* ── TOP BAR ── */}
                  <div className="px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-gray-50">
                    <div className="flex items-center gap-4">
                      <div className="w-11 h-11 bg-gray-50 rounded-xl flex items-center justify-center text-amazon-darkBlue border border-gray-100 group-hover:bg-amazon-orange/10 group-hover:text-amazon-orange transition-colors">
                        <HiOutlineCube size={22} />
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-amazon-mutedText uppercase tracking-widest leading-none mb-1">Order Reference</p>
                        <p className="text-lg font-black text-amazon-text">#SB-{o.id}</p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-amazon-mutedText bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
                        <HiOutlineCalendar size={13} />
                        {new Date(o.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </div>

                      {/* Payment badge */}
                      {paymentMethod && (
                        <div className="flex items-center gap-1.5 text-xs font-bold text-amazon-mutedText bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
                          {paymentMethod === "COD"
                            ? <HiOutlineBanknotes size={13} />
                            : <HiOutlineCreditCard size={13} />}
                          {paymentMethod === "COD" ? "Cash on Delivery" : "Online"}
                        </div>
                      )}

                      <span className={`text-[10px] px-3 py-1.5 rounded-lg font-black border uppercase tracking-tight ${statusClass}`}>
                        {o.status}
                      </span>
                      <HiOutlineChevronRight className="text-gray-300 group-hover:text-amazon-orange group-hover:translate-x-1 transition-all" size={20} />
                    </div>
                  </div>

                  {/* ── PRICE BREAKDOWN ── */}
                  <div className="px-6 py-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">

                      {/* Items subtotal */}
                      <div className="flex items-start gap-2">
                        <HiOutlineTag size={15} className="text-amazon-mutedText mt-0.5 shrink-0" />
                        <div>
                          <p className="text-[10px] font-black text-amazon-mutedText uppercase tracking-wider leading-none mb-1">
                            {itemCount ? `Items (${itemCount})` : "Subtotal"}
                          </p>
                          <p className="text-sm font-black text-amazon-text">₹{subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                        </div>
                      </div>

                      {/* Shipping */}
                      <div className="flex items-start gap-2">
                        <HiOutlineTruck size={15} className="text-amazon-mutedText mt-0.5 shrink-0" />
                        <div>
                          <p className="text-[10px] font-black text-amazon-mutedText uppercase tracking-wider leading-none mb-1">Delivery</p>
                          <p className="text-sm font-black text-amazon-text">
                            {shippingCharge > 0
                              ? `₹${shippingCharge.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                              : <span className="text-emerald-600">FREE</span>
                            }
                          </p>
                        </div>
                      </div>

                      {/* Coupon */}
                      <div className="flex items-start gap-2">
                        <HiOutlineReceiptPercent size={15} className="text-amazon-mutedText mt-0.5 shrink-0" />
                        <div>
                          <p className="text-[10px] font-black text-amazon-mutedText uppercase tracking-wider leading-none mb-1">Coupon</p>
                          {couponDiscount > 0 ? (
                            <div>
                              <p className="text-sm font-black text-emerald-600">-₹{couponDiscount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                              {couponCode && (
                                <p className="text-[10px] font-bold text-amazon-mutedText mt-0.5 bg-gray-50 px-1.5 py-0.5 rounded border border-gray-100 inline-block">{couponCode}</p>
                              )}
                            </div>
                          ) : (
                            <p className="text-sm font-black text-amazon-mutedText">—</p>
                          )}
                        </div>
                      </div>

                      {/* Total paid */}
                      <div className="flex items-start gap-2">
                        <HiOutlineBanknotes size={15} className="text-amazon-orange mt-0.5 shrink-0" />
                        <div>
                          <p className="text-[10px] font-black text-amazon-mutedText uppercase tracking-wider leading-none mb-1">Total Paid</p>
                          <p className="text-base font-black text-amazon-text">
                            ₹{totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </p>
                          {totalSaved > 0 && (
                            <p className="text-[10px] font-bold text-emerald-600 mt-0.5">You saved ₹{totalSaved.toLocaleString('en-IN')}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* ── FOOTER CTA ── */}
                  <div className="px-6 py-3 bg-gray-50 border-t border-gray-100 flex justify-end">
                    <p className="text-xs font-bold text-blue-600 group-hover:underline">View Order Details →</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* PAGINATION */}
        {pages > 1 && (
          <div className="flex justify-center items-center gap-4 mt-12">
            <button
              disabled={page === 1}
              onClick={(e) => { e.stopPropagation(); setPage(page - 1); }}
              className="p-3 rounded-xl bg-white border border-amazon-borderGray text-amazon-darkBlue disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors shadow-sm"
            >
              <HiOutlineChevronRight className="rotate-180" size={20} />
            </button>

            <div className="bg-white border border-amazon-borderGray px-6 py-2 rounded-xl text-sm font-black text-amazon-text shadow-sm">
              Page {page} <span className="text-amazon-mutedText font-medium mx-1">of</span> {pages}
            </div>

            <button
              disabled={page === pages}
              onClick={(e) => { e.stopPropagation(); setPage(page + 1); }}
              className="p-3 rounded-xl bg-white border border-amazon-borderGray text-amazon-darkBlue disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors shadow-sm"
            >
              <HiOutlineChevronRight size={20} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
