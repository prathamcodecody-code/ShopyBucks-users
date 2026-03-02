"use client";

import { useEffect, useState } from "react";
import ProductCard from "./ProductCard";
import { api } from "@/lib/api";
import { Sparkles, ChevronRight } from "lucide-react";
import Link from "next/link";

/* ---------------- SKELETON CARD (Updated to Square Ratio) ---------------- */
function ProductSkeleton() {
  return (
    <div className="space-y-4">
      {/* Updated to aspect-square to match the smaller card style */}
      <div className="aspect-square bg-genz-border/40 rounded-lg animate-pulse" />
      <div className="h-3 bg-genz-border/40 rounded-full w-3/4 animate-pulse" />
      <div className="h-3 bg-genz-border/40 rounded-full w-1/2 animate-pulse" />
    </div>
  );
}

export default function NewArrivals() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNewArrivals = async () => {
      try {
        const res = await api.get("/products", {
          params: {
            sort: "random", 
            limit: 15, // Updated to 15 (multiple of 5)
          },
        });
        const data = res.data;
        const list = Array.isArray(data) ? data : Array.isArray(data?.products) ? data.products : [];
        setProducts(list);
      } catch (error) {
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchNewArrivals();
  }, []);

  return (
    <section className="bg-genz-bg pt-9 pb-1 px-4 sm:px-6">
      {/* Increased max-width to allow 5 columns to breathe */}
      <div className="max-w-[1600px] mx-auto">
        
        {/* HEADER SECTION */}
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

        {/* GRID CONTAINER: 2-col mobile, 3-col tablet, 5-col desktop */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-5">
          {loading ? (
            // Showing 10 skeletons to match the 5-column flow
            Array.from({ length: 10 }).map((_, i) => (
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
              <div key={p.id} className="relative h-full transition-transform duration-500 hover:-translate-y-1">
                <ProductCard product={p} />
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
}
