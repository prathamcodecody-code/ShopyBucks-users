"use client";

import { useEffect, useState } from "react";
import ProductCard from "./ProductCard";
import { api } from "@/lib/api";
import { Sparkles, ChevronRight } from "lucide-react";
import Link from "next/link";

/* ---------------- SKELETON CARD ---------------- */
function ProductSkeleton() {
  return (
    <div className="bg-genz-card border border-genz-border p-4 rounded-genz animate-pulse">
      <div className="aspect-[4/5] bg-genz-bg rounded-2xl mb-4" />
      <div className="h-4 bg-genz-bg rounded-full w-3/4 mb-2" />
      <div className="h-4 bg-genz-bg rounded-full w-1/2 mb-4" />
      <div className="h-10 bg-genz-bg rounded-full w-full" />
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
    <section className="bg-genz-bg py-20 px-4 sm:px-6 md:px-8">
      <div className="max-w-7xl mx-auto">
        
        {/* HEADER SECTION: Clean & Impactful */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-genz-accent font-black text-xs uppercase tracking-[0.3em]">
              <Sparkles size={16} />
              Just In
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-genz-ink tracking-tighter uppercase leading-none">
              New <span className="text-genz-accent">Arrivals</span>
            </h2>
            <p className="text-genz-muted max-w-sm text-sm md:text-base font-medium">
              Fresh styles updated daily. Discover the latest additions to our curation.
            </p>
          </div>

          <Link 
            href="/all-products?sort=newest"
            className="inline-flex items-center gap-2 font-bold text-genz-ink hover:text-genz-accent transition-all group bg-white px-6 py-3 rounded-full shadow-sm border border-genz-border hover:shadow-md"
          >
            Explore All
            <ChevronRight size={18} className="transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {/* GRID CONTAINER */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6 lg:gap-8">
          {loading ? (
            Array.from({ length: 8 }).map((_, i) => (
              <ProductSkeleton key={i} />
            ))
          ) : products.length === 0 ? (
            <div className="col-span-full text-center py-24 bg-white border border-dashed border-genz-border rounded-genz">
              <p className="text-genz-muted font-bold uppercase tracking-widest text-sm">
                Restocking the heat... Check back soon.
              </p>
            </div>
          ) : (
            products.map((p) => (
              <div key={p.id} className="relative group transition-transform duration-500 hover:-translate-y-2">
                {/* GEN Z BADGE: Pill-shaped and vibrant */}
                <div className="absolute top-3 left-3 z-10 bg-genz-ink text-white text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest shadow-lg">
                  New
                </div>
                <ProductCard product={p} />
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
}
