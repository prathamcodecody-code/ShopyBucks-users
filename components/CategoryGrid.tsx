"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";

type Category = {
  id: number;
  name: string;
  slug: string;
  image: string | null;
};

export default function CategoryGrid() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    api
      .get("/categories/public")
      .then((res) => {
        setCategories(res.data);
        setError(false);
      })
      .catch((err) => {
        console.error("Failed to load categories:", err);
        setError(true);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <section className="py-8 text-center">
        <div className="flex justify-center gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="flex flex-col items-center">
              {/* Reduced skeleton size */}
              <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-gray-200 animate-pulse" />
              <div className="mt-3 h-3 w-14 bg-gray-200 rounded animate-pulse" />
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-12 text-center text-red-600 font-bold">
        Failed to load categories. Please try again later.
      </section>
    );
  }

  if (categories.length === 0) {
    return (
      <section className="py-12 text-center text-genz-muted font-bold">
        No categories available.
      </section>
    );
  }

  return (
    <section className="bg-genz-bg py-6 md:py-10 px-4 sm:px-6 md:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Adjusted gaps for smaller items */}
        <div className="flex flex-nowrap overflow-x-auto gap-6 md:gap-10 lg:gap-12 pb-4 no-scrollbar snap-x scroll-smooth">
          {categories.map((c) => (
            <Link
              key={c.id}
              href={`/all-products?categoryId=${c.id}`}
              className="flex flex-col items-center group cursor-pointer flex-shrink-0 snap-center"
            >
              {/* IMAGE: REDUCED SIZE 
                  Mobile: 20x20 (w-20 h-20)
                  Desktop: 28x28 (md:w-28 md:h-28)
              */}
              <div className="relative w-20 h-20 md:w-28 md:h-28 rounded-full overflow-hidden bg-genz-card border-2 border-genz-border group-hover:border-genz-accent transition-all duration-500 shadow-sm">
                {c.image ? (
                  <img
                    src={`${process.env.NEXT_PUBLIC_API_URL}${c.image}`}
                    alt={c.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-all duration-700"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      const parent = target.parentElement;
                      if (parent) {
                        parent.innerHTML = `<div class="w-full h-full flex items-center justify-center bg-genz-accent/10 text-genz-accent text-xl font-black">${c.name.charAt(0).toUpperCase()}</div>`;
                      }
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-genz-accent/10 text-genz-accent text-xl font-black">
                    {c.name.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>

              {/* LABEL: Adjusted margin and font size */}
              <div className="mt-3 text-center">
                <h3 className="text-[10px] md:text-xs font-black text-genz-ink uppercase tracking-widest group-hover:text-genz-accent transition-colors">
                  {c.name}
                </h3>
                <div className="mt-1.5 h-0.5 w-0 bg-genz-accent mx-auto rounded-full group-hover:w-full transition-all duration-300" />
              </div>
            </Link>
          ))}
        </div>
      </div>

      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </section>
  );
}
