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
  const typeId = searchParams.get("typeId") || "";
  const subtypeId = searchParams.get("subtypeId") || "";

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
  }, []);

  const filtersRef = useRef<FilterState>({
    categoryId: categoryId ? Number(categoryId) : undefined,
    typeId: typeId ? Number(typeId) : undefined,
    subtypeId: subtypeId ? Number(subtypeId) : undefined,
    attributes: {},
    colors: [],
    sizes: [],
  });

  useEffect(() => {
    loadProducts(filtersRef.current);
  }, [sort, loadProducts]);

  useEffect(() => {
    const initialFilters: FilterState = {
      categoryId: categoryId ? Number(categoryId) : undefined,
      typeId: typeId ? Number(typeId) : undefined,
      subtypeId: subtypeId ? Number(subtypeId) : undefined,
      attributes: {},
      colors: [],
      sizes: [],
    };
    filtersRef.current = initialFilters;
    loadProducts(initialFilters);
  }, [categoryId, typeId, subtypeId, loadProducts]);

  const handleFilter = useCallback((filters: FilterState) => {
    filtersRef.current = filters;
    loadProducts(filters);
  }, [loadProducts]);

  const categoryName = categoryId
    ? products[0]?.category?.name || "Category Products"
    : "All Products";

  return (
    /* Increased max-width to 1600px to match other sections */
    <div className="max-w-[1600px] mx-auto px-4 md:px-6 py-6 md:py-10">
      
      {/* HEADER SECTION: Cleaned up spacing */}
      <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-xl md:text-3xl font-black text-genz-ink uppercase italic tracking-tighter">
            {categoryName}
          </h1>
          {!loading && (
            <p className="text-[10px] md:text-xs font-bold text-genz-muted uppercase tracking-widest mt-1">
              {total} Products Found
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
        {/* SIDEBAR: Narrower to allow more product room (col-span-12 on mobile, 3 on tablet, 2 on wide) */}
        <aside className="col-span-12 lg:col-span-3 xl:col-span-2 self-start">
          <div className="bg-white border border-genz-border rounded-2xl p-4 shadow-sm">
            <FiltersSidebar
              categoryId={categoryId}
              onFilter={handleFilter}
              initialFilters={filtersRef.current}
            />
          </div>
        </aside>

        {/* MAIN GRID: col-span-12 on mobile, 9 on tablet, 10 on wide */}
        <main className="col-span-12 lg:col-span-9 xl:col-span-10">
          {loading ? (
            /* LOADING SKELETON: Matches square compact style */
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="aspect-square bg-gray-100 animate-pulse rounded-xl" />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-20 border border-dashed border-genz-border rounded-2xl bg-white">
              <p className="text-sm font-black text-genz-ink uppercase tracking-widest">No products found</p>
              <p className="text-[10px] text-genz-muted mt-2 uppercase">
                Try adjusting filters or explore other categories
              </p>
            </div>
          ) : (
            /* PRODUCT GRID: 2 columns mobile, 3 tablet, 4 wide desktop */
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4">
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
