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
    
    // Adjusted scroll amount to match approximately one full "view" of 5 items
    const scrollAmount = sliderRef.current.clientWidth * 0.9; 
    const amount = dir === "left" ? -scrollAmount : scrollAmount;
    
    sliderRef.current.scrollBy({ left: amount, behavior: "smooth" });
  };

  return (
    <section className="bg-genz-bg pt-1 pb-1 px-4 sm:px-6">
      {/* Increased max-width for 5-column consistency */}
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

          {/* NAVIGATION */}
          <div className="flex gap-2 mb-1">
            <button
              onClick={() => scroll("left")}
              className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-full border-2 border-genz-border bg-white text-genz-ink shadow-sm hover:border-genz-accent hover:text-genz-accent transition-all active:scale-90"
              aria-label="Scroll Left"
            >
              <ChevronLeft size={20} strokeWidth={3} />
            </button>
            <button
              onClick={() => scroll("right")}
              className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-full border-2 border-genz-border bg-white text-genz-ink shadow-sm hover:border-genz-accent hover:text-genz-accent transition-all active:scale-90"
              aria-label="Scroll Right"
            >
              <ChevronRight size={20} strokeWidth={3} />
            </button>
          </div>
        </div>

        {/* SLIDER CONTAINER */}
        <div
          ref={sliderRef}
          className="flex flex-nowrap gap-3 md:gap-5 overflow-x-auto no-scrollbar pb-10 snap-x scroll-smooth"
        >
          {section.products.map((product) => (
            <div 
              key={product.id} 
              /* Updated widths:
                 Mobile: w-[180px] (~2 items visible)
                 Tablet: md:w-[250px] (~3-4 items visible)
                 Large Desktop: xl:w-[calc(20%-16px)] (Exactly 5 items visible)
              */
              className="w-[180px] md:w-[250px] xl:w-[calc(20%-16px)] flex-shrink-0 snap-start transition-transform duration-500 hover:-translate-y-1"
            >
              <ProductCard product={product} />
            </div>
          ))}
          
          {/* SNEAK PEEK CARD (Matches widths above) */}
          <div className="w-[180px] md:w-[250px] xl:w-[calc(20%-16px)] flex-shrink-0 snap-start flex items-center justify-center">
             <button className="flex flex-col items-center gap-4 group h-full justify-center border border-dashed border-genz-border rounded-lg w-full py-20 bg-white/50">
                <div className="w-12 h-12 rounded-full border-2 border-dashed border-genz-border flex items-center justify-center group-hover:border-genz-accent group-hover:bg-genz-softAccent transition-all duration-300">
                   <ChevronRight size={20} className="text-genz-muted group-hover:text-genz-accent" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-genz-muted group-hover:text-genz-ink">View All</span>
             </button>
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
