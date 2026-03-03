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
import SponsoredProducts from "@/components/Home/SponsoredProducts";

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
}

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────

const DEFAULT_CATEGORY_ID = 1;

function buildParams(filter: FullHomeFilterState): Record<string, any> {
  const p: Record<string, any> = { limit: 12 };

  // ✅ Include all filter parameters
  if (filter.categoryId)                       p.categoryId = filter.categoryId;
  if (filter.typeId)                           p.typeId     = filter.typeId;
  if (filter.subtypeId)                        p.subtypeId  = filter.subtypeId;
  if (filter.sort && filter.sort !== "newest") p.sort       = filter.sort;
  if (filter.minPrice)                         p.minPrice   = filter.minPrice;
  if (filter.maxPrice)                         p.maxPrice   = filter.maxPrice;
  if (filter.stock)                            p.stock      = filter.stock;
  
  // ✅ Colors and sizes
  if (filter.colors?.length)                   p.colors     = filter.colors.join(",");
  if (filter.sizes?.length)                    p.sizes      = filter.sizes.join(",");

  // ✅ Dynamic attributes (fabric, occasion, season, etc.)
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
  const [total, setTotal] = useState(0);
  const [loading,  setLoading]  = useState(true);
  const [sections, setSections] = useState<any[]>([]);
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
      const data = res.data;

      // ✅ Handle both array and object responses
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

  // ✅ Initial load with default category
  useEffect(() => {
    fetchProducts(
      buildParams({ 
        sort: "newest", 
        attributes: {}, 
        colors: [],
        sizes: [],
        categoryId: DEFAULT_CATEGORY_ID 
      })
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
  const applyFilters = useCallback((filter: FullHomeFilterState) => {
    console.log("Applying filters:", filter); // Debug log
    fetchProducts(buildParams(filter));
  }, [fetchProducts]);

  // ── Reset filters ─────────────────────────
  const resetFilters = useCallback(() => {
    fetchProducts(
      buildParams({ 
        sort: "newest", 
        attributes: {}, 
        colors: [],
        sizes: [],
        categoryId: DEFAULT_CATEGORY_ID 
      })
    );
  }, [fetchProducts]);

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
      
     {/*Sponsored Products Section*/}
     <section className="mb-8 pt-10">
      <SponsoredProducts />
      </section>
      
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
          {!loading && (
            <p className="text-sm text-genz-muted mt-2 font-bold">
              {total} {total === 1 ? 'Product' : 'Products'} Found
            </p>
          )}
        </div>

        <div className="flex flex-col lg:flex-row gap-12">

          {/* Filter sidebar */}
          <aside className="w-full lg:w-1/5 self-start mb-8 lg:mb-0">
  <div className="bg-white border border-genz-border rounded-2xl p-4 shadow-sm">
    <HomeFilter
      categories={categories}
      initialFilters={{ 
        categoryId: DEFAULT_CATEGORY_ID, 
        attributes: {},
        colors: [],
        sizes: []
      }}
      onFilter={applyFilters}
    />
  </div>
</aside>
          {/* Product grid */}
         <main className="w-full lg:w-4/5">
  {loading ? (
    /* Loading Skeletons: Updated to grid-cols-4 */
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          className="aspect-square rounded-lg bg-gray-100 animate-pulse"
        />
      ))}
    </div>
  ) : products.length > 0 ? (
    /* Product grid: Responsive 2-col (mobile) to 4-col (desktop) */
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4">
      {products.map((p) => (
        <ProductCard key={p.id} product={p} />
      ))}
    </div>
  ) : (
    /* Empty State */
    <div className="text-center py-24 bg-white border border-dashed border-genz-border rounded-2xl">
      <p className="text-genz-muted font-bold uppercase tracking-widest text-xs mb-2">
        No drops match your vibe.
      </p>
      <p className="text-genz-muted text-[10px] mb-4">
        Try adjusting your filters or explore other categories
      </p>
      <button
        onClick={resetFilters}
        className="mt-2 px-6 py-2 bg-genz-accent text-white font-bold rounded-full text-[10px] uppercase tracking-widest hover:bg-opacity-90 transition-all"
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
