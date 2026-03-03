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
    <section className="bg-genz-bg pt-10 pb-10 px-4 sm:px-6">
      {/* Updated to match the 1600px width of your other 5-column sections */}
      <div className="max-w-[1600px] mx-auto">
        
        {/* HEADER: Precise and High-Contrast */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 md:mb-12 gap-4">
          <div className="space-y-1">
            <p className="text-genz-accent font-black text-[10px] uppercase tracking-[0.4em] mb-1">
              Curated Series
            </p>
            <h2 className="text-3xl md:text-5xl font-black text-genz-ink tracking-tighter uppercase italic leading-none">
              Our <span className="text-genz-accent">Collections</span>
            </h2>
          </div>
        </div>

        {/* GRID: 2xMobile, 3xTablet, 5xPC Layout */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-5">
          {collections.map((item) => (
            <div
              key={item.id}
              onClick={() => item.linkUrl && router.push(item.linkUrl)}
              className="group cursor-pointer rounded-lg overflow-hidden bg-white border border-genz-border transition-all duration-500 hover:border-genz-accent hover:shadow-xl hover:shadow-genz-accent/5"
            >
              {/* IMAGE CONTAINER: Square aspect ratio to match your new smaller card vibe */}
              <div className="relative aspect-square bg-genz-bg overflow-hidden">
                <img
                  src={`${process.env.NEXT_PUBLIC_API_URL}${item.imageUrl}`}
                  alt={item.title || "Collection"}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                />
                
                {/* Visual Interaction Overlay */}
                <div className="absolute inset-0 bg-genz-ink/0 group-hover:bg-genz-ink/20 transition-colors duration-500" />
                
                {/* Floating "View" Icon - Fixed Link logic */}
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300 z-10">
                  <div className="bg-white p-2 rounded-full shadow-lg text-genz-accent border border-genz-accent/10">
                    <ArrowUpRight size={14} strokeWidth={3} />
                  </div>
                </div>
              </div>

              {/* CONTENT AREA: Magazine-style typography */}
              <div className="p-3 md:p-4 text-center bg-white border-t border-genz-border">
                {item.title && (
                  <h3 className="font-black text-[11px] md:text-[13px] text-genz-ink uppercase tracking-tight group-hover:text-genz-accent transition-colors line-clamp-1">
                    {item.title}
                  </h3>
                )}
                {item.subtitle && (
                  <p className="text-[8px] md:text-[9px] font-bold text-genz-muted uppercase tracking-[0.2em] mt-1 opacity-70 line-clamp-1">
                    {item.subtitle}
                  </p>
                )}
                
                {/* Interaction Line */}
                <div className="mt-3 flex justify-center">
                  <div className="h-[2px] w-3 bg-genz-border group-hover:w-8 group-hover:bg-genz-accent transition-all duration-500 rounded-full" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
