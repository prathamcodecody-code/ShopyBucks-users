"use client";

import ProductCard from "../ProductCard";
import { Product } from "@/lib/product";
import { ReactNode } from "react";

interface Props {
  title: string;
  products: Product[];
  icon?: ReactNode; // Added icon prop
}

export default function RecommendationSection({ title, products, icon }: Props) {
  if (!products || products.length === 0) return null;

  return (
    <section className="bg-genz-bg pt-6 pb-10 px-4 sm:px-6">
      <div className="max-w-[1600px] mx-auto">
        
        {/* HEADER WITH ICON */}
        <div className="flex items-center gap-4 mb-8">
          {icon && (
            <div className="bg-genz-softAccent p-3 rounded-2xl text-genz-accent shadow-sm">
              {icon}
            </div>
          )}
          <div>
            <p className="text-[10px] font-black text-genz-accent uppercase tracking-[0.4em] mb-1">Personalized</p>
            <h2 className="text-xl md:text-3xl font-black text-genz-ink tracking-tighter uppercase italic leading-none">
              {title.split(' ').slice(0, -1).join(' ')} <span className="text-genz-accent">{title.split(' ').pop()}</span>
            </h2>
          </div>
        </div>

        {/* 5-COLUMN GRID */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4">
          {products.slice(0, 10).map((product) => (
            <div key={product.id} className="h-full">
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}