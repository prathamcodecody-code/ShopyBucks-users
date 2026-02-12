"use client";

import { useEffect, useState } from "react";
import ProductCard from "./ProductCard";
import { api } from "@/lib/api";
import Link from "next/link";
import { TrendingUp, ChevronRight } from "lucide-react";
import { Product } from "@/lib/product";

export default function TrendingNow() {
  const [items, setItems] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTrending = async () => {
      try {
        const res = await api.get("/products", {
          params: {
            sort: "newest",
            limit: 4,
          },
        });

        const data = res.data?.products ?? res.data ?? [];
        setItems(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to load trending products", err);
        setItems([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTrending();
  }, []);

  /* ---------------- LOADING STATE ---------------- */
  if (loading) {
    return (
      <section className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-12">
        <div className="h-10 w-64 bg-genz-border animate-pulse rounded-full mb-8" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-genz-card p-4 rounded-genz border border-genz-border">
              <div className="aspect-[4/5] bg-genz-bg animate-pulse rounded-2xl mb-4" />
              <div className="h-4 w-3/4 bg-genz-bg animate-pulse rounded-full mb-2" />
              <div className="h-4 w-1/2 bg-genz-bg animate-pulse rounded-full" />
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (!items.length) return null;

  /* ---------------- MAIN UI ---------------- */
  return (
    <section className="bg-genz-bg py-12 px-4 sm:px-6 md:px-8">
      <div className="max-w-7xl mx-auto">
        
        {/* HEADER: Minimal and Bold */}
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-3">
            <div className="bg-genz-softAccent p-2.5 rounded-2xl">
              <TrendingUp size={24} className="text-genz-accent" />
            </div>
            <h2 className="text-2xl md:text-3xl font-black text-genz-ink tracking-tighter uppercase">
              Trending Now
            </h2>
          </div>
          
          <Link 
            href="/all-products" 
            className="group flex items-center gap-2 text-sm font-bold text-genz-muted hover:text-genz-accent transition-all"
          >
            Explore All
            <div className="bg-white p-1 rounded-full shadow-sm group-hover:bg-genz-accent group-hover:text-white transition-all">
              <ChevronRight size={16} />
            </div>
          </Link>
        </div>

        {/* GRID LAYOUT: Responsive flex-row for mobile scroll, grid for desktop */}
        <div className="flex md:grid md:grid-cols-4 overflow-x-auto md:overflow-visible gap-6 no-scrollbar pb-4 snap-x">
          {items.map((product) => (
            <div 
              key={product.id} 
              className="min-w-[280px] md:min-w-0 snap-center transition-all duration-500"
            >
              {/* Note: Ensure ProductCard also uses the 'genz' styling internally */}
              <ProductCard product={product} />
            </div>
          ))}
        </div>

        {/* MODERN FOOTER: Minimalist "Vibe" Badges */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-genz-card border border-genz-border p-6 rounded-genz flex items-center gap-4 hover:border-genz-accent transition-colors group">
            <div className="text-2xl group-hover:scale-110 transition-transform">⚡</div>
            <div>
              <p className="font-black text-genz-ink uppercase text-xs tracking-widest">Instant Dispatch</p>
              <p className="text-genz-muted text-[11px] font-medium">Ready when you are.</p>
            </div>
          </div>
          
          <div className="bg-genz-card border border-genz-border p-6 rounded-genz flex items-center gap-4 hover:border-genz-accent transition-colors group">
            <div className="text-2xl group-hover:scale-110 transition-transform">💎</div>
            <div>
              <p className="font-black text-genz-ink uppercase text-xs tracking-widest">Premium Pick</p>
              <p className="text-genz-muted text-[11px] font-medium">Curated quality only.</p>
            </div>
          </div>

          <div className="bg-genz-card border border-genz-border p-6 rounded-genz flex items-center gap-4 hover:border-genz-accent transition-colors group">
            <div className="text-2xl group-hover:scale-110 transition-transform">🔄</div>
            <div>
              <p className="font-black text-genz-ink uppercase text-xs tracking-widest">Flex Returns</p>
              <p className="text-genz-muted text-[11px] font-medium">Easy, no-stress swaps.</p>
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </section>
  );
}
