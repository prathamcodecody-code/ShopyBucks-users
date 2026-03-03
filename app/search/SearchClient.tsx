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
        <h2 className="text-xl font-black text-genz-ink uppercase tracking-tighter italic">
          Start typing to search products
        </h2>
      </div>
    );
  }

  return (
    <div className="max-w-[1600px] mx-auto px-4 md:px-6 py-6 md:py-10">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-xl md:text-3xl font-black text-genz-ink uppercase italic tracking-tighter">
            Results for "{query}"
          </h1>
          {!loading && (
            <p className="text-[10px] md:text-xs font-bold text-genz-muted uppercase tracking-widest mt-1">
              {total} Products Found
              {page === 1 && total > 0 && (
                <span className="ml-2 text-genz-accent italic">
                  • Including Sponsored
                </span>
              )}
            </p>
          )}
        </div>

        <select
          className="border border-genz-border rounded-full px-4 py-2 text-[10px] font-black uppercase tracking-widest bg-white outline-none focus:ring-2 focus:ring-genz-accent"
          value={sort}
          onChange={(e) => setSort(e.target.value)}
        >
          <option value="relevance">Relevance</option>
          <option value="newest">Newest First</option>
          <option value="low_to_high">Price: Low to High</option>
          <option value="high_to_low">Price: High to Low</option>
        </select>
      </div>

      <div className="grid grid-cols-12 gap-4 md:gap-8">
        {/* SIDEBAR: Narrower for more product space */}
        <aside className="col-span-12 lg:col-span-3 xl:col-span-2 self-start">
          <div className="bg-white border border-genz-border rounded-2xl p-4 shadow-sm">
            <FiltersSidebar
              onFilter={handleFilter}
              initialFilters={{ attributes: {}, colors: [], sizes: [] }}
            />
          </div>
        </aside>

        {/* MAIN: 4 products per row (next to sidebar) */}
        <main className="col-span-12 lg:col-span-9 xl:col-span-10">
          {loading && (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="aspect-square bg-gray-100 animate-pulse rounded-xl" />
              ))}
            </div>
          )}

          {error && <p className="text-red-500 font-bold uppercase text-xs">{error}</p>}

          {!loading && !error && products.length === 0 && (
            <div className="text-center py-20 border border-dashed border-genz-border rounded-2xl bg-white">
              <p className="text-sm font-black text-genz-ink uppercase tracking-widest">
                No products found for "{query}"
              </p>
              <p className="text-[10px] text-genz-muted mt-2 uppercase">
                Try different keywords or adjust filters
              </p>
            </div>
          )}

          {!loading && !error && products.length > 0 && (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4">
                {products.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>

              {/* PAGINATION: Gen Z Styled */}
              {totalPages > 1 && (
                <div className="mt-12 flex flex-col items-center gap-4">
                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={() => handlePageChange(page - 1)}
                      disabled={page === 1}
                      className="px-4 py-2 border-2 border-genz-border rounded-full text-[10px] font-black uppercase tracking-widest hover:border-genz-accent disabled:opacity-30 transition-all"
                    >
                      Prev
                    </button>

                    <div className="flex gap-1">
                      {Array.from({ length: totalPages }, (_, i) => i + 1)
                        .filter((p) => p >= page - 1 && p <= page + 1)
                        .map((p) => (
                          <button
                            key={p}
                            onClick={() => handlePageChange(p)}
                            className={`w-8 h-8 rounded-full text-[10px] font-black border-2 transition-all ${
                              p === page
                                ? "bg-genz-ink text-white border-genz-ink"
                                : "border-genz-border text-genz-muted hover:border-genz-accent"
                            }`}
                          >
                            {p}
                          </button>
                        ))}
                    </div>

                    <button
                      onClick={() => handlePageChange(page + 1)}
                      disabled={page === totalPages}
                      className="px-4 py-2 border-2 border-genz-border rounded-full text-[10px] font-black uppercase tracking-widest hover:border-genz-accent disabled:opacity-30 transition-all"
                    >
                      Next
                    </button>
                  </div>
                  <div className="text-[10px] font-bold text-genz-muted uppercase tracking-widest">
                    Page {page} / {totalPages}
                  </div>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}
