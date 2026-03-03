"use client";

import { ChevronRight } from "lucide-react";
import { useRef } from "react";
import ProductCard from "@/components/ProductCard";
import Link from "next/link";
import { Product } from "@/lib/product";

type ProductListSection = {
  id: number;
  title?: string;
  products: Product[];
  slug?: string; // Added slug for the Link
};

export default function ProductSliderSection({
  section,
}: {
  section: ProductListSection;
}) {
  const sliderRef = useRef<HTMLDivElement>(null);

  if (!section.products?.length) return null;

  return (
    <section className="bg-genz-bg pt-1 pb-1 px-4 sm:px-6">
      <div className="max-w-[1600px] mx-auto">
        
        {/* HEADER */}
        <div className="flex items-end justify-between mb-10">
          {section.title && (
            <div className="space-y-1">
              <p className="text-genz-accent font-black text-[10px] uppercase tracking-[0.4em] mb-1">
                Curated Drop
              </p>
              <h2 className="text-3xl md:text-5xl font-black text-genz-ink tracking-tighter uppercase italic leading-none">
                {section.title}
              </h2>
            </div>
          )}

          {/* NEW TOP NAVIGATION: VIEW ALL */}
          <Link 
            href={`/all-products?categoryId=${section.id}`} // Replace with your actual routing logic
            className="group flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-genz-muted hover:text-genz-accent transition-all pb-1"
          >
            View All
            <div className="bg-white p-1.5 rounded-full border border-genz-border group-hover:bg-genz-accent group-hover:border-genz-accent group-hover:text-white transition-all shadow-sm">
              <ChevronRight size={14} strokeWidth={3} />
            </div>
          </Link>
        </div>

        {/* SLIDER CONTAINER */}
        <div
          ref={sliderRef}
          className="flex flex-nowrap gap-3 md:gap-5 overflow-x-auto no-scrollbar pb-10 snap-x scroll-smooth"
        >
          {section.products.map((product) => (
            <div 
              key={product.id} 
              className="w-[180px] md:w-[250px] xl:w-[calc(20%-16px)] flex-shrink-0 snap-start transition-transform duration-500 hover:-translate-y-1"
            >
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      </div>

      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </section>
  );
}
