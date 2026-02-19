"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { use } from "react";
import FiltersSidebar, { FilterState } from "@/components/Filters/FiltersSidebar";
import Link from "next/link";
import Image from "next/image";

// ─────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────

type Product = {
  id: number;
  slug: string;
  title: string;
  price: number;
  finalPrice?: number;
  img1?: string;
  discountType?: string;
  discountValue?: number;
  category?: { name: string };
};

// ─────────────────────────────────────────────
// PAGE
// ─────────────────────────────────────────────

export default function CategoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  // Unwrap the params promise (Next.js 15+)
  const { id } = use(params);

  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal]       = useState(0);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(false);
  const [sort, setSort]         = useState("relevance");

  // Keep sort in a ref so loadProducts doesn't go stale
  const sortRef = useRef(sort);
  useEffect(() => { sortRef.current = sort; }, [sort]);

  // Keep latest filters so sort changes can reuse them
  const filtersRef = useRef<FilterState>({
    categoryId: Number(id),
    attributes: {},
    colors: [],
    sizes: [],
  });

  const loadProducts = useCallback(async (filters: FilterState) => {
    setLoading(true);
    setError(false);
    try {
      const params = new URLSearchParams();

      if (filters.categoryId) params.set("categoryId", String(filters.categoryId));
      if (filters.typeId)     params.set("typeId",     String(filters.typeId));
      if (filters.subtypeId)  params.set("subtypeId",  String(filters.subtypeId));
      if (filters.minPrice)   params.set("minPrice",   String(filters.minPrice));
      if (filters.maxPrice)   params.set("maxPrice",   String(filters.maxPrice));
      if (filters.stock)      params.set("stock",      filters.stock);
      if (sortRef.current !== "relevance") params.set("sort", sortRef.current);

      if (filters.colors?.length) params.set("colors", filters.colors.join(","));
      if (filters.sizes?.length)  params.set("sizes",  filters.sizes.join(","));

      for (const [slug, values] of Object.entries(filters.attributes || {})) {
        if (values.length) params.set(slug, values.join(","));
      }

      params.set("limit", "100");

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/products?${params.toString()}`,
        { cache: "no-store" }
      );

      if (!res.ok) throw new Error("Failed to fetch");

      const data = await res.json();
      const list: Product[] = Array.isArray(data)
        ? data
        : Array.isArray(data?.products)
        ? data.products
        : [];

      setProducts(list);
      setTotal(typeof data.total === "number" ? data.total : list.length);
    } catch {
      setError(true);
      setProducts([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load + reload when sort changes
  useEffect(() => {
    loadProducts(filtersRef.current);
  }, [id, sort, loadProducts]);

  const handleFilter = useCallback((filters: FilterState) => {
    filtersRef.current = filters;
    loadProducts(filters);
  }, [loadProducts]);

  const categoryName = products[0]?.category?.name ?? "Category";

  // ─────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-8">
        <h1 className="text-2xl font-bold mb-6">Category</h1>
        <p className="text-gray-500">Failed to load products.</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">

      {/* ── HEADER ── */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {loading && products.length === 0 ? (
              <span className="inline-block w-40 h-8 bg-gray-200 animate-pulse rounded" />
            ) : categoryName}
          </h1>
          {!loading && (
            <p className="text-sm text-gray-500 mt-1">{total} Products Found</p>
          )}
        </div>

        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="border border-gray-300 rounded-lg px-4 py-2 text-sm bg-white outline-none focus:ring-2 focus:ring-purple-600"
        >
          <option value="relevance">Relevance</option>
          <option value="newest">Newest First</option>
          <option value="low_to_high">Price: Low to High</option>
          <option value="high_to_low">Price: High to Low</option>
        </select>
      </div>

      {/* ── LAYOUT ── */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">

        {/* Sidebar */}
        <aside className="md:col-span-3">
          <FiltersSidebar
            categoryId={id}
            onFilter={handleFilter}
            initialFilters={{
              categoryId: Number(id),
              attributes: {},
              colors: [],
              sizes: [],
            }}
          />
        </aside>

        {/* Products */}
        <main className="md:col-span-9">

          {/* Loading skeleton */}
          {loading && (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="border rounded-xl shadow-sm bg-white animate-pulse">
                  <div className="w-full h-64 bg-gray-200 rounded-t-xl" />
                  <div className="p-4 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4" />
                    <div className="h-4 bg-gray-100 rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Empty state */}
          {!loading && products.length === 0 && (
            <div className="text-center py-20">
              <p className="text-lg font-semibold text-gray-700">No products found</p>
              <p className="text-gray-500 mt-2">Try adjusting your filters</p>
            </div>
          )}

          {/* Product grid */}
          {!loading && products.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
              {products.map((p) => (
                <Link
                  key={p.id}
                  href={`/products/${p.slug}`}
                  className="border rounded-xl shadow-sm hover:shadow-lg transition bg-white group"
                >
                  <div className="w-full h-64 overflow-hidden rounded-t-xl bg-gray-100">
                    {p.img1 ? (
                      <img
                        src={`${process.env.NEXT_PUBLIC_API_URL}/uploads/products/${p.img1}`}
                        alt={p.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-300 text-sm">
                        No image
                      </div>
                    )}
                  </div>

                  <div className="p-4">
                    <h3 className="text-sm font-semibold line-clamp-2 text-gray-800">
                      {p.title}
                    </h3>
                    <div className="mt-2 flex items-baseline gap-2">
                      <span className="text-brandPink font-bold text-lg">
                        ₹{p.finalPrice ?? p.price}
                      </span>
                      {/* Show original price if discounted */}
                      {p.finalPrice && p.finalPrice < p.price && (
                        <span className="text-gray-400 text-sm line-through">
                          ₹{p.price}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
