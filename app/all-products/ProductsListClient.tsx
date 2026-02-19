"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import ProductCard from "@/components/ProductCard";
import FiltersSidebar from "@/components/Filters/FiltersSidebar";
import { api } from "@/lib/api";
import { Product } from "@/lib/product";

export default function ProductsListClient() {
  const searchParams = useSearchParams();

  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const [sort, setSort] = useState(
    searchParams.get("sort") || "relevance"
  );

  const categoryId = searchParams.get("categoryId") || "";

  const loadProducts = async () => {
    try {
      setLoading(true);

      const params: any = {
        limit: 100, // FIX 1: Explicitly set a high limit to get more than 20
      };

      searchParams.forEach((value, key) => {
        params[key] = value;
      });

      if (sort !== "relevance") params.sort = sort;
      else delete params.sort;

      const res = await api.get("/products", { params });
      const data = res.data;

      let list: Product[] = [];

      if (Array.isArray(data)) {
        list = data;
        setTotal(list.length);
      } else if (Array.isArray(data?.products)) {
        list = data.products;
        setTotal(data.total || list.length);
      }

      setProducts(list);
    } catch (error) {
      console.error("Error fetching products:", error);
      setProducts([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, [searchParams, sort]);

  // FIX 2: Correct Naming Logic
  // Only use the first product's category name if we are actually filtering by category
  const categoryName = categoryId 
    ? (products[0]?.category?.name || "Category Products") 
    : "All Products";

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {categoryName}
          </h1>
          {!loading && (
            <p className="text-sm text-gray-500 mt-1">
              {total} Products Found
            </p>
          )}
        </div>

        <select
          className="border border-gray-300 rounded-lg px-4 py-2 text-sm bg-white outline-none focus:ring-2 focus:ring-black"
          value={sort}
          onChange={(e) => setSort(e.target.value)}
        >
          <option value="relevance">Relevance</option>
          <option value="newest">Newest First</option>
          <option value="low_to_high">Price: Low to High</option>
          <option value="high_to_low">Price: High to Low</option>
        </select>
      </div>

      <div className="grid grid-cols-12 gap-8">
        <aside className="col-span-12 md:col-span-3">
          <FiltersSidebar categoryId={categoryId} />
        </aside>

        <main className="col-span-12 md:col-span-9">
          {loading && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="h-72 bg-gray-100 animate-pulse rounded-xl"
                />
              ))}
            </div>
          )}

          {!loading && products.length === 0 && (
            <div className="text-center py-20">
              <p className="text-lg font-semibold text-gray-700">
                No products found
              </p>
              <p className="text-gray-500 mt-2">
                Try adjusting filters or explore other categories
              </p>
            </div>
          )}

          {!loading && products.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              {products.map((p) => (
                <ProductCard key={p.id} product={p as any} />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
