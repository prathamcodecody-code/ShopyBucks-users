"use client";

import { useSearchParams } from "next/navigation";
import { useState, useEffect, useCallback, useRef } from "react";
import { api } from "@/lib/api";
import ProductCard from "@/components/ProductCard";
import FiltersSidebar, { FilterState } from "@/components/Filters/FiltersSidebar";

export default function SearchClient() {
  const searchParams = useSearchParams();

  const query = searchParams.get("query") || "";
  const sortParam = searchParams.get("sort") || "relevance";

  const [products, setProducts] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState(sortParam);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const sortRef = useRef(sort);
  useEffect(() => {
    sortRef.current = sort;
  }, [sort]);

  const filtersRef = useRef<FilterState>({ attributes: {}, colors: [], sizes: [] });

  const loadProducts = useCallback(
    async (filters: FilterState, currentPage = 1) => {
      if (!query.trim()) {
        setProducts([]);
        setTotal(0);
        setTotalPages(0);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const params: Record<string, any> = {
          search: query,
          page: currentPage,
          limit: 20,
        };

        if (filters.categoryId) params.categoryId = filters.categoryId;
        if (filters.typeId) params.typeId = filters.typeId;
        if (filters.subtypeId) params.subtypeId = filters.subtypeId;
        if (filters.minPrice) params.minPrice = filters.minPrice;
        if (filters.maxPrice) params.maxPrice = filters.maxPrice;
        if (filters.stock) params.stock = filters.stock;
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

        const res = await api.get("/products", { params });
        const data = res.data;

        console.log("=== API RESPONSE ===");
        console.log("Total products:", data.products?.length);
        console.log("First 3 products:", data.products?.slice(0, 3).map((p: any) => ({
          id: p.id,
          title: p.title.substring(0, 30),
          __sponsored: p.__sponsored
        })));

        const list = Array.isArray(data)
          ? data
          : Array.isArray(data.products)
          ? data.products
          : [];

        setProducts(list);
        setTotal(typeof data.total === "number" ? data.total : list.length);
        setTotalPages(typeof data.pages === "number" ? data.pages : Math.ceil(list.length / 20));

        window.scrollTo({ top: 0, behavior: "smooth" });
      } catch (err: any) {
        setError(err?.response?.data?.message || "Failed to load products");
        setProducts([]);
        setTotal(0);
        setTotalPages(0);
      } finally {
        setLoading(false);
      }
    },
    [query]
  );

  useEffect(() => {
    setPage(1);
    loadProducts(filtersRef.current, 1);
  }, [query, sort, loadProducts]);

  const handleFilter = useCallback(
    (filters: FilterState) => {
      filtersRef.current = filters;
      setPage(1);
      loadProducts(filters, 1);
    },
    [loadProducts]
  );

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    loadProducts(filtersRef.current, newPage);
  };

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
            <p className="text-sm text-gray-500 mt-1">
              {total} Products Found
              {page === 1 && total > 0 && (
                <span className="ml-2 text-xs text-purple-600 font-medium">
                  • Including Sponsored
                </span>
              )}
            </p>
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
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
                {products.map((p) => (
                  <div key={p.id} className="relative">
                    <ProductCard product={p} />
                    
                  </div>
                ))}
              </div>

              {/* PAGINATION */}
              {totalPages > 1 && (
                <div className="mt-8 flex items-center justify-center gap-2">
                  <button
                    onClick={() => handlePageChange(page - 1)}
                    disabled={page === 1}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>

                  <div className="flex gap-1">
                    {page > 3 && (
                      <>
                        <button
                          onClick={() => handlePageChange(1)}
                          className="px-3 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50"
                        >
                          1
                        </button>
                        {page > 4 && <span className="px-3 py-2 text-gray-500">...</span>}
                      </>
                    )}

                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                      .filter((p) => p >= page - 2 && p <= page + 2)
                      .map((p) => (
                        <button
                          key={p}
                          onClick={() => handlePageChange(p)}
                          className={`px-3 py-2 border rounded-lg text-sm font-medium ${
                            p === page
                              ? "bg-purple-600 text-white border-purple-600"
                              : "border-gray-300 hover:bg-gray-50"
                          }`}
                        >
                          {p}
                        </button>
                      ))}

                    {page < totalPages - 2 && (
                      <>
                        {page < totalPages - 3 && <span className="px-3 py-2 text-gray-500">...</span>}
                        <button
                          onClick={() => handlePageChange(totalPages)}
                          className="px-3 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50"
                        >
                          {totalPages}
                        </button>
                      </>
                    )}
                  </div>

                  <button
                    onClick={() => handlePageChange(page + 1)}
                    disabled={page === totalPages}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              )}

              <div className="mt-4 text-center text-sm text-gray-500">
                Page {page} of {totalPages} • Showing {products.length} products
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
