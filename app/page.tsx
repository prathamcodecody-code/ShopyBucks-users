"use client";

import HeroCarousel from "@/components/HeroCarousel";
import CategoryGrid from "@/components/CategoryGrid";
import TrendingNow from "@/components/TrendingSection";
import NewArrivals from "@/components/NewArrivals";
import HomeFilter from "@/components/Home/HomeFilter"; // This can be your new Sidebar/Meesho filter
import ProductCard from "@/components/ProductCard";
import TopCategories from "@/components/TopCategories";
import { api } from "@/lib/api";
import { useState } from "react";
import { Product } from "@/lib/product";

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [hasFiltered, setHasFiltered] = useState(false);

  const applyFilters = async (filter: any) => {
    const params: any = {};

    if (filter.categoryId) params.categoryId = filter.categoryId;
    if (filter.productTypes?.length > 0) params.productTypes = filter.productTypes.join(',');
    
    if (filter.price) {
      const [min, max] = filter.price.split("-");
      params.minPrice = min;
      params.maxPrice = max;
    }
    if (filter.sort) params.sort = filter.sort;

    try {
      const res = await api.get("/products", { params });
      setProducts(res.data?.products || []);
      setHasFiltered(true);
    } catch (error) {
      console.error("Filter error", error);
    }
  };

  return (
    <div className="w-full bg-white">
      {/* 1. HERO SECTION */}
      <section className="relative w-full overflow-hidden mb-16">
        <HeroCarousel />
      </section>

      {/* 2. CATEGORY QUICK LINKS */}
      <section className="max-w-7xl mx-auto px-6 mt-20">
        <CategoryGrid />
      </section>

      {/* 3. TOP CATEGORIES (White version) */}
      <section className="mt-15 py-10 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <TopCategories />
        </div>
      </section>

      {/* 4. TRENDING SECTION (Always visible) */}
      <section className="mt-20 py-16 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <TrendingNow />
        </div>
      </section>

      {/* 5. NEW ARRIVALS (Always visible) */}
      <section className="max-w-7xl mx-auto px-6 mt-20 mb-20">
        <NewArrivals />
      </section>

      <hr className="border-t border-gray-100" />

      {/* 6. FINAL SECTION: BROWSE ALL / FILTER (Meesho Style) */}
      <section className="max-w-7xl mx-auto px-6 mt-20 mb-32">
        <h2 className="text-3xl font-bold text-gray-900 mb-8">Products For You</h2>
        
        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar Filter */}
          <aside className="w-full md:w-1/4">
            <HomeFilter onFilter={applyFilters} />
          </aside>

          {/* Results Grid */}
          <main className="w-full md:w-3/4">
            {products.length > 0 ? (
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                <p className="text-gray-500">
                  {hasFiltered ? "No products match your filters." : "Use the filters to find specific products."}
                </p>
              </div>
            )}
          </main>
        </div>
      </section>
    </div>
  );
}
