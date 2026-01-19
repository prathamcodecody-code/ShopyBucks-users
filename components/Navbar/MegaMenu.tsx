"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";

export default function MegaMenu({ categoryId }: { categoryId: number }) {
  const [types, setTypes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!categoryId) return;
    
    let mounted = true;

    async function loadMegaMenuData() {
      try {
        setLoading(true);
        // 1. Fetch Types (e.g., Mobiles, Laptops, Speakers)
        const typeRes = await api.get(`/product-types?categoryId=${categoryId}`);
        const baseTypes = Array.isArray(typeRes.data) ? typeRes.data : [];

        // 2. Fetch Subtypes for each Type to create the list effect
        const enrichedTypes = await Promise.all(
          baseTypes.map(async (t: any) => {
            try {
              const subRes = await api.get(`/product-subtypes?typeId=${t.id}`);
              return {
                ...t,
                subtypes: Array.isArray(subRes.data) ? subRes.data : [],
              };
            } catch {
              return { ...t, subtypes: [] };
            }
          })
        );

        if (mounted) {
          setTypes(enrichedTypes);
          setLoading(false);
        }
      } catch (err) {
        console.error("MegaMenu data fetch failed:", err);
        if (mounted) setLoading(false);
      }
    }

    loadMegaMenuData();
    return () => { mounted = false; };
  }, [categoryId]);

  return (
    <div className="bg-white shadow-[0_20px_50px_rgba(0,0,0,0.2)] border border-gray-100 p-10 w-full max-w-[1244px] rounded-b-xl animate-in fade-in slide-in-from-top-1 duration-300">
      {loading ? (
        <div className="flex flex-col items-center justify-center py-12 gap-3">
          <div className="w-8 h-8 border-4 border-amazon-orange border-t-transparent rounded-full animate-spin" />
          <p className="text-[10px] font-black uppercase tracking-widest text-amazon-mutedText">Loading Collections</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-y-12 gap-x-8">
          {types.map((t) => (
            <div key={t.id} className="flex flex-col gap-4">
              {/* MAIN TYPE HEADER (Flipkart Bold Style) */}
              <Link
                href={`/all-products?categoryId=${categoryId}&typeId=${t.id}`}
                className="text-sm font-black text-amazon-text uppercase tracking-tight hover:text-[#2874f0] transition-colors border-l-4 border-amazon-orange pl-3"
              >
                {t.name}
              </Link>

              {/* SUBTYPES LIST (Flipkart Style Vertical List) */}
              <div className="flex flex-col gap-2.5 pl-4">
                {t.subtypes && t.subtypes.length > 0 ? (
                  t.subtypes.map((s: any) => (
                    <Link
                      key={s.id}
                      href={`/all-products?categoryId=${categoryId}&subtypeId=${s.id}`}
                      className="text-[13px] text-gray-500 hover:text-amazon-orange transition-colors font-medium"
                    >
                      {s.name}
                    </Link>
                  ))
                ) : (
                  <span className="text-[11px] text-gray-400 italic">New arrivals coming soon</span>
                )}
                
                {/* View All Action */}
                <Link 
                  href={`/all-products?categoryId=${categoryId}&typeId=${t.id}`}
                  className="text-[11px] font-black text-[#2874f0] uppercase tracking-tighter mt-1 hover:underline"
                >
                  View All {t.name}
                </Link>
              </div>
            </div>
          ))}

          {types.length === 0 && (
            <div className="col-span-full py-10 text-center border-2 border-dashed border-gray-100 rounded-2xl">
              <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">
                Explore our latest {categoryId} collection below
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
