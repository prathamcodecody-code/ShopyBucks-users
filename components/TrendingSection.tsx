"use client";

import { useEffect, useState } from "react";
import ProductCard from "./ProductCard";
import { api } from "@/lib/api";
import Link from "next/link";
import { TrendingUp, ChevronRight, Zap, Diamond, RefreshCw } from "lucide-react";
import { Product } from "@/lib/product";

export default function TrendingNow() {
  const [items, setItems] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTrending = async () => {
      try {
        const res = await api.get("/products", {
          params: { sort: "newest", limit: 4 },
        });
        const data = res.data?.products ?? res.data ?? [];
        setItems(Array.isArray(data) ? data : []);
      } catch (err) {
        setItems([]);
      } finally {
        setLoading(false);
      }
    };
    fetchTrending();
  }, []);

  /* ---------------- LOADING STATE (Matches 3/4 Aspect Ratio) ---------------- */
  if (loading) {
    return (
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="h-8 w-48 bg-genz-border animate-pulse rounded-full mb-10" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="space-y-4">
              <div className="aspect-[3/4] bg-genz-border/50 animate-pulse rounded-genz" />
              <div className="h-3 w-3/4 bg-genz-border/50 animate-pulse rounded-full" />
              <div className="h-3 w-1/2 bg-genz-border/50 animate-pulse rounded-full" />
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (!items.length) return null;

  /* ---------------- MAIN UI ---------------- */
  return (
    <section className="bg-genz-bg py-16 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        
        {/* HEADER */}
        <div className="flex items-end justify-between mb-10">
          <div className="flex items-center gap-4">
            <div className="bg-genz-softAccent p-3 rounded-2xl text-genz-accent shadow-sm">
              <TrendingUp size={28} strokeWidth={2.5} />
            </div>
            <div>
              <p className="text-[10px] font-black text-genz-accent uppercase tracking-[0.4em] mb-1">Live Drops</p>
              <h2 className="text-3xl md:text-4xl font-black text-genz-ink tracking-tighter uppercase italic">
                Trending <span className="text-genz-accent">Now</span>
              </h2>
            </div>
          </div>
          
          <Link 
            href="/all-products" 
            className="group hidden sm:flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-genz-muted hover:text-genz-accent transition-all"
          >
            Explore All
            <div className="bg-white p-1.5 rounded-full border border-genz-border group-hover:bg-genz-accent group-hover:border-genz-accent group-hover:text-white transition-all shadow-sm">
              <ChevronRight size={14} />
            </div>
          </Link>
        </div>

        {/* GRID: 2 Columns on Mobile, 4 on PC */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {items.map((product) => (
            <div key={product.id} className="transition-all duration-500">
              <ProductCard product={product} />
            </div>
          ))}
        </div>

        {/* MODERN FOOTER: Minimalist Vibe Badges */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-6">
          <Badge item={{
            icon: <Zap size={20} />,
            title: "Instant Dispatch",
            desc: "Ready for immediate drop."
          }} />
          <Badge item={{
            icon: <Diamond size={20} />,
            title: "Premium Pick",
            desc: "Verified quality only."
          }} />
          <Badge item={{
            icon: <RefreshCw size={20} />,
            title: "Flex Returns",
            desc: "Easy, no-stress swaps."
          }} />
        </div>
      </div>
    </section>
  );
}

/* --- REUSABLE BADGE SUB-COMPONENT --- */
function Badge({ item }: { item: { icon: any, title: string, desc: string } }) {
  return (
    <div className="bg-white border border-genz-border p-6 rounded-genz flex items-center gap-5 hover:border-genz-accent transition-all duration-300 group hover:shadow-xl hover:shadow-genz-accent/5 cursor-default">
      <div className="bg-genz-bg p-3 rounded-2xl text-genz-ink group-hover:bg-genz-softAccent group-hover:text-genz-accent transition-colors duration-300">
        {item.icon}
      </div>
      <div>
        <p className="font-black text-genz-ink uppercase text-[11px] tracking-widest mb-0.5">{item.title}</p>
        <p className="text-genz-muted text-[11px] font-medium leading-tight">{item.desc}</p>
      </div>
    </div>
  );
}
