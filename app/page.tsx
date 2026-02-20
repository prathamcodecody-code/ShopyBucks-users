"use client";

import { useEffect, useState, useCallback } from "react";
import HeroCarousel from "@/components/HeroCarousel";
import CategoryGrid from "@/components/CategoryGrid";
import TrendingNow from "@/components/TrendingSection";
import NewArrivals from "@/components/NewArrivals";
import HomeFilter, { FullHomeFilterState } from "@/components/Home/HomeFilter";
import ProductCard from "@/components/ProductCard";
import TopCategories from "@/components/TopCategories";
import { api } from "@/lib/api";
import { Product } from "@/lib/product";
import BannerSection from "@/components/ui/BannerSection";
import CollectionGridSection from "@/components/ui/CollectionGridSection";
import ProductSliderSection from "@/components/ui/ProductSliderSection";
import TextBlockSection from "@/components/ui/TextBlockSection";

// ─────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────

type Category = {
  id: number;
  name: string;
  slug: string;
};

export interface HomeFilterState {
  sort?:     string;
  minPrice?: number;
  maxPrice?: number;
  stock?:    "in" | "out";
  season?:   string;
  occasion?: string;
}

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────

const DEFAULT_CATEGORY_ID = 1;

function buildParams(filter: FullHomeFilterState): Record<string, any> {
  const p: Record<string, any> = { limit: 12 };

  // ✅ categoryId included so category filter actually hits the backend
  if (filter.categoryId)                       p.categoryId = filter.categoryId;
  if (filter.sort && filter.sort !== "newest") p.sort       = filter.sort;
  if (filter.minPrice)                         p.minPrice   = filter.minPrice;
  if (filter.maxPrice)                         p.maxPrice   = filter.maxPrice;
  if (filter.stock)                            p.stock      = filter.stock;
  if (filter.season)                           p.season     = filter.season;
  if (filter.occasion)                         p.occasion   = filter.occasion;

  for (const [slug, values] of Object.entries(filter.attributes || {})) {
    if (values.length) p[slug] = values.join(",");
  }

  return p;
}

// ─────────────────────────────────────────────
// PAGE
// ─────────────────────────────────────────────

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [sections, setSections] = useState<any[]>([]);

  // ✅ Explicitly typed so TypeScript doesn't infer never[]
  const [categories, setCategories] = useState<Category[]>([]);

  // Fetch categories for the filter sidebar
  useEffect(() => {
    api
      .get("/categories")
      .then((res) => setCategories(res.data))
      .catch(() => setCategories([]));
  }, []);

  // ── Fetch products ────────────────────────
  const fetchProducts = useCallback(async (params: Record<string, any> = { limit: 12 }) => {
    setLoading(true);
    try {
      const res = await api.get("/products", { params });
      setProducts(res.data.products || []);
    } catch {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // ✅ Initial load uses buildParams so categoryId: 1 is sent from the start
  useEffect(() => {
    fetchProducts(
      buildParams({ sort: "newest", attributes: {}, categoryId: DEFAULT_CATEGORY_ID })
    );
  }, [fetchProducts]);

  // ── Fetch homepage CMS sections ───────────
  useEffect(() => {
    api
      .get("/homepage", { params: { target: "WEB" } })
      .then((res) => setSections(res.data))
      .catch(() => setSections([]));
  }, []);

  // ── Filter handler ─────────────────────────
  const applyFilters = (filter: FullHomeFilterState) => {
    fetchProducts(buildParams(filter));
  };

  // ── Section bucketing ─────────────────────
  const banners         = sections.filter((s) => s.type === "BANNER");
  const collections     = sections.filter((s) => s.type === "COLLECTION");
  const productSections = sections.filter((s) => s.type === "PRODUCT_LIST");
  const textSections    = sections.filter((s) => s.type === "TEXT");

  const banner1          = banners[0];
  const banner2          = banners[1];
  const banner3          = banners[2];
  const remainingBanners = banners.slice(3);

  // ─────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────
  return (
    <div className="w-full bg-genz-bg min-h-screen font-sans">

      {/* 1. HERO CAROUSEL */}
      <HeroCarousel />

      {/* 2. CATEGORY QUICK-NAV */}
      <CategoryGrid />

      {/* BANNER 1 */}
      {banner1 && <BannerSection banners={[banner1]} />}

      {/* 3. TRENDING NOW */}
      <TrendingNow />

      {/* BANNER 2 */}
      {banner2 && <BannerSection banners={[banner2]} />}

      {/* 4. TOP CATEGORIES */}
      <TopCategories />

    {/* 8. MAIN SHOPPING AREA */}
      <section className="bg-genz-bg pt-1 pb-10 px-4 sm:px-6">
        <div className="mb-12">
          <p className="text-genz-accent font-black text-xs uppercase tracking-[0.3em] mb-2">
            Personalized
          </p>
          <h2 className="text-3xl md:text-5xl font-black text-genz-ink tracking-tighter uppercase">
            Products <span className="text-genz-accent">For You</span>
          </h2>
        </div>

        <div className="flex flex-col lg:flex-row gap-12">

          {/* Filter sidebar — full natural height, no scroll container */}
          <aside className="w-full lg:w-1/4 self-start">
            <div className="bg-white border border-genz-border rounded-3xl p-6 shadow-sm">
              <HomeFilter
                categories={categories}
                initialFilters={{ categoryId: DEFAULT_CATEGORY_ID, attributes: {} }}
                onFilter={applyFilters}
              />
            </div>
          </aside>

          {/* Product grid */}
          <main className="w-full lg:w-3/4">
            {loading ? (
              <div className="grid grid-cols-2 xl:grid-cols-3 gap-6 md:gap-8">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    className="aspect-[3/4] rounded-genz bg-gray-100 animate-pulse"
                  />
                ))}
              </div>
            ) : products.length > 0 ? (
              <div className="grid grid-cols-2 xl:grid-cols-3 gap-6 md:gap-8">
                {products.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            ) : (
              <div className="text-center py-24 bg-white border border-dashed border-genz-border rounded-genz">
                <p className="text-genz-muted font-bold uppercase tracking-widest text-sm">
                  No drops match your vibe.
                </p>
                <button
                  onClick={() =>
                    fetchProducts(
                      buildParams({ sort: "newest", attributes: {}, categoryId: DEFAULT_CATEGORY_ID })
                    )
                  }
                  className="mt-4 text-xs text-genz-accent font-bold underline"
                >
                  Reset filters
                </button>
              </div>
            )}
          </main>
        </div>
      </section>


      {/* BANNER 3 */}
      {banner3 && <BannerSection banners={[banner3]} />}

      {/* 5. COLLECTION GRID */}
      {collections.length > 0 && (
        <CollectionGridSection collections={collections} />
      )}

      {/* 6. NEW ARRIVALS */}
      <NewArrivals />

      {/* 7. DYNAMIC PRODUCT LISTS */}
      {productSections.map((section) => (
        <ProductSliderSection key={section.id} section={section} />
      ))}

      {/* REMAINING BANNERS */}
      {remainingBanners.length > 0 && (
        <BannerSection banners={remainingBanners} />
      )}

      
      {/* 9. SEO TEXT BLOCKS */}
      {textSections.map((section) => (
        <TextBlockSection key={section.id} section={section} />
      ))}

      <div className="pb-20" />
    </div>
  );
}
