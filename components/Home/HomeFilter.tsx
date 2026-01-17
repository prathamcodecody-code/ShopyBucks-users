"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";

export default function HomeFilter({
  onFilter,
}: {
  onFilter?: (f: any) => void;
}) {
  const [categories, setCategories] = useState<any[]>([]);
  const [filter, setFilter] = useState({
    categoryId: "",
    minPrice: "",
    maxPrice: "",
    sort: "",
  });

  useEffect(() => {
    api
      .get("/categories")
      .then((res) => setCategories(Array.isArray(res.data) ? res.data : []))
      .catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    onFilter?.(filter);
  }, [filter, onFilter]);

  const handlePrice = (value: string) => {
    if (!value) {
      setFilter({ ...filter, minPrice: "", maxPrice: "" });
      return;
    }

    const [min, max] = value.split("-");
    setFilter({
      ...filter,
      minPrice: min || "",
      maxPrice: max || "",
    });
  };

  return (
    <section className="relative mb-12">
      {/* 🔮 Purple Gradient Container */}
      <div className="rounded-3xl bg-gradient-to-r from-purple-600 via-purple-500 to-purple-700 p-[2px] shadow-lg">
        <div className="bg-white rounded-3xl p-6 md:p-8">

          {/* HEADER */}
          <div className="mb-6 text-center">
            <h2 className="text-2xl font-bold text-purple-700">
              Find Your Perfect Match
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Filter products by category, price & preference
            </p>
          </div>

          {/* FILTERS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">

            {/* CATEGORY */}
            <FilterSelect
              label="Category"
              value={filter.categoryId}
              onChange={(e) =>
                setFilter({ ...filter, categoryId: e.target.value })
              }
            >
              <option value="">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </FilterSelect>

            {/* PRICE */}
            <FilterSelect
              label="Price Range"
              onChange={(e) => handlePrice(e.target.value)}
            >
              <option value="">Any Price</option>
              <option value="0-500">Under ₹500</option>
              <option value="500-1000">₹500 – ₹1000</option>
              <option value="1000-2000">₹1000 – ₹2000</option>
            </FilterSelect>

            {/* SORT */}
            <FilterSelect
              label="Sort By"
              value={filter.sort}
              onChange={(e) =>
                setFilter({ ...filter, sort: e.target.value })
              }
            >
              <option value="">Recommended</option>
              <option value="newest">Newest</option>
              <option value="low_to_high">Price: Low → High</option>
              <option value="high_to_low">Price: High → Low</option>
            </FilterSelect>

            {/* RESET */}
            <div className="flex items-end">
              <button
                onClick={() =>
                  setFilter({
                    categoryId: "",
                    minPrice: "",
                    maxPrice: "",
                    sort: "",
                  })
                }
                className="
                  w-full h-[42px]
                  rounded-lg
                  bg-purple-100
                  text-purple-700
                  font-semibold
                  hover:bg-purple-200
                  transition
                "
              >
                Reset Filters
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------------- UI HELPER ---------------- */

function FilterSelect({
  label,
  children,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement> & {
  label: string;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-semibold text-gray-600">
        {label}
      </label>
      <select
        {...props}
        className="
          h-[42px]
          rounded-lg
          border border-gray-200
          bg-white
          px-3
          text-sm
          focus:outline-none
          focus:ring-2 focus:ring-purple-400
          focus:border-purple-500
          hover:border-purple-400
          transition
        "
      >
        {children}
      </select>
    </div>
  );
}
