"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { ArrowRight } from "lucide-react";

type Category = {
  id: number;
  name: string;
};

type Product = {
  id: number;
  img1?: string;
};

export default function TopCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryProducts, setCategoryProducts] = useState<Record<number, Product[]>>({});

  useEffect(() => {
    api.get("/categories").then((res) => setCategories(res.data));
  }, []);

  useEffect(() => {
    categories.forEach(async (cat) => {
      const res = await api.get("/products", {
        params: { categoryId: cat.id, limit: 1 },
      });

      setCategoryProducts((prev) => ({
        ...prev,
        [cat.id]: res.data.products || [],
      }));
    });
  }, [categories]);

  return (
    <section className="bg-genz-bg py-16 px-4 sm:px-6 md:px-8">
      <div className="max-w-7xl mx-auto">
        
        {/* HEADER: Minimalist and Bold */}
        <div className="mb-12">
          <p className="text-genz-accent font-black text-xs uppercase tracking-[0.3em] mb-2">
            Curated Picks
          </p>
          <h2 className="text-3xl md:text-5xl font-black text-genz-ink tracking-tighter uppercase leading-tight">
            Top <span className="text-genz-accent">Sellers</span>
          </h2>
        </div>

        {/* GRID: Bento-style Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {categories.map((cat) => {
            const product = categoryProducts[cat.id]?.[0];

            return (
              <Link
                key={cat.id}
                href={`/all-products?categoryId=${cat.id}`}
                className="group relative bg-white border border-genz-border rounded-genz overflow-hidden hover:shadow-[0_20px_50px_rgba(0,0,0,0.05)] transition-all duration-500 flex flex-col h-full"
              >
                {/* IMAGE CONTAINER: Aspect ratio locked to 4/5 for consistency */}
                <div className="relative aspect-[4/5] bg-genz-bg flex items-center justify-center p-8 overflow-hidden">
                  {product?.img1 ? (
                    <img
                      src={`${process.env.NEXT_PUBLIC_API_URL}/uploads/products/${product.img1}`}
                      alt={cat.name}
                      /* FIX: object-contain prevents the image from looking "too big" */
                      className="max-w-full max-h-full object-contain transition-transform duration-700 group-hover:scale-110"
                    />
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-genz-muted">
                      <div className="w-12 h-12 bg-genz-border rounded-full animate-pulse" />
                      <span className="text-[10px] font-bold uppercase tracking-widest">No Visual</span>
                    </div>
                  )}
                  
                  {/* Subtle Badge */}
                  <div className="absolute top-4 left-4 bg-white/80 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-black text-genz-ink border border-genz-border tracking-widest uppercase">
                    Best Seller
                  </div>
                </div>

                {/* CONTENT AREA: Focused on clean typography */}
                <div className="p-6 flex flex-col flex-1 justify-between bg-white">
                  <div>
                    <h3 className="text-xl font-black text-genz-ink tracking-tight uppercase group-hover:text-genz-accent transition-colors">
                      {cat.name}
                    </h3>
                    <p className="text-xs font-bold text-genz-muted uppercase tracking-widest mt-1">
                      {categoryProducts[cat.id]?.length || 0} ITEMS
                    </p>
                  </div>

                  <div className="mt-6 flex items-center justify-between">
                    <span className="text-xs font-black text-genz-ink uppercase tracking-widest group-hover:translate-x-1 transition-transform flex items-center gap-2">
                      Shop Collection <ArrowRight size={14} className="text-genz-accent" />
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
