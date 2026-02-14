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

      if (filter.typeId?.length) {
        params.typeId = filter.typeId.join(",");
      }

      if (filter.subtypeId?.length) {
        params.subtypeId = filter.subtypeId.join(",");
      }

      if (filter.minPrice !== undefined) {
        params.minPrice = filter.minPrice;
      }

      if (filter.maxPrice !== undefined) {
        params.maxPrice = filter.maxPrice;
      }

      if (filter.color?.length) {
        params.color = filter.color.join(",");
      }

      if (filter.season?.length) {
        params.season = filter.season.join(",");
      }

      if (filter.occasion?.length) {
        params.occasion = filter.occasion.join(",");
      }

      if (filter.stock) {
        params.stock = filter.stock;
      }

      if (filter.sort && filter.sort !== "relevance") {
        params.sort = filter.sort;
      }

      console.log("🔍 Applying filters:", params);

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

  // ✅ Organize sections by type
  const banners = sections.filter((s) => s.type === "BANNER");
  const collections = sections.filter((s) => s.type === "COLLECTION");
  const productSections = sections.filter((s) => s.type === "PRODUCT_LIST");
  const textSections = sections.filter((s) => s.type === "TEXT");

  // ✅ Distribute banners across page positions
  const banner1 = banners[0]; // Before Trending
  const banner2 = banners[1]; // Before New Arrivals
  const banner3 = banners[2]; // After Top Categories
  const remainingBanners = banners.slice(3); // Any extra banners go at the end

  return (
    <div className="w-full bg-genz-bg min-h-screen font-sans">
      
      {/* 1. HERO CAROUSEL */}
      <HeroCarousel />

      {/* 2. CATEGORY QUICK-NAV */}
      <CategoryGrid />

      {/* ✅ BANNER POSITION 1: Before Trending */}
      {banner1 && <BannerSection banners={[banner1]} />}

      {/* 3. TRENDING NOW */}
      <TrendingNow />

      {/* ✅ BANNER POSITION 2: Before New Arrivals */}
      {banner2 && <BannerSection banners={[banner2]} />}

      {/* 4. TOP CATEGORIES */}
      <TopCategories />

      {/* ✅ BANNER POSITION 3: After Top Categories */}
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

      {/* ✅ REMAINING BANNERS: If admin added 4+ banners */}
      {remainingBanners.length > 0 && (
        <BannerSection banners={remainingBanners} />
      )}

      {/* 8. MAIN SHOPPING AREA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-20">
        <div className="mb-12">
          <p className="text-genz-accent font-black text-xs uppercase tracking-[0.3em] mb-2">Personalized</p>
          <h2 className="text-3xl md:text-5xl font-black text-genz-ink tracking-tighter uppercase">
            Products <span className="text-genz-accent">For You</span>
          </h2>
        </div>

        <div className="flex flex-col lg:flex-row gap-12">
          <aside className="w-full lg:w-1/4 lg:sticky lg:top-24 h-fit">
            <div className="bg-white border border-genz-border rounded-genz p-6 shadow-sm">
              <HomeFilter onFilter={applyFilters} />
            </div>
          </aside>

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

      {/* 9. SEO TEXT BLOCKS */}
      {textSections.map((section) => (
        <TextBlockSection key={section.id} section={section} />
      ))}

      <div className="pb-20" />
    </div>
  );
}
