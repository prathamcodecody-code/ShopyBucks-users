"use client";

import Link from "next/link";

export default function CategoryGrid() {
  const categories = [
   { id: 2, title: "Women", image: "/categories/women.jpg" },
    { id: 1, title: "Men", image: "/categories/men.jpg" },
    { id: 7, title: "Kids", image: "/categories/kids.jpg" },
    { id: 4, title: "Sports", image: "/categories/sports.png" },
    { id: 3, title: "Beauty", image: "/categories/beauty.png" },
    { id: 9, title: "Electronics", image: "/categories/electronics.png" },
  ];

  return (
    <section className="bg-genz-bg py-8 md:py-12 px-4 sm:px-6 md:px-8">
      <div className="max-w-7xl mx-auto">
          <div className="flex flex-nowrap overflow-x-auto gap-8 md:gap-14 lg:gap-20 pb-6 no-scrollbar snap-x scroll-smooth">
          {categories.map((c) => (
            <Link
              key={c.title}
              href={`/all-products?categoryId=${c.id}`}
              className="flex flex-col items-center group cursor-pointer flex-shrink-0 snap-center"
            >
              {/* CIRCULAR IMAGE */}
              <div className="relative w-24 h-24 sm:w-32 sm:h-32 md:w-36 md:h-36 rounded-full overflow-hidden bg-genz-card border-[3px] border-genz-border group-hover:border-genz-accent transition-all duration-500 shadow-sm group-hover:shadow-[0_20px_50px_rgba(139,92,246,0.15)]">
                <img
                  src={c.image}
                  alt={c.title}
                  className="w-full h-full object-cover grayscale-[20%] group-hover:grayscale-0 group-hover:scale-110 transition-all duration-700 ease-out"
                />
                <div className="absolute inset-0 bg-genz-ink/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>

              {/* LABEL */}
              <div className="mt-5 text-center">
                <h3 className="text-xs md:text-sm font-black text-genz-ink uppercase tracking-widest group-hover:text-genz-accent transition-colors">
                  {c.title}
                </h3>
                <div className="mt-2 h-0.5 w-0 bg-genz-accent mx-auto rounded-full group-hover:w-full transition-all duration-300" />
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Tailwind Custom Utility Style for hiding scrollbars */}
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

