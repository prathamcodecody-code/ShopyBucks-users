"use client";

import { useEffect, useState } from "react";
import ProductCard from "./ProductCard";
import { api } from "@/lib/api";
import { Sparkles, ChevronRight } from "lucide-react";
import Link from "next/link";

/* ---------------- SKELETON CARD (Updated to 3/4 Ratio) ---------------- */
function ProductSkeleton() {
  return (
    <div className="space-y-4">
      <div className="aspect-[3/4] bg-genz-border/40 rounded-genz animate-pulse" />
      <div className="h-3 bg-genz-border/40 rounded-full w-3/4 animate-pulse" />
      <div className="h-3 bg-genz-border/40 rounded-full w-1/2 animate-pulse" />
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
        const list = Array.isArray(data) ? data : Array.isArray(data?.products) ? data.products : [];
        setProducts(list);
      })
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="bg-genz-bg py-16 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        
        {/* HEADER SECTION: Compact & Precise */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-genz-accent font-black text-[10px] uppercase tracking-[0.4em]">
              <Sparkles size={14} strokeWidth={3} />
              Just In
            </div>
            <h2 className="text-3xl md:text-5xl font-black text-genz-ink tracking-tighter uppercase italic leading-none">
              New <span className="text-genz-accent">Arrivals</span>
            </h2>
            <p className="text-genz-muted max-w-sm text-xs md:text-sm font-medium">
              The latest drops, updated daily. Fresh heat for your rotation.
            </p>
          </div>

          <Link 
            href="/all-products?sort=newest"
            className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-genz-ink hover:text-genz-accent transition-all group border-b-2 border-genz-ink hover:border-genz-accent pb-1"
          >
            See the full drop
            <ChevronRight size={14} className="transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {/* GRID CONTAINER: Consistent 2-column mobile, 4-column PC */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {loading ? (
            Array.from({ length: 8 }).map((_, i) => (
              <ProductSkeleton key={i} />
            ))
          ) : products.length === 0 ? (
            <div className="col-span-full text-center py-20 border-2 border-dashed border-genz-border rounded-genz">
              <p className="text-genz-muted font-black uppercase tracking-widest text-[10px]">
                Restocking the vault... Check back soon.
              </p>
            </div>
          ) : (
            products.map((p) => (
              <div key={p.id} className="relative transition-transform duration-500 hover:-translate-y-1">
                {/* FLOATING "NEW" TAG: Smaller and cleaner */}
                <div className="absolute top-2 left-2 z-10 bg-genz-ink text-white text-[8px] font-black px-2 py-0.5 rounded shadow-xl uppercase tracking-tighter">
                  Drop #1
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
