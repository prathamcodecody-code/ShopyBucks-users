"use client";

import { useRouter } from "next/navigation";

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
    <section className="bg-genz-bg py-12 px-4 sm:px-6 md:px-8">
      <div className="max-w-7xl mx-auto">
        
        {/* OPTIONAL HEADER: Since it's a collection grid, a minimal title helps the vibe */}
        <div className="mb-10 text-left">
          <p className="text-genz-accent font-black text-xs uppercase tracking-[0.3em] mb-2">
            Curated Series
          </p>
          <h2 className="text-2xl md:text-4xl font-black text-genz-ink tracking-tighter uppercase">
            Our <span className="text-genz-accent">Collections</span>
          </h2>
        </div>

        {/* GRID: High-contrast bento-style cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
          {collections.map((item) => (
            <div
              key={item.id}
              onClick={() => item.linkUrl && router.push(item.linkUrl)}
              className="group cursor-pointer rounded-genz overflow-hidden bg-white border border-genz-border hover:shadow-[0_20px_50px_rgba(0,0,0,0.05)] transition-all duration-500"
            >
              {/* IMAGE CONTAINER: Using standard img to bypass private IP errors */}
              <div className="relative aspect-[4/5] bg-genz-bg overflow-hidden">
                <img
                  src={`${process.env.NEXT_PUBLIC_API_URL}${item.imageUrl}`}
                  alt={item.title || "Collection"}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                
                {/* Subtle Overlay for text readability if needed */}
                <div className="absolute inset-0 bg-genz-ink/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>

              {/* CONTENT AREA: Clean typography and high whitespace */}
              <div className="p-5 text-center bg-white border-t border-genz-border">
                {item.title && (
                  <h3 className="font-black text-sm md:text-base text-genz-ink uppercase tracking-tight group-hover:text-genz-accent transition-colors">
                    {item.title}
                  </h3>
                )}
                {item.subtitle && (
                  <p className="text-[10px] md:text-xs font-bold text-genz-muted uppercase tracking-widest mt-1.5 opacity-80">
                    {item.subtitle}
                  </p>
                )}
                
                {/* Gen Z Interaction Bar */}
                <div className="mt-4 h-0.5 w-0 bg-genz-accent mx-auto rounded-full group-hover:w-12 transition-all duration-300" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}