"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";

type Category = {
  id: number;
  name: string;
};

type Product = {
  id: number;
  img1?: string;
};

export default function TopCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryProducts, setCategoryProducts] = useState<Record<number, Product[]>>({});

  useEffect(() => {
    api.get("/categories").then((res) => setCategories(res.data));
  }, []);

  useEffect(() => {
    categories.forEach(async (cat) => {
      const res = await api.get("/products", {
        params: { categoryId: cat.id, limit: 1 },
      });

      setCategoryProducts((prev) => ({
        ...prev,
        [cat.id]: res.data.products || [],
      }));
    });
  }, [categories]);

  return (
    <section className="mt-10">
      {/* TITLE */}
      <center><h2 className="text-2xl md:text-3xl font-bold text-purple-900 mb-8">
        Top Seller in Categories
      </h2></center>

      {/* GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {categories.map((cat) => {
          const product = categoryProducts[cat.id]?.[0];

          return (
            <Link
              key={cat.id}
              href={`/all-products?categoryId=${cat.id}`}
              className="group rounded-xl bg-white border border-amazon-borderGray overflow-hidden hover:shadow-lg transition-all"
            >
              {/* IMAGE */}
              <div className="relative h-56 bg-gray-100 overflow-hidden">
                {product?.img1 ? (
                  <img
                    src={`${process.env.NEXT_PUBLIC_API_URL}/uploads/products/${product.img1}`}
                    alt={cat.name}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                ) : (
                  <div className="h-full flex items-center justify-center text-gray-400">
                    No Image
                  </div>
                )}
              </div>

              {/* CONTENT */}
              <div className="p-5 space-y-2">
                <h3 className="text-lg font-semibold text-amazon-text">
                  {cat.name}
                </h3>

                <p className="text-sm text-amazon-mutedText">
                  {categoryProducts[cat.id]?.length || 0} products available
                </p>

                <span className="inline-flex items-center gap-1 text-sm font-semibold text-amazon-orange mt-2">
                  Explore
                  <span className="transition-transform group-hover:translate-x-1">
                    →
                  </span>
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
