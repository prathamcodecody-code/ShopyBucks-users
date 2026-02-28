"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import Link from "next/link";
import { Product } from "@/lib/product";

// ================= IMAGE URL HELPER =================
function buildImageUrl(img: string | null | undefined): string {
  if (!img) return "/placeholder.png";
  const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "";
  const base = `${API_URL}/uploads/products/`;
  if (img.startsWith("http://") || img.startsWith("https://")) return img;
  if (img.startsWith("/uploads/products/")) return API_URL + img;
  return base + img;
}

export default function SponsoredProducts() {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    api
      .get("/products/homepage/sponsored")
      .then((res) => setProducts(res.data.products))
      .catch(() => setProducts([]));
  }, []);

  if (!products.length) return null;

  return (
    <section className="mb-8 px-4">
      {/* Header Section */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-genz-ink flex items-center gap-2">
          Most Popular Brands 
          <span className="text-[10px] bg-genz-softAccent text-genz-accent px-2 py-0.5 rounded-full uppercase tracking-wider font-bold">
            Sponsored
          </span>
        </h2>
        <Link href="/all-brands" className="text-blue-600 text-sm font-medium hover:underline">
          View All →
        </Link>
      </div>

      {/* Brand Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {products.map((p) => {
          const imgUrl = buildImageUrl(p.img1);
          
          // FIXED URL LOGIC: Fallback to "product" if category slug is missing
          const categoryPath = p.category?.slug || "product";
          const productUrl = `/${categoryPath}/${p.slug}`;

          return (
            <div 
              key={p.id} 
              className="group flex flex-col bg-genz-card border border-genz-border rounded-genz overflow-hidden hover:shadow-md transition-shadow h-full"
            >
              <div className="bg-pink-50 text-pink-600 text-[11px] font-bold py-1.5 text-center">
                Special Offer
              </div>

              <Link href={productUrl} className="flex-1 p-4 flex flex-col items-center justify-center">
                <div className="relative w-full h-24 mb-3">
                   <img
                    src={imgUrl}
                    alt={p.title}
                    className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                
                <div className="text-center">
                  <p className="text-sm font-bold text-genz-ink line-clamp-1">
                    {p.title}
                  </p>
                  <p className="text-xs text-genz-muted mt-1 font-medium">
                    Starting at ₹{p.finalPrice?.toLocaleString()}
                  </p>
                </div>
              </Link>

              <div className="px-3 pb-3">
                <Link 
                  href={productUrl}
                  className="block w-full bg-genz-accent text-white text-center py-2.5 rounded-lg text-xs font-black uppercase tracking-wider hover:bg-orange-600 transition-colors shadow-sm"
                >
                  Buy Now
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
