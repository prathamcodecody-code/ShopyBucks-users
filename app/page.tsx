"use client";

import HeroCarousel from "@/components/HeroCarousel";
import CategoryGrid from "@/components/CategoryGrid";
import TrendingNow from "@/components/TrendingSection";
import NewArrivals from "@/components/NewArrivals";
import HomeFilter from "@/components/Home/HomeFilter";
import ProductCard from "@/components/ProductCard";
import TopCategories from "@/components/TopCategories";
import { api } from "@/lib/api";
import { useState } from "react";

type Product = {
  id: number;
  title: string;
  price: number | string;
  img1?: string;
  slug?: string;
  category?: { 
    id?: number; 
    name: string; 
    slug?: string; 
  };
};

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);

  const applyFilters = async (filter: any) => {
    const params: any = {};

    if (filter.categoryId) params.categoryId = filter.categoryId;
    if (filter.price) {
      const [min, max] = filter.price.split("-");
      params.minPrice = min;
      params.maxPrice = max;
    }
    if (filter.sort) params.sort = filter.sort;

    const res = await api.get("/products", { params });
    setProducts(res.data?.products || []);
  };

  return (
    <div className="w-full">

      {/* HERO */}
      <section className="relative w-full overflow-hidden mb-16">
        <HeroCarousel />
      </section>

      {/* MAIN CONTENT */}
      <div className="relative z-10">
<section className="mt-15 py-10 bg-amazon-orange to-amazon-orange">
<div className="max-w-7xl mx-auto px-6">
<TopCategories />
</div>
</section>

        {/* FILTER */}
        <section className="max-w-7xl mx-auto px-6 mt-6">
          <HomeFilter onFilter={applyFilters} />
        </section>

        {/* FILTERED RESULTS */}
        {products.length > 0 && (
          <section className="max-w-7xl mx-auto px-6 mt-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {products.map((p) => (
                <ProductCard key={p.id} product={p as any} />
              ))}
            </div>
          </section>
        )}

        {/* DEFAULT CONTENT */}
        {products.length > 0 && (
          <>
            {/* CATEGORIES */}
            <section className="max-w-7xl mx-auto px-6 mt-20">
              <CategoryGrid />
            </section>

            {/* TRENDING */}
            <section className="mt-20 py-16 bg-gradient-to-r from-purple-600 via-purple-500 to-purple-600">
  <div className="max-w-7xl mx-auto px-6">
    <TrendingNow />
  </div>
</section>

            {/* NEW ARRIVALS */}
            <section className="max-w-7xl mx-auto px-6 mt-20 mb-20">
              <NewArrivals />
            </section>
          </>
        )}
      </div>
    </div>
  );
}
