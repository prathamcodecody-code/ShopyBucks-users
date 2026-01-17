"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import Link from "next/link";
import { ChevronDown, ChevronUp } from "lucide-react";

type FilterSidebarProps = {
  categoryId?: string | number;
};

export default function FiltersSidebar({ categoryId }: FilterSidebarProps) {
  const [types, setTypes] = useState<any[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!categoryId) return;

    api
      .get(`/product-types?categoryId=${categoryId}`)
      .then((res) => setTypes(Array.isArray(res.data) ? res.data : []));
  }, [categoryId]);

  return (
    <aside className="w-full md:w-[280px] bg-white rounded-2xl border border-gray-200 shadow-sm">

      {/* MOBILE HEADER */}
      <button
        onClick={() => setOpen(!open)}
        className="
          md:hidden w-full flex items-center justify-between
          px-5 py-4 text-purple-600 font-semibold
        "
      >
        Filters
        {open ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
      </button>

      {/* CONTENT */}
      <div
        className={`px-5 pb-6 transition-all duration-300 ${
          open ? "block" : "hidden"
        } md:block`}
      >

        {/* PRODUCT TYPES */}
        <Section title="Product Type">
          {types.map((t) => (
            <div key={t.id}>
              <Link
                href={`/all-products?categoryId=${categoryId}&typeId=${t.id}`}
                className="
                  flex items-center gap-3 px-3 py-2 rounded-lg
                  text-sm font-medium text-gray-700
                  hover:bg-purple-50 hover:text-purple-600
                  transition
                "
                onClick={() => setOpen(false)}
              >
                <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
                {t.name}
              </Link>

              {/* SUBTYPES */}
              {t.subtypes?.length > 0 && (
                <div className="ml-6 mt-2 space-y-2 border-l border-gray-200 pl-4">
                  {t.subtypes.map((s: any) => (
                    <Link
                      key={s.id}
                      href={`/all-products?categoryId=${categoryId}&subtypeId=${s.id}`}
                      className="
                        block text-sm text-gray-600
                        hover:text-purple-600
                        transition
                      "
                      onClick={() => setOpen(false)}
                    >
                      {s.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </Section>

        <Divider />

        {/* PRICE */}
        <Section title="Price Range">
          <PriceLink
            href={`/all-products?categoryId=${categoryId}&maxPrice=500`}
            label="Under ₹500"
            onClick={() => setOpen(false)}
          />
          <PriceLink
            href={`/all-products?categoryId=${categoryId}&minPrice=500&maxPrice=1000`}
            label="₹500 – ₹1000"
            onClick={() => setOpen(false)}
          />
          <PriceLink
            href={`/all-products?categoryId=${categoryId}&minPrice=1000`}
            label="₹1000 & Above"
            onClick={() => setOpen(false)}
          />
        </Section>

        <Divider />

        {/* AVAILABILITY */}
        <Section title="Availability">
          <Link
            href={`/all-products?categoryId=${categoryId}&stock=in`}
            className="
              inline-flex items-center gap-2 px-3 py-2 rounded-lg
              text-sm font-medium text-gray-700
              hover:bg-purple-50 hover:text-purple-600
              transition
            "
            onClick={() => setOpen(false)}
          >
            <span className="w-2.5 h-2.5 rounded-full bg-green-500" />
            In Stock
          </Link>
        </Section>
      </div>
    </aside>
  );
}

/* ---------------- UI HELPERS ---------------- */

function Section({ title, children }: any) {
  return (
    <div className="mb-8">
      <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">
        {title}
      </h3>
      {children}
    </div>
  );
}

function Divider() {
  return <div className="border-t border-gray-200 my-6" />;
}

function PriceLink({
  href,
  label,
  onClick,
}: {
  href: string;
  label: string;
  onClick?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="
        block px-3 py-2 rounded-lg text-sm
        text-gray-700
        hover:bg-purple-50 hover:text-purple-600
        transition
      "
    >
      {label}
    </Link>
  );
}
