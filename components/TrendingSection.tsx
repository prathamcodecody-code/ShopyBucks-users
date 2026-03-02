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
          params: { 
            sort: "random", 
            limit: 15 
          },
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

  if (loading) {
    return (
      <section className="max-w-[1600px] mx-auto px-4 py-6 md:py-12">
        <div className="h-6 w-32 bg-genz-border animate-pulse rounded-full mb-6 md:mb-10" />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="space-y-3">
              <div className="aspect-square bg-genz-border/50 animate-pulse rounded-lg" />
              <div className="h-2 w-3/4 bg-genz-border/50 animate-pulse rounded-full" />
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (!items.length) return null;

  return (
    <section className="bg-genz-bg py-4 md:py-8 px-4 sm:px-6">
      <div className="max-w-[1600px] mx-auto">
        
        {/* HEADER: Adjusted for Mobile Spacing */}
        <div className="flex items-center justify-between mb-6 md:mb-10">
          <div className="flex items-center gap-2 md:gap-4">
            <div className="bg-genz-softAccent p-2 md:p-3 rounded-xl md:rounded-2xl text-genz-accent shadow-sm">
              <TrendingUp size={20} className="md:w-7 md:h-7" strokeWidth={2.5} />
            </div>
            <div>
              <p className="text-[8px] md:text-[10px] font-black text-genz-accent uppercase tracking-[0.2em] md:tracking-[0.4em] mb-0.5">Live Drops</p>
              <h2 className="text-xl md:text-4xl font-black text-genz-ink tracking-tighter uppercase italic">
                Trending <span className="text-genz-accent">Now</span>
              </h2>
            </div>
          </div>
          
          <Link 
            href="/all-products" 
            className="flex items-center gap-1 md:gap-2 text-[9px] md:text-[10px] font-black uppercase tracking-widest text-genz-muted hover:text-genz-accent transition-all"
          >
            <span className="hidden xs:inline">Explore All</span>
            <div className="bg-white p-1 md:p-1.5 rounded-full border border-genz-border shadow-sm">
              <ChevronRight size={12} className="md:w-3.5 md:h-3.5" />
            </div>
          </Link>
        </div>

        {/* GRID: Reduced gap on mobile */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2.5 md:gap-4">
          {items.map((product) => (
            <div key={product.id} className="h-full">
              <ProductCard product={product} />
            </div>
          ))}
        </div>

        {/* MODERN FOOTER: Stacked on mobile, tight padding */}
        <div className="mt-6 md:mt-5 grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-6">
          <Badge item={{
            icon: <Zap size={18} />,
            title: "Instant Dispatch",
            desc: "Ready for immediate drop."
          }} />
          <Badge item={{
            icon: <Diamond size={18} />,
            title: "Premium Pick",
            desc: "Verified quality only."
          }} />
          <Badge item={{
            icon: <RefreshCw size={18} />,
            title: "Flex Returns",
            desc: "Easy, no-stress swaps."
          }} />
        </div>
      </div>
    </section>
  );
}

function Badge({ item }: { item: { icon: any, title: string, desc: string } }) {
  return (
    <div className="bg-white border border-genz-border p-3.5 md:p-6 rounded-xl md:rounded-genz flex items-center gap-3 md:gap-5 hover:border-genz-accent transition-all group cursor-default">
      <div className="bg-genz-bg p-2 md:p-3 rounded-lg md:rounded-2xl text-genz-ink group-hover:bg-genz-softAccent group-hover:text-genz-accent transition-colors">
        {item.icon}
      </div>
      <div>
        <p className="font-black text-genz-ink uppercase text-[9px] md:text-[11px] tracking-wider md:tracking-widest mb-0.5">{item.title}</p>
        <p className="text-genz-muted text-[9px] md:text-[11px] font-medium leading-tight">{item.desc}</p>
      </div>
    </div>
  );
}
