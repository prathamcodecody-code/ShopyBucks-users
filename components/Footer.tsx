"use client";

import Link from "next/link";
import React, { useEffect, useState } from "react";
import FeedbackModal from "@/app/feedback/feedback";
import { api } from "@/lib/api";

export default function Footer() {
  const [showFeedback, setShowFeedback] = useState(false);
  const [footerData, setFooterData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  useEffect(() => {
    async function fetchFooterData() {
      try {
        setLoading(true);
        const catRes = await api.get("/categories");
        const categories = Array.isArray(catRes.data) ? catRes.data : [];

        const fullData = await Promise.all(
          categories.map(async (cat: any) => {
            const typeRes = await api.get(`/product-types`, {
              params: { categoryId: cat.id },
            });
            const baseTypes = Array.isArray(typeRes.data) ? typeRes.data : [];

            const typesWithSubs = await Promise.all(
              baseTypes.map(async (t: any) => {
                const subRes = await api.get(`/product-subtypes`, {
                  params: { typeId: t.id, categoryId: cat.id },
                });
                return {
                  ...t,
                  subtypes: Array.isArray(subRes.data) ? subRes.data : [],
                };
              })
            );

            return { ...cat, types: typesWithSubs };
          })
        );

        setFooterData(fullData);
      } catch (err) {
        console.error("Footer data fetch failed:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchFooterData();
  }, []);

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId);
      } else {
        newSet.add(categoryId);
      }
      return newSet;
    });
  };

  return (
    <>
      <footer className="bg-genz-bg border-t border-genz-border">
        <div className="max-w-7xl mx-auto px-6 py-16">
          {/* ================= TOP GRID ================= */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10 mb-14">
            {/* BRAND */}
            <div className="space-y-6">
              <Link href="/" className="inline-block group">
                <div className="relative w-32 md:w-44 transition-transform group-hover:scale-105 duration-300">
                  <img src="/shopybucks.jpg" alt="ShopyBucks Logo" className="w-full h-auto object-contain" />
                </div>
              </Link>
              <p className="text-sm leading-relaxed text-genz-muted max-w-xs font-medium">
                Your everyday fashion destination for women, men & kids.
                Discover the latest styles in ethnic, western & modern wear.
              </p>
            </div>

            {/* CUSTOMER CARE */}
            <div>
              <h4 className="font-black text-genz-ink mb-6 uppercase text-xs tracking-[0.2em]">Customer Care</h4>
              <ul className="space-y-3 text-sm font-semibold text-genz-muted">
                {[
                  { label: "Contact Us", href: "/contact" },
                  { label: "Track Order", href: "/orders" },
                  { label: "Returns & Refunds", href: "/return-refund" },
                  { label: "FAQs", href: "/faq" },
                ].map((item) => (
                  <li key={item.label}>
                    <Link href={item.href} className="hover:text-genz-accent transition-colors duration-200">
                      {item.label}
                    </Link>
                  </li>
                ))}
                <li>
                  <button onClick={() => setShowFeedback(true)} className="hover:text-genz-accent transition-colors duration-200">
                    Give Feedback
                  </button>
                </li>
              </ul>
            </div>

            {/* COMPANY */}
            <div>
              <h4 className="font-black text-genz-ink mb-6 uppercase text-xs tracking-[0.2em]">Company</h4>
              <ul className="space-y-3 text-sm font-semibold text-genz-muted">
                {[
                  { label: "About Us", href: "/about" },
                  { label: "Terms & Conditions", href: "/terms" },
                  { label: "Privacy Policy", href: "/privacy" },
                  { label: "Shipping Policy", href: "/shipping-policy" },
                  { label: "Refund Policy", href: "/return-refund" },
                ].map((item) => (
                  <li key={item.label}>
                    <Link href={item.href} className="hover:text-genz-accent transition-colors duration-200">
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* SOCIAL */}
            <div>
              <h4 className="font-black text-genz-ink mb-6 uppercase text-xs tracking-[0.2em]">Follow Us</h4>
              <ul className="space-y-3 text-sm font-semibold text-genz-muted">
                <li><a href="https://www.instagram.com/shopybucks/" target="_blank" className="hover:text-genz-accent transition-colors">Instagram</a></li>
                <li><a href="https://www.facebook.com/shopybucks" target="_blank" className="hover:text-genz-accent transition-colors">Facebook</a></li>
                <li><a href="https://www.linkedin.com/company/shopybucks/" target="_blank" className="hover:text-genz-accent transition-colors">Linkedin</a></li>
                <li><a href="https://x.com/shopybucks" target="_blank" className="hover:text-genz-accent transition-colors">X</a></li>
              </ul>
            </div>
          </div>

          {/* ================= COLLECTIONS SECTION - EXPANDABLE ================= */}
          <div className="space-y-10 border-t border-genz-border pt-10">
            {!loading && footerData.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-6">
                {footerData.map((category) => (
                  <div key={category.id} className="space-y-2">
                    <button
                      onClick={() => toggleCategory(category.id)}
                      className="flex items-center justify-between w-full group"
                    >
                      <h4 className="font-black text-genz-ink text-[13px] uppercase tracking-wider hover:text-genz-accent transition-colors">
                        {category.name}
                      </h4>
                      <span className="text-genz-muted text-lg transition-transform duration-300 group-hover:text-genz-accent"
                        style={{
                          transform: expandedCategories.has(category.id) ? "rotate(180deg)" : "rotate(0deg)"
                        }}
                      >
                        ▼
                      </span>
                    </button>

                    {/* EXPANDABLE TYPES & SUBTYPES */}
                    {expandedCategories.has(category.id) && (
                      <div className="pt-3 space-y-3 max-h-96 overflow-y-auto">
                        {category.types.map((type: any) => (
                          <div key={type.id} className="space-y-1.5 pl-2 border-l-2 border-genz-border">
                            <Link 
                              href={`/all-products?categoryId=${category.id}&typeId=${type.id}`}
                              className="text-xs font-bold text-genz-ink hover:text-genz-accent transition-colors block"
                            >
                              {type.name}
                            </Link>
                            <div className="text-[11px] text-genz-muted space-y-1">
                              {type.subtypes.map((sub: any) => (
                                <div key={sub.id}>
                                  <Link 
                                    href={`/all-products?categoryId=${category.id}&typeId=${type.id}&subtypeId=${sub.id}`}
                                    className="hover:text-genz-accent transition-colors"
                                  >
                                    • {sub.name}
                                  </Link>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* ADDRESS */}
            <div className="border-t border-genz-border pt-10">
              <h4 className="font-black text-genz-ink mb-4 text-xs uppercase tracking-[0.2em]">Registered Office</h4>
              <div className="text-xs text-genz-muted leading-relaxed font-medium space-y-1">
                <p className="font-bold text-genz-ink">ShopyBucks Pvt. Ltd.</p>
                <p>5th Floor, DLF Two Horizon Centre, DLF Phase 5,</p>
                <p>Gurugram, India, 122002</p>
                <p className="pt-2">Customer Support: <span className="text-genz-ink font-bold">+91-6366666767</span></p>
              </div>
            </div>

            {/* FOOTER BOTTOM */}
            <div className="pt-8 text-center border-t border-genz-border/50">
              <p className="text-[10px] font-bold text-genz-muted uppercase tracking-[0.3em]">
                © {new Date().getFullYear()}{" "}
                <span className="text-genz-accent">Shopy</span>
                <span className="text-purple-600">Bucks</span>. Curating the best for you.
              </p>
            </div>
          </div>
        </div>
      </footer>

      {showFeedback && <FeedbackModal onClose={() => setShowFeedback(false)} />}
    </>
  );
}
