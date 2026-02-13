"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { ArrowRight, Plus } from "lucide-react";

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
    <section className="bg-genz-bg py-12 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        
        {/* HEADER: Tighter and more modern */}
        <div className="flex justify-between items-end mb-10">
          <div>
            <p className="text-genz-accent font-black text-[10px] uppercase tracking-[0.4em] mb-1">
              Top Categories
            </p>
            <h2 className="text-2xl md:text-4xl font-black text-genz-ink tracking-tighter uppercase italic">
              Top <span className="text-genz-accent">Sellers</span>
            </h2>
          </div>
          <Link href="/all-products" className="hidden sm:flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-genz-muted hover:text-genz-accent transition-colors">
            View All <ArrowRight size={14} />
          </Link>
        </div>

        {/* GRID: Adjusted to 2 cols mobile, 4 cols desktop */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {categories.map((cat) => {
            const product = categoryProducts[cat.id]?.[0];

            return (
              <Link
                key={cat.id}
                href={`/all-products?categoryId=${cat.id}`}
                className="group relative bg-white border border-genz-border rounded-genz overflow-hidden transition-all duration-500 flex flex-col h-full"
              >
                {/* IMAGE CONTAINER: Aspect ratio changed to 3/4 for a sleeker look */}
                <div className="relative aspect-[3/4] bg-genz-bg flex items-center justify-center overflow-hidden">
                  {product?.img1 ? (
                    <img
                      src={`${process.env.NEXT_PUBLIC_API_URL}/uploads/products/${product.img1}`}
                      alt={cat.name}
                      /* FIX: object-cover for that premium "filled" look, or contain if you prefer padding */
                      className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-genz-muted">
                      <div className="w-8 h-8 bg-genz-border rounded-full animate-pulse" />
                      <span className="text-[8px] font-bold uppercase tracking-widest">No Visual</span>
                    </div>
                  )}
                  
                  {/* Floating Label Badge */}
                  <div className="absolute top-3 left-3 bg-white px-2 py-0.5 rounded shadow-sm text-[8px] font-black text-genz-ink border border-genz-border tracking-tighter uppercase">
                    Best Seller
                  </div>

                  {/* Hover Overlay Icon */}
                  <div className="absolute inset-0 bg-genz-ink/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                     <div className="bg-white p-2 rounded-full shadow-xl translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                        <Plus className="text-genz-accent" size={18} />
                     </div>
                  </div>
                </div>

                {/* CONTENT AREA: Reduced padding and centered for a clean grid */}
                <div className="p-4 flex flex-col items-center text-center bg-white border-t border-genz-border">
                  <h3 className="text-sm font-black text-genz-ink tracking-tight uppercase group-hover:text-genz-accent transition-colors">
                    {cat.name}
                  </h3>
                  <div className="mt-1 h-0.5 w-0 group-hover:w-8 bg-genz-accent transition-all duration-300" />
                  <p className="text-[9px] font-bold text-genz-muted uppercase tracking-[0.2em] mt-2">
                    {categoryProducts[cat.id]?.length || 0} Drops
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
