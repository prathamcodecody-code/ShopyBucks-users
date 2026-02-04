"use client";

import { useRouter } from "next/navigation";

type BannerSectionProps = {
  banners: {
    id: number;
    imageUrl: string;
    title?: string;
    subtitle?: string;
    linkUrl?: string;
    buttonText?: string;
  }[];
};

export default function BannerSection({ banners }: BannerSectionProps) {
  const router = useRouter();

  if (!banners.length) return null;

  return (
    <section className="bg-genz-bg py-12 px-4 sm:px-6 md:px-8">
      <div className="max-w-7xl mx-auto space-y-10">
        {banners.map((banner) => (
          <div
            key={banner.id}
            className="group relative w-full h-[240px] md:h-[350px] rounded-genz overflow-hidden border border-genz-border bg-genz-card shadow-[0_8px_30px_rgb(0,0,0,0.04)]"
          >
            {/* 1. SECURE IMAGE HANDLING: Using <img> to bypass Next.js upstream private IP errors */}
            <img
              src={`${process.env.NEXT_PUBLIC_API_URL}${banner.imageUrl}`}
              alt={banner.title || "Promotion Banner"}
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
            />

            {/* 2. OVERLAY: Softer gradient for a premium Gen Z vibe */}
            <div className="absolute inset-0 bg-gradient-to-r from-genz-ink/60 via-genz-ink/20 to-transparent" />

            {/* 3. CONTENT AREA: Clean, Bold, and Responsive */}
            {(banner.title || banner.subtitle) && (
              <div className="absolute inset-0 flex flex-col justify-center px-8 md:px-20 text-white z-10">
                {banner.title && (
                  <h2 className="text-3xl md:text-5xl font-black mb-3 tracking-tighter uppercase leading-tight max-w-2xl">
                    {banner.title}
                  </h2>
                )}
                
                {banner.subtitle && (
                  <p className="text-sm md:text-lg mb-8 text-white/80 font-medium max-w-md">
                    {banner.subtitle}
                  </p>
                )}

                {banner.linkUrl && (
                  <button
                    onClick={() => router.push(banner.linkUrl!)}
                    className="w-fit bg-white text-genz-ink px-8 py-3.5 rounded-full font-black text-xs uppercase tracking-widest shadow-xl hover:bg-genz-accent hover:text-white active:scale-95 transition-all duration-300"
                  >
                    {banner.buttonText || "Shop Collection"}
                  </button>
                )}
              </div>
            )}
            
            {/* Subtle Glassmorphism Detail for Gen Z "Aesthetic" */}
            <div className="absolute bottom-4 right-4 bg-white/10 backdrop-blur-md border border-white/20 px-4 py-1.5 rounded-full hidden md:block">
               <span className="text-[10px] font-bold text-white uppercase tracking-widest opacity-60">Verified Drop</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}