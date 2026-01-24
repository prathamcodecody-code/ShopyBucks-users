"use client";

import { useEffect, useState } from "react";
import ProductCard from "./ProductCard";
import { api } from "@/lib/api";
import { Sparkles, ChevronRight } from "lucide-react";
import Link from "next/link";

/* ---------------- SKELETON CARD ---------------- */
function ProductSkeleton() {
  return (
    <div className="bg-white border border-amazon-borderGray p-4 animate-pulse">
      <div className="aspect-square bg-amazon-lightGray rounded mb-4" />
      <div className="h-4 bg-amazon-lightGray rounded w-3/4 mb-2" />
      <div className="h-4 bg-amazon-lightGray rounded w-1/2 mb-4" />
      <div className="h-10 bg-amazon-lightGray rounded w-full" />
    </div>
  );
}

export default function NewArrivals() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/products?limit=8")
      .then((res) => {
        const data = res.data;
        const list =
          Array.isArray(data) ? data :
          Array.isArray(data?.products) ? data.products :
          [];
        setProducts(list);
      })
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    /* Changed bg-amazon-lightGray to bg-white */
    <section className="bg-white py-16">
      <div className="max-w-7xl mx-auto px-4">
        
        {/* HEADER SECTION */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-amazon-orange font-bold text-sm uppercase tracking-[0.2em]">
              <Sparkles size={16} />
              Just In
            </div>
            <h2 className="text-3xl md:text-4xl font-black text-amazon-darkBlue tracking-tight">
              New <span className="text-amazon-orange">Arrivals</span>
            </h2>
            <p className="text-amazon-mutedText max-w-md">
              Discover the latest additions to our collection. Fresh styles updated daily.
            </p>
          </div>

          <Link 
            href="/all-products?sort=newest"
            className="inline-flex items-center gap-2 font-bold text-amazon-darkBlue hover:text-amazon-orange transition-colors group border-b-2 border-amazon-orange pb-1 w-fit"
          >
            Explore All New
            <ChevronRight size={18} className="transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {/* GRID CONTAINER - Removed border and shadow for a cleaner look on white background */}
        <div className="p-0">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
            {loading ? (
              Array.from({ length: 8 }).map((_, i) => (
                <ProductSkeleton key={i} />
              ))
            ) : products.length === 0 ? (
              <div className="col-span-full text-center py-20 border-2 border-dashed border-amazon-borderGray rounded-lg">
                <p className="text-amazon-mutedText font-medium">
                  We're restocking! Check back soon for new items.
                </p>
              </div>
            ) : (
              products.map((p) => (
                <div key={p.id} className="relative group">
                  {/* "NEW" BADGE */}
                  <div className="absolute top-2 left-2 z-10 bg-amazon-success text-white text-[10px] font-bold px-2 py-1 rounded-sm uppercase">
                    New
                  </div>
                  <ProductCard product={p} />
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
