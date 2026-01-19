"use client";

import Link from "next/link";

export default function CategoryGrid() {
  const categories = [
    { title: "Women", image: "/categories/women.jpg" },
    { title: "Men", image: "/categories/men.jpg" },
    { title: "Kids", image: "/categories/kids.jpg" },
    { title: "Sports", image: "/categories/sports.png" },
    { title: "Beauty", image: "/categories/beauty.png" },
    { title: "Electronics", image: "/categories/electronics.png" },
  ];

  return (
    <section className="mt-16 mb-20 max-w-[1244px] mx-auto px-4">
      {/* Centered Heading */}
      <div className="text-center mb-12 space-y-2">
        <h2 className="text-3xl font-black text-amazon-text uppercase tracking-tighter">
          Shop By <span className="text-[#4F1271]">Category</span>
        </h2>
        <div className="w-20 h-1 bg-amazon-orange mx-auto rounded-full" />
      </div>

      {/* Centered Flex Grid */}
      <div className="flex flex-wrap justify-center gap-8 md:gap-12 lg:gap-16">
        {categories.map((c) => (
          <Link
            key={c.title}
            href={`/all-products?category=${c.title}`}
            className="flex flex-col items-center group cursor-pointer"
          >
            {/* Circular Image Container (Flipkart Style) */}
            <div className="relative w-28 h-28 md:w-36 md:h-36 rounded-full overflow-hidden bg-gray-50 border-4 border-transparent group-hover:border-amazon-orange transition-all duration-300 shadow-sm group-hover:shadow-xl">
              <img
                src={c.image}
                alt={c.title}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              {/* Subtle Overlay */}
              <div className="absolute inset-0 bg-[#4F1271]/5 group-hover:bg-transparent transition-colors" />
            </div>

            {/* Label */}
            <div className="mt-4 text-center">
              <h3 className="text-sm md:text-base font-black text-amazon-text uppercase tracking-tighter group-hover:text-[#4F1271] transition-colors">
                {c.title}
              </h3>
              <p className="text-[10px] font-bold text-amazon-orange uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all translate-y-1 group-hover:translate-y-0">
                Explore
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
