"use client";

import { useSearchParams } from "next/navigation";
import { useState, useEffect, useCallback, useRef } from "react";
import { api } from "@/lib/api";
import ProductCard from "@/components/ProductCard";
import FiltersSidebar, { FilterState } from "@/components/Filters/FiltersSidebar";

export default function SearchClient() {
  const searchParams = useSearchParams();

  const query    = searchParams.get("query") || "";
  const sortParam = searchParams.get("sort") || "relevance";

  const [products, setProducts] = useState<any[]>([]);
  const [total, setTotal]       = useState(0);
  const [sort, setSort]         = useState(sortParam);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");

  // Keep sort in a ref so loadProducts never goes stale
  const sortRef = useRef(sort);
  useEffect(() => { sortRef.current = sort; }, [sort]);

  // Keep latest filters in a ref so sort changes can re-use them
  const filtersRef = useRef<FilterState>({ attributes: {}, colors: [], sizes: [] });

  const loadProducts = useCallback(async (filters: FilterState) => {
    if (!query.trim()) {
      setProducts([]);
      setTotal(0);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const params: Record<string, any> = { search: query };

      if (filters.categoryId) params.categoryId = filters.categoryId;
      if (filters.typeId)     params.typeId     = filters.typeId;
      if (filters.subtypeId)  params.subtypeId  = filters.subtypeId;
      if (filters.minPrice)   params.minPrice   = filters.minPrice;
      if (filters.maxPrice)   params.maxPrice   = filters.maxPrice;
      if (filters.stock)      params.stock      = filters.stock;
      if (sortRef.current !== "relevance") params.sort = sortRef.current;

      if (filters.colors && filters.colors.length > 0) {
        params.colors = filters.colors.join(",");
      }
      if (filters.sizes && filters.sizes.length > 0) {
        params.sizes = filters.sizes.join(",");
      }

      for (const [slug, values] of Object.entries(filters.attributes || {})) {
        if (values.length) params[slug] = values.join(",");
      }

      const res  = await api.get("/products", { params });
      const data = res.data;

      const list = Array.isArray(data)
        ? data
        : Array.isArray(data.products)
        ? data.products
        : [];

      setProducts(list);
      setTotal(typeof data.total === "number" ? data.total : list.length);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to load products");
      setProducts([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [query]); // only query as dep — sort read via ref

  // Reload when query or sort changes
  useEffect(() => {
    loadProducts(filtersRef.current);
  }, [query, sort, loadProducts]);

  const handleFilter = useCallback((filters: FilterState) => {
    filtersRef.current = filters;
    loadProducts(filters);
  }, [loadProducts]);

  if (!query) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-24 text-center">
        <h2 className="text-2xl font-semibold text-gray-700">
          Start typing to search products
        </h2>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold">Results for "{query}"</h1>
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

      <div className="grid grid-cols-12 gap-6">
        <aside className="col-span-12 md:col-span-3">
          <FiltersSidebar
            onFilter={handleFilter}
            initialFilters={{ attributes: {}, colors: [], sizes: [] }}
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

          {error && <p className="text-red-500">{error}</p>}

          {!loading && !error && products.length === 0 && (
            <div className="text-center py-20">
              <p className="text-lg font-semibold text-gray-700">
                No products found for "{query}"
              </p>
              <p className="text-gray-500 mt-2">
                Try different keywords or adjust filters
              </p>
            </div>
          )}

          {!loading && !error && products.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
              {products.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
