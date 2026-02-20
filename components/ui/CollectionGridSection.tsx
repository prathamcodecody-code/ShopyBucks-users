"use client";

import { useRouter } from "next/navigation";
import { ArrowUpRight } from "lucide-react";

type CollectionItem = {
  id: number;
  imageUrl: string;
  title?: string;
  subtitle?: string;
  linkUrl?: string;
};

export default function CollectionGridSection({
  collections,
}: {
  collections: CollectionItem[];
}) {
  const router = useRouter();

  if (!collections.length) return null;

  return (
    <section className="bg-genz-bg pt-1 pb-1 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        
        {/* HEADER: Precise and High-Contrast */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <p className="text-genz-accent font-black text-[10px] uppercase tracking-[0.4em] mb-1">
              Curated Series
            </p>
            <h2 className="text-3xl md:text-5xl font-black text-genz-ink tracking-tighter uppercase italic leading-none">
              Our <span className="text-genz-accent">Collections</span>
            </h2>
          </div>
          <p className="text-genz-muted text-xs md:text-sm font-medium max-w-[280px] leading-relaxed">
            Exclusive drops and seasonal favorites selected for the modern aesthetic.
          </p>
        </div>

        {/* GRID: Sleeker 2xMobile, 4xPC Layout */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {collections.map((item) => (
            <div
              key={item.id}
              onClick={() => item.linkUrl && router.push(item.linkUrl)}
              className="group cursor-pointer rounded-genz overflow-hidden bg-white border border-genz-border transition-all duration-500 hover:border-genz-accent shadow-sm"
            >
              {/* IMAGE CONTAINER: Switched to 3/4 aspect ratio */}
              <div className="relative aspect-[3/4] bg-genz-bg overflow-hidden">
                <img
                  src={`${process.env.NEXT_PUBLIC_API_URL}${item.imageUrl}`}
                  alt={item.title || "Collection"}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                />
                
                {/* Visual Interaction Overlay */}
                <div className="absolute inset-0 bg-genz-ink/0 group-hover:bg-genz-ink/10 transition-colors duration-500" />
                
                {/* Floating "View" Icon */}
                <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                  <div className="bg-white p-2 rounded-full shadow-lg text-genz-accent">
                    <ArrowUpRight size={16} strokeWidth={3} />
                  </div>
                </div>
              </div>

              {/* CONTENT AREA: Magazine-style typography */}
              <div className="p-4 md:p-6 text-center bg-white border-t border-genz-border">
                {item.title && (
                  <h3 className="font-black text-xs md:text-sm text-genz-ink uppercase tracking-wider group-hover:text-genz-accent transition-colors">
                    {item.title}
                  </h3>
                )}
                {item.subtitle && (
                  <p className="text-[9px] md:text-[10px] font-bold text-genz-muted uppercase tracking-[0.2em] mt-2 opacity-70">
                    {item.subtitle}
                  </p>
                )}
                
                {/* The "Gen Z" Interaction Line */}
                <div className="mt-4 flex justify-center">
                  <div className="h-[2px] w-4 bg-genz-border group-hover:w-10 group-hover:bg-genz-accent transition-all duration-500 rounded-full" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

