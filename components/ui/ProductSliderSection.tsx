"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRef } from "react";
import ProductCard from "@/components/ProductCard";
import { Product } from "@/lib/product";

type ProductListSection = {
  id: number;
  title?: string;
  products: Product[];
};

export default function ProductSliderSection({
  section,
}: {
  section: ProductListSection;
}) {
  const sliderRef = useRef<HTMLDivElement>(null);

  if (!section.products?.length) return null;

  const scroll = (dir: "left" | "right") => {
    if (!sliderRef.current) return;
    // Scroll amount matches the card width (280px) + gap (24px)
    const amount = dir === "left" ? -304 : 304;
    sliderRef.current.scrollBy({ left: amount, behavior: "smooth" });
  };

  return (
    /* OUTER WRAPPER: Matches our site-wide px-4/8 and bg-genz-bg */
    <section className="bg-genz-bg py-12 px-4 sm:px-6 md:px-8">
      <div className="max-w-7xl mx-auto">
        
        {/* HEADER: Updated to Gen Z Bold Style */}
        <div className="flex items-center justify-between mb-8">
          {section.title && (
            <div className="space-y-1">
              <p className="text-genz-accent font-black text-[10px] uppercase tracking-[0.3em]">
                Discover
              </p>
              <h2 className="text-2xl md:text-4xl font-black text-genz-ink tracking-tighter uppercase">
                {section.title}
              </h2>
            </div>
          )}

          {/* CUSTOM NAVIGATION: Pill-shaped glassmorphism buttons */}
          <div className="flex gap-3">
            <button
              onClick={() => scroll("left")}
              className="w-10 h-10 flex items-center justify-center rounded-full border border-genz-border bg-white shadow-sm hover:bg-genz-accent hover:text-white transition-all active:scale-90"
              aria-label="Scroll Left"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={() => scroll("right")}
              className="w-10 h-10 flex items-center justify-center rounded-full border border-genz-border bg-white shadow-sm hover:bg-genz-accent hover:text-white transition-all active:scale-90"
              aria-label="Scroll Right"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        {/* SLIDER CONTAINER: 
            1. flex-nowrap prevents cards from stacking.
            2. no-scrollbar hides the bar while allowing swipe.
            3. snap-x makes the scrolling feel high-end.
        */}
        <div
          ref={sliderRef}
          className="flex flex-nowrap gap-6 overflow-x-auto no-scrollbar pb-8 snap-x scroll-smooth"
        >
          {section.products.map((product) => (
            /* FIX: Using w-[280px] instead of min-w ensures ALL cards 
               have the exact same width, preventing size inconsistencies */
            <div 
              key={product.id} 
              className="w-[280px] flex-shrink-0 snap-center"
            >
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      </div>

      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </section>
  );
}