"use client";

import { useEffect, useState } from "react";
import ProductCard from "./ProductCard";
import { api } from "@/lib/api";
import Link from "next/link";
import { TrendingUp, ChevronRight } from "lucide-react";

interface Product {
  id: number;
  title: string;
  img1: string | null;
  price: number;
  slug?: string;
  category: {
    id: number;
    name: string;
    slug: string;
  };
}

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
      <section className="max-w-7xl mx-auto px-4 py-12">
        <div className="h-8 w-48 bg-amazon-borderGray/30 animate-pulse rounded mb-8" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white p-4 border border-amazon-borderGray rounded-lg">
              <div className="aspect-square bg-amazon-lightGray animate-pulse rounded-md mb-4" />
              <div className="h-4 w-3/4 bg-amazon-lightGray animate-pulse rounded mb-2" />
              <div className="h-4 w-1/2 bg-amazon-lightGray animate-pulse rounded" />
            </div>
          ))}
        </div>
      </section>
    );
  }

  /* ---------------- EMPTY STATE ---------------- */
  if (!items.length) {
    return null; // Better to hide the section entirely if no data
  }

  /* ---------------- MAIN UI ---------------- */
  return (
    <section className="max-w-7xl mx-auto px-4 py-10">
      {/* Header with Amazon-style "View All" link */}
      <div className="flex items-end justify-between mb-6 pb-2 border-b border-amazon-borderGray">
        <div className="flex items-center gap-2">
          <div className="bg-amazon-orange/10 p-2 rounded-lg">
            <TrendingUp size={24} className="text-amazon-orange" />
          </div>
          <h2 className="text-2xl font-black text-amazon-darkBlue tracking-tight uppercase">
            Trending Now
          </h2>
        </div>
        
        <Link 
          href="/all-products" 
          className="group flex items-center gap-1 text-sm font-bold text-blue-600 hover:text-amazon-orange transition-colors"
        >
          See more
          <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-6">
        {items.map((product) => (
          <div 
            key={product.id} 
            className="transform transition-all duration-300 hover:-translate-y-1"
          >
            <ProductCard product={product} />
          </div>
        ))}
      </div>

      {/* Trust Badge/Banner (Optional Amazon-style addition) */}
      <div className="mt-10 bg-white border border-amazon-borderGray p-4 rounded-lg flex flex-wrap items-center justify-around gap-4 shadow-sm">
        <div className="flex items-center gap-2 text-xs font-bold text-amazon-mutedText uppercase tracking-widest">
          <span className="text-amazon-success text-lg font-black italic">✓</span>
          Fast Delivery
        </div>
        <div className="h-4 w-[1px] bg-amazon-borderGray hidden md:block" />
        <div className="flex items-center gap-2 text-xs font-bold text-amazon-mutedText uppercase tracking-widest">
          <span className="text-amazon-orange text-lg font-black italic">★</span>
          Top Quality
        </div>
        <div className="h-4 w-[1px] bg-amazon-borderGray hidden md:block" />
        <div className="flex items-center gap-2 text-xs font-bold text-amazon-mutedText uppercase tracking-widest">
          <span className="text-amazon-darkBlue text-lg font-black">↺</span>
          Easy Returns
        </div>
      </div>
    </section>
  );
}