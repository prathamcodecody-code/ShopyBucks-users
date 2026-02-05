"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import axios from "axios";

type HomepageSection = {
  id: number;
  type: "HERO";
  imageUrl: string;
  title?: string;
  subtitle?: string;
  linkUrl?: string;
  buttonText?: string;
};

export default function HeroCarousel() {
  const [slides, setSlides] = useState<HomepageSection[]>([]);
  const [index, setIndex] = useState(0);
  const router = useRouter();

  useEffect(() => {
    axios
      .get(`${process.env.NEXT_PUBLIC_API_URL}/homepage`, {
        params: { target: "WEB" },
      })
      .then((res) => {
        const heroes = res.data.filter((s: any) => s.type === "HERO");
        setSlides(heroes);
      })
      .catch(() => setSlides([]));
  }, []);

  useEffect(() => {
    if (!slides.length) return;
    const timer = setInterval(
      () => setIndex((i) => (i + 1) % slides.length),
      5000
    );
    return () => clearInterval(timer);
  }, [slides]);

  if (!slides.length) return null;

  const prev = () => setIndex((i) => (i === 0 ? slides.length - 1 : i - 1));
  const next = () => setIndex((i) => (i + 1) % slides.length);

  return (
    <div className="w-full bg-genz-bg py-4 md:py-6 px-4 sm:px-6 md:px-8">
      <div className="max-w-7xl mx-auto">
        
        <div className="relative w-full overflow-hidden rounded-genz bg-genz-card border border-genz-border shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
          
          {/* HEIGHT UPDATED: From [280/520] to [200/400] for a sleeker look */}
          <div className="relative h-[200px] sm:h-[300px] md:h-[400px]">
            {slides.map((slide, i) => (
              <div
                key={slide.id}
                className={`absolute inset-0 transition-all duration-1000 ease-in-out
                  ${i === index ? "opacity-100 scale-100 z-10" : "opacity-0 scale-105 z-0"}`}
              >
                <Image
                  src={`${process.env.NEXT_PUBLIC_API_URL}${slide.imageUrl}`}
                  alt={slide.title || "Hero banner"}
                  unoptimized
                  fill
                  priority={i === 0}
                  className="object-cover"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-genz-ink/70 via-transparent to-transparent md:bg-gradient-to-r md:from-genz-ink/60 md:via-genz-ink/10 md:to-transparent" />

                {/* TEXT CONTENT: Font sizes slightly reduced to match new height */}
                <div className="absolute left-6 md:left-16 bottom-8 md:top-1/2 md:-translate-y-1/2 text-white max-w-lg z-20">
                  {slide.title && (
                    <h2 className="text-2xl md:text-4xl font-black mb-2 tracking-tighter uppercase leading-none">
                      {slide.title}
                    </h2>
                  )}
                  {slide.subtitle && (
                    <p className="mb-4 text-white/80 text-xs md:text-base font-medium max-w-xs md:max-w-sm">
                      {slide.subtitle}
                    </p>
                  )}
                  {slide.linkUrl && (
                    <button
                      onClick={() => router.push(slide.linkUrl!)}
                      className="bg-white text-genz-ink px-6 py-2.5 md:px-8 md:py-3 rounded-full font-bold text-[10px] md:text-xs uppercase tracking-wider hover:scale-105 active:scale-95 transition-all shadow-xl"
                    >
                      {slide.buttonText || "Shop Now"}
                    </button>
                  )}
                </div>
              </div>
            ))}

            <button 
              onClick={prev} 
              className="absolute left-4 top-1/2 -translate-y-1/2 z-30 w-9 h-9 md:w-11 md:h-11 flex items-center justify-center rounded-full bg-white/10 backdrop-blur-md text-white border border-white/20 hover:bg-white hover:text-genz-ink transition-all active:scale-90"
              aria-label="Previous slide"
            >
              <ChevronLeft size={18} className="md:w-5 md:h-5" />
            </button>
            
            <button 
              onClick={next} 
              className="absolute right-4 top-1/2 -translate-y-1/2 z-30 w-9 h-9 md:w-11 md:h-11 flex items-center justify-center rounded-full bg-white/10 backdrop-blur-md text-white border border-white/20 hover:bg-white hover:text-genz-ink transition-all active:scale-90"
              aria-label="Next slide"
            >
              <ChevronRight size={18} className="md:w-5 md:h-5" />
            </button>

            <div className="absolute bottom-4 right-6 md:right-16 z-30 flex gap-2">
              {slides.map((_, i) => (
                <div 
                  key={i} 
                  className={`h-1 rounded-full transition-all duration-500 ${i === index ? 'w-8 bg-white' : 'w-2 bg-white/30'}`}
                />
              ))}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
