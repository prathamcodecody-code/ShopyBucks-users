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

    async function load() {
      try {
        setLoading(true);

        // 1️⃣ Load product types
        const typeRes = await api.get(
          `/product-types?categoryId=${categoryId}`
        );

        const baseTypes = Array.isArray(typeRes.data)
          ? typeRes.data
          : [];

        // 2️⃣ Load subtypes for each type (parallel)
        const enriched = await Promise.all(
          baseTypes.map(async (t: any) => {
            try {
              const subRes = await api.get(
                `/product-subtypes?typeId=${t.id}`
              );
              return {
                ...t,
                subtypes: Array.isArray(subRes.data) ? subRes.data : [],
              };
            } catch {
              return { ...t, subtypes: [] };
            }
          })
        );

        if (mounted) setTypes(enriched);
      } catch {
        if (mounted) setTypes([]);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();

    return () => {
      mounted = false;
    };
  }, [categoryId]);

  return (
    <div className="absolute left-0 w-screen bg-white shadow-[0_20px_40px_rgba(0,0,0,0.1)] border-t py-8 z-50">
      <div className="max-w-[1200px] mx-auto px-10">
        {loading ? (
          <div className="flex items-center gap-3 text-gray-500">
            <div className="w-4 h-4 border-2 border-brandPink border-t-transparent rounded-full animate-spin" />
            <p className="text-sm">Loading categories...</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-10">
            {types.map((t) => (
              <div key={t.id} className="space-y-4">
                {/* TYPE */}
                <Link
                  href={`/all-products?categoryId=${categoryId}&typeId=${t.id}`}
                  className="block font-bold uppercase text-sm text-gray-900 hover:text-brandPink"
                >
                  {t.name}
                </Link>

                {/* SUBTYPES */}
                <div className="flex flex-col gap-2">
                  {t.subtypes.length > 0 ? (
                    t.subtypes.map((s: any) => (
                      <Link
                        key={s.id}
                        href={`/all-products?categoryId=${categoryId}&subtypeId=${s.id}`}
                        className="text-sm text-gray-500 hover:text-brandPink"
                      >
                        {s.name}
                      </Link>
                    ))
                  ) : (
                    <p className="text-xs italic text-gray-400">
                      New arrivals soon
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
