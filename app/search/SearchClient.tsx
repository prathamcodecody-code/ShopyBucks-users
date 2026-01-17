"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import { api } from "@/lib/api";
import ProductCard from "@/components/ProductCard";
import FiltersSidebar from "@/components/Filters/FiltersSidebar";

export default function SearchClient() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const query = searchParams.get("query") || "";
  const sortParam = searchParams.get("sort") || "relevance";

  const [products, setProducts] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [sort, setSort] = useState(sortParam);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const loadProducts = useCallback(async () => {
    if (!query.trim()) {
      setProducts([]);
      setTotal(0);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const params: any = { search: query };
      if (sort !== "relevance") params.sort = sort;

      const res = await api.get("/products", { params });
      const data = res.data;

      const list = Array.isArray(data)
        ? data
        : Array.isArray(data.products)
        ? data.products
        : [];

      setProducts(list);
      setTotal(
        typeof data.total === "number" ? data.total : list.length
      );
    } catch (err: any) {
      setError(
        err?.response?.data?.message || "Failed to load products"
      );
      setProducts([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [query, sort]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const handleSortChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("sort", value);

    router.push(`/search?${params.toString()}`);
    setSort(value);
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
        <h1 className="text-2xl font-bold">
          Results for “{query}”
        </h1>

        <select
          className="border rounded px-3 py-2 w-full sm:w-auto"
          value={sort}
          onChange={(e) => handleSortChange(e.target.value)}
        >
          <option value="relevance">Relevance</option>
          <option value="newest">Newest First</option>
          <option value="low_to_high">Price: Low to High</option>
          <option value="high_to_low">Price: High to Low</option>
        </select>
      </div>

      <div className="grid grid-cols-12 gap-6">
        <aside className="hidden md:block md:col-span-3">
          <FiltersSidebar />
        </aside>

        <main className="col-span-12 md:col-span-9">
          {loading && <p className="text-gray-500">Loading products…</p>}
          {error && <p className="text-red-500">{error}</p>}

          {!loading && !error && (
            <>
              <p className="text-gray-600 mb-4">
                {total} Products Found
              </p>

              {products.length === 0 ? (
                <p className="text-gray-500">
                  No products found for “{query}”
                </p>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
                  {products.map((p) => (
                    <ProductCard key={p.id} product={p} />
                  ))}
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}
