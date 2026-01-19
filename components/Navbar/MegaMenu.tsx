"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";

export default function MegaMenu({ categoryId }: { categoryId: number }) {
  const [types, setTypes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!categoryId) return;
    setLoading(true);
    api.get(`/product-types?categoryId=${categoryId}`).then((res) => {
      setTypes(Array.isArray(res.data) ? res.data : []);
      setLoading(false);
    });
  }, [categoryId]);

  return (
    <div className="bg-white shadow-[0_15px_40px_rgba(0,0,0,0.15)] border border-gray-100 p-8 w-full max-w-[1244px] rounded-b-xl animate-in fade-in slide-in-from-top-1 duration-200">
      {loading ? (
        <div className="flex justify-center py-6">
          <div className="w-6 h-6 border-2 border-amazon-orange border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
          {types.map((t) => (
            <Link
              key={t.id}
              href={`/all-products?categoryId=${categoryId}&typeId=${t.id}`}
              className="px-4 py-2 bg-gray-50 rounded-lg text-center font-bold text-[13px] text-gray-700 hover:bg-amazon-orange/10 hover:text-amazon-orange transition-all border border-transparent hover:border-amazon-orange/20"
            >
              {t.name}
            </Link>
          ))}
          {types.length === 0 && (
            <p className="col-span-full text-center text-gray-400 text-sm italic">
              New collections arriving soon!
            </p>
          )}
        </div>
      )}
    </div>
  );
}
