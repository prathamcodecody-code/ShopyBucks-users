"use client";

import Link from "next/link";
import React from "react";
import FeedbackModal from "@/app/feedback/feedback";

export default function Footer() {
  const [showFeedback, setShowFeedback] = React.useState(false);

  return (
    <>
      <footer className="bg-amazon-lightGray border-t border-gray-200 mt-24">
        <div className="max-w-7xl mx-auto px-6 py-16">

          {/* ================= TOP GRID ================= */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10 mb-14">

            {/* BRAND */}
            <div>
              <h3 className="text-2xl font-bold mb-4">
                <span className="text-amazon-orange">Shopy</span>
                <span className="text-purple-600">Bucks</span>
              </h3>

              <p className="text-sm leading-relaxed text-amazon-mutedText">
                Your everyday fashion destination for women, men & kids.
                Discover the latest styles in ethnic, western & modern wear.
              </p>
            </div>

            {/* CUSTOMER CARE */}
            <div>
              <h4 className="font-semibold text-amazon-text mb-4 uppercase text-sm">
                Customer Care
              </h4>
              <ul className="space-y-2 text-sm text-gray-600">
                {[
                  { label: "Contact Us", href: "/contact" },
                  { label: "Track Order", href: "/orders" },
                  { label: "Returns & Refunds", href: "/return-refund" },
                  { label: "FAQs", href: "/faq" },
                ].map((item) => (
                  <li key={item.label}>
                    <Link
                      href={item.href}
                      className="hover:text-amazon-orange transition"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}

                <li>
                  <button
                    onClick={() => setShowFeedback(true)}
                    className="hover:text-amazon-orange transition"
                  >
                    Give Feedback
                  </button>
                </li>
              </ul>
            </div>

            {/* COMPANY */}
            <div>
              <h4 className="font-semibold text-amazon-text mb-4 uppercase text-sm">
                Company
              </h4>
              <ul className="space-y-2 text-sm text-gray-600">
                {[
                  { label: "About Us", href: "/about" },
                  { label: "Terms & Conditions", href: "/terms" },
                  { label: "Privacy Policy", href: "/privacy" },
                  { label: "Shipping Policy", href: "/shipping-policy" },
                  { label: "Refund Policy", href: "/return-refund" },
                ].map((item) => (
                  <li key={item.label}>
                    <Link
                      href={item.href}
                      className="hover:text-amazon-orange transition"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* SOCIAL */}
            <div>
              <h4 className="font-semibold text-amazon-text mb-4 uppercase text-sm">
                Follow Us
              </h4>
              <ul className="space-y-2 text-sm text-gray-600">
                {["Instagram", "Facebook", "YouTube", "Pinterest"].map(
                  (s) => (
                    <li key={s}>
                      <a
                        href="#"
                        className="hover:text-amazon-orange transition"
                      >
                        {s}
                      </a>
                    </li>
                  )
                )}
              </ul>
            </div>
          </div>

          {/* ================= POPULAR SEARCHES ================= */}
          <div className="border-t border-gray-200 pt-8 mb-8">
            <h4 className="font-semibold text-amazon-text mb-3 text-sm uppercase">
              Popular Searches
            </h4>
            <p className="text-sm text-gray-600 leading-relaxed">
              Dresses · Tops · Kurtis · Sarees · Western Wear · Ethnic Wear ·
              Jeans · T-Shirts · Party Wear · Footwear · Bags · Kids Clothing ·
              Designer Wear
            </p>
          </div>

          {/* ================= ADDRESS ================= */}
          <div className="border-t border-gray-200 pt-8 mb-8">
            <h4 className="font-semibold text-amazon-text mb-3 text-sm uppercase">
              Registered Office
            </h4>
            <p className="text-sm text-gray-600 leading-relaxed">
              ShopyBucks Pvt. Ltd.<br />
              Main Market, Delhi NCR, India – 110001<br />
              Customer Support: +91-XXXXXXXXXX
            </p>
          </div>

          {/* ================= FOOTER BOTTOM ================= */}
          <div className="border-t border-gray-200 pt-6 text-center text-sm text-gray-500">
            © {new Date().getFullYear()}{" "}
            <span className="font-semibold text-amazon-orange">Shopy</span>
            <span className="font-semibold text-purple-600">Bucks</span>. All
            rights reserved.
          </div>
        </div>
      </footer>

      {showFeedback && (
        <FeedbackModal onClose={() => setShowFeedback(false)} />
      )}
    </>
  );
}
