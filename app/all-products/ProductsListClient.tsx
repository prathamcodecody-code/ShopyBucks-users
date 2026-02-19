"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useSearchParams } from "next/navigation";
import ProductCard from "@/components/ProductCard";
import FiltersSidebar, { FilterState } from "@/components/Filters/FiltersSidebar";
import { api } from "@/lib/api";
import { Product } from "@/lib/product";

export default function ProductsListClient() {
  const searchParams = useSearchParams();

  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState(searchParams.get("sort") || "relevance");

  const categoryId = searchParams.get("categoryId") || "";

  // Keep latest sort in a ref so loadProducts doesn't need it as a dep
  const sortRef = useRef(sort);
  useEffect(() => {
    sortRef.current = sort;
  }, [sort]);

  const loadProducts = useCallback(async (filters: FilterState) => {
    try {
      setLoading(true);

      const params: Record<string, any> = { limit: 100 };

      if (filters.categoryId) params.categoryId = filters.categoryId;
      if (filters.typeId)     params.typeId     = filters.typeId;
      if (filters.subtypeId)  params.subtypeId  = filters.subtypeId;
      if (filters.minPrice)   params.minPrice   = filters.minPrice;
      if (filters.maxPrice)   params.maxPrice   = filters.maxPrice;
      if (filters.stock)      params.stock      = filters.stock;
      if (sortRef.current !== "relevance") params.sort = sortRef.current;

      // Colors & sizes — always send even if empty so backend can clear them
      if (filters.colors && filters.colors.length > 0) {
        params.colors = filters.colors.join(",");
      }
      if (filters.sizes && filters.sizes.length > 0) {
        params.sizes = filters.sizes.join(",");
      }

      // Dynamic attributes
      for (const [slug, values] of Object.entries(filters.attributes || {})) {
        if (values.length) params[slug] = values.join(",");
      }

      const res  = await api.get("/products", { params });
      const data = res.data;

      let list: Product[] = [];
      if (Array.isArray(data)) {
        list = data;
        setTotal(list.length);
      } else if (Array.isArray(data?.products)) {
        list = data.products;
        setTotal(data.total ?? list.length);
      }

      setProducts(list);
    } catch (error) {
      console.error("Error fetching products:", error);
      setProducts([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, []); // ← no deps; uses refs for sort to avoid infinite re-renders

  // Re-fetch when sort changes — use the current filters stored in a ref
  const filtersRef = useRef<FilterState>({
    categoryId: categoryId ? Number(categoryId) : undefined,
    attributes: {},
    colors: [],
    sizes: [],
  });

  useEffect(() => {
    // When sort changes, reload with existing filters
    loadProducts(filtersRef.current);
  }, [sort, loadProducts]);

  // Initial load when categoryId changes
  useEffect(() => {
    const initialFilters: FilterState = {
      categoryId: categoryId ? Number(categoryId) : undefined,
      attributes: {},
      colors: [],
      sizes: [],
    };
    filtersRef.current = initialFilters;
    loadProducts(initialFilters);
  }, [categoryId, loadProducts]);

  // Handle filter changes from sidebar
  const handleFilter = useCallback((filters: FilterState) => {
    filtersRef.current = filters;
    loadProducts(filters);
  }, [loadProducts]);

  const categoryName = categoryId
    ? products[0]?.category?.name || "Category Products"
    : "All Products";

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{categoryName}</h1>
          {!loading && (
            <p className="text-sm text-gray-500 mt-1">{total} Products Found</p>
          )}
        </div>

        <select
          className="border border-gray-300 rounded-lg px-4 py-2 text-sm bg-white outline-none focus:ring-2 focus:ring-purple-600"
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
          <FiltersSidebar
            categoryId={categoryId}
            onFilter={handleFilter}
            initialFilters={{
              categoryId: categoryId ? Number(categoryId) : undefined,
              attributes: {},
              colors: [],
              sizes: [],
            }}
          />
        </aside>

        <main className="col-span-12 md:col-span-9">
          {loading && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-72 bg-gray-100 animate-pulse rounded-xl" />
              ))}
            </div>
          )}

          {!loading && products.length === 0 && (
            <div className="text-center py-20">
              <p className="text-lg font-semibold text-gray-700">No products found</p>
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
