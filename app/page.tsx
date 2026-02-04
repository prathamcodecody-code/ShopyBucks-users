"use client";

import { useEffect, useState } from "react";
import HeroCarousel from "@/components/HeroCarousel";
import CategoryGrid from "@/components/CategoryGrid";
import TrendingNow from "@/components/TrendingSection";
import NewArrivals from "@/components/NewArrivals";
import HomeFilter from "@/components/Home/HomeFilter";
import ProductCard from "@/components/ProductCard";
import TopCategories from "@/components/TopCategories";
import { api } from "@/lib/api";
import { Product } from "@/lib/product";
import BannerSection from "@/components/ui/BannerSection";
import CollectionGridSection from "@/components/ui/CollectionGridSection";
import ProductSliderSection from "@/components/ui/ProductSliderSection";
import TextBlockSection from "@/components/ui/TextBlockSection";

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [hasFiltered, setHasFiltered] = useState(false);
  const [sections, setSections] = useState<any[]>([]);

  const applyFilters = async (filter: any) => {
    try {
      const params: any = {};
      if (filter.typeId?.length) params.typeId = filter.typeId;
      if (filter.subtypeId?.length) params.subtypeId = filter.subtypeId;
      if (filter.sort) params.sort = filter.sort;

      const res = await api.get("/products", { params });
      setProducts(res.data.products || []);
      setHasFiltered(true);
    } catch (err) {
      console.error("Filter error", err);
      setProducts([]);
      setHasFiltered(true);
    }
  };

  useEffect(() => {
    api
      .get("/homepage", { params: { target: "WEB" } })
      .then((res) => setSections(res.data))
      .catch(() => setSections([]));
  }, []);

  const banners = sections.filter((s) => s.type === "BANNER");
  const collections = sections.filter((s) => s.type === "COLLECTION");
  const productSections = sections.filter((s) => s.type === "PRODUCT_LIST");
  const textSections = sections.filter((s) => s.type === "TEXT");

  return (
    /* Unified Brand Background */
    <div className="w-full bg-genz-bg min-h-screen font-sans">
      
      {/* 1. HERO CAROUSEL: High-impact entry point */}
      <HeroCarousel />

      {/* 2. CATEGORY QUICK-NAV: Essential for mobile-first discovery */}
      <CategoryGrid />

      {/* 3. TRENDING NOW: Bouncy, interactive horizontal scroll */}
      <TrendingNow />

      {/* 4. DATABASE BANNERS: High-contrast promotional breaks */}
      {banners.length > 0 && (
        <BannerSection banners={banners} />
      )}

      {/* 5. TOP CATEGORIES: Bento-grid style curated blocks */}
      <TopCategories />

      {/* 6. COLLECTION GRID: Minimalist series discovery */}
      {collections.length > 0 && (
        <CollectionGridSection collections={collections} />
      )}

      {/* 7. NEW ARRIVALS: Grid of high-heat items */}
      <NewArrivals />

      {/* 8. DYNAMIC PRODUCT LISTS: Custom sliders from backend */}
      {productSections.map((section) => (
        <ProductSliderSection key={section.id} section={section} />
      ))}

      {/* 9. MAIN SHOPPING AREA: Utility-focused with Gen Z Filter sidebar */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-20">
        <div className="mb-12">
          <p className="text-genz-accent font-black text-xs uppercase tracking-[0.3em] mb-2">Personalized</p>
          <h2 className="text-3xl md:text-5xl font-black text-genz-ink tracking-tighter uppercase">
            Products <span className="text-genz-accent">For You</span>
          </h2>
        </div>

        <div className="flex flex-col lg:flex-row gap-12">
          {/* Aside: Sticky Filter for better UX */}
          <aside className="w-full lg:w-1/4 lg:sticky lg:top-24 h-fit">
            <div className="bg-white border border-genz-border rounded-genz p-6 shadow-sm">
              <HomeFilter onFilter={applyFilters} />
            </div>
          </aside>

          {/* Main Grid: Clean, balanced columns */}
          <main className="w-full lg:w-3/4">
            {products.length > 0 ? (
              <div className="grid grid-cols-2 xl:grid-cols-3 gap-6 md:gap-8">
                {products.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            ) : (
              <div className="text-center py-24 bg-white border border-dashed border-genz-border rounded-genz">
                <p className="text-genz-muted font-bold uppercase tracking-widest text-sm">
                  {hasFiltered ? "No drops match your vibe." : "Use the filters to find your look."}
                </p>
              </div>
            )}
          </main>
        </div>
      </section>

      {/* 10. SEO TEXT BLOCKS: Minimalist information cards */}
      {textSections.map((section) => (
        <TextBlockSection key={section.id} section={section} />
      ))}

      {/* Spacer for Footer alignment */}
      <div className="pb-20" />
    </div>
  );
}
