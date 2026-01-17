"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";

const slides = [
  {
    src: "/banner/banner1.jpg",
    title: "New Season Styles",
    subtitle: "Fresh fashion for everyday elegance",
  },
  {
    src: "/banner/banner2.jpg",
    title: "Ethnic & Western Wear",
    subtitle: "Handpicked styles you’ll love",
  },
  {
    src: "/banner/banner3.jpg",
    title: "Trendy Looks",
    subtitle: "Upgrade your wardrobe today",
  },
];

export default function HeroCarousel() {
  const [index, setIndex] = useState(0);
  const router = useRouter();

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % slides.length);
    }, 5000);

    return () => clearInterval(timer);
  }, []);

  const prev = () =>
    setIndex((i) => (i === 0 ? slides.length - 1 : i - 1));

  const next = () =>
    setIndex((i) => (i + 1) % slides.length);

  return (
    <div className="relative w-full overflow-hidden rounded-2xl shadow-lg">
      {/* HEIGHT CONTROL */}
      <div className="relative h-[260px] sm:h-[360px] md:h-[460px]">

        {slides.map((slide, i) => (
          <div
            key={i}
            className={`
              absolute inset-0 transition-opacity duration-700 ease-in-out
              ${i === index ? "opacity-100 z-10" : "opacity-0 z-0"}
            `}
          >
            {/* IMAGE */}
            <Image
              src={slide.src}
              alt={slide.title}
              fill
              priority={i === 0}
              className="object-cover"
            />

            {/* OVERLAY */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-black/20 to-transparent" />

            {/* CONTENT */}
            <div className="absolute left-8 md:left-14 top-1/2 -translate-y-1/2 text-white max-w-md">
              <h2 className="text-2xl md:text-4xl font-bold mb-3 leading-tight">
                {slide.title}
              </h2>
              <p className="text-sm md:text-base mb-6 text-white/90">
                {slide.subtitle}
              </p>

              <button
                onClick={() => router.push("/all-products")}
                className="
                  bg-brandPink hover:bg-brandPinkLight
                  text-white px-6 py-3 rounded-lg
                  font-semibold shadow-md transition
                "
              >
                Shop Now
              </button>
            </div>
          </div>
        ))}

        {/* LEFT ARROW */}
        <button
          aria-label="Previous slide"
          onClick={prev}
          className="
            absolute left-3 top-1/2 -translate-y-1/2 z-20
            bg-white/80 hover:bg-white
            p-2 rounded-full shadow transition
          "
        >
          <ChevronLeft size={20} />
        </button>

        {/* RIGHT ARROW */}
        <button
          aria-label="Next slide"
          onClick={next}
          className="
            absolute right-3 top-1/2 -translate-y-1/2 z-20
            bg-white/80 hover:bg-white
            p-2 rounded-full shadow transition
          "
        >
          <ChevronRight size={20} />
        </button>

        {/* DOTS */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-20">
          {slides.map((_, i) => (
            <button
              key={i}
              aria-label={`Go to slide ${i + 1}`}
              onClick={() => setIndex(i)}
              className={`
                w-3 h-3 rounded-full transition-all
                ${i === index
                  ? "bg-brandPink scale-110"
                  : "bg-white/70 hover:bg-white"}
              `}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
