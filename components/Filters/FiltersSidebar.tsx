"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { api } from "@/lib/api";
import { ChevronDown, RotateCcw, Search, X, Check } from "lucide-react";

// ─────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────

interface AttributeFilter {
  slug: string;
  name: string;
  type: string;
  values: Array<{ value: string; count: number }>;
}

interface FiltersResponse {
  price: { min: number | null; max: number | null };
  filters: AttributeFilter[];
  colors?: Array<{ color: string; count: number }>;
  sizes?: Array<{ size: string; count: number }>;
}

export interface FilterState {
  categoryId?: number;
  typeId?: number;
  subtypeId?: number;
  minPrice?: number;
  maxPrice?: number;
  stock?: "in" | "out";
  colors?: string[];
  sizes?: string[];
  attributes: Record<string, string[]>;
}

interface FiltersSidebarProps {
  categoryId?: string | number;
  onFilter: (filters: FilterState) => void;
  initialFilters?: Partial<FilterState>;
}

// ─────────────────────────────────────────────
// COLOR SWATCHES
// ─────────────────────────────────────────────

const CSS_COLORS: Record<string, string> = {
  black: "#0F172A", white: "#FFFFFF", red: "#EF4444", blue: "#3B82F6",
  green: "#22C55E", yellow: "#EAB308", orange: "#EA580C", pink: "#EC4899",
  purple: "#A855F7", brown: "#92400E", grey: "#64748B", gray: "#64748B",
  beige: "#D4C5B9", navy: "#1E3A8A", maroon: "#7C2D12",
};

function colorSwatch(value: string): string | null {
  return CSS_COLORS[value.toLowerCase()] ?? null;
}

function activeCount(f: FilterState): number {
  let n = 0;
  if (f.minPrice || f.maxPrice) n++;
  if (f.stock) n++;
  if (f.typeId) n++;
  if (f.subtypeId) n++;
  if (f.colors?.length) n++;
  if (f.sizes?.length) n++;
  for (const vals of Object.values(f.attributes || {})) if (vals.length) n++;
  return n;
}

// ─────────────────────────────────────────────
// COLLAPSIBLE SECTION
// ─────────────────────────────────────────────

function Section({ title, count, children, defaultOpen = true }: {
  title: string; count?: number; children: React.ReactNode; defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="pb-4 mb-4 border-b border-gray-200 last:border-0 last:mb-0">
      <button onClick={() => setOpen((v) => !v)} className="flex justify-between items-center w-full text-left py-2">
        <span className="text-xs font-bold uppercase tracking-wider text-gray-700 flex items-center gap-2">
          {title}
          {count != null && count > 0 && (
            <span className="flex items-center justify-center text-[9px] bg-purple-600 text-white font-bold w-4 h-4 rounded-full">{count}</span>
          )}
        </span>
        <ChevronDown size={14} className={`text-gray-400 transition-transform duration-300 ${open ? "rotate-180" : ""}`} />
      </button>
      {open && <div className="mt-3 animate-in fade-in slide-in-from-top-1 duration-200">{children}</div>}
    </div>
  );
}

// ─────────────────────────────────────────────
// ATTRIBUTE SECTION
// ─────────────────────────────────────────────

function AttributeSection({ attr, selected, searchTerm, onToggle, onSearchChange }: {
  attr: AttributeFilter; selected: string[]; searchTerm: string;
  onToggle: (slug: string, value: string) => void;
  onSearchChange: (slug: string, term: string) => void;
}) {
  const isColor = attr.slug.toLowerCase().includes("color") || attr.slug.toLowerCase().includes("colour");
  const visibleValues = attr.values.filter(
    (v) => !searchTerm || v.value.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Section title={attr.name} count={selected.length}>
      {attr.values.length > 6 && (
        <div className="relative mb-3">
          <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder={`Search ${attr.name.toLowerCase()}...`} value={searchTerm}
            onChange={(e) => onSearchChange(attr.slug, e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-medium outline-none focus:border-purple-600 transition-all" />
        </div>
      )}
      <div className="space-y-1 max-h-64 overflow-y-auto">
        {visibleValues.length === 0 ? <p className="text-xs text-gray-500 px-2">No results</p> : (
          visibleValues.map(({ value, count }) => {
            const swatch = isColor ? colorSwatch(value) : null;
            const active = selected.includes(value);
            return (
              <label key={value} className={`flex items-center gap-3 cursor-pointer px-2 py-1.5 rounded-lg transition-all ${active ? "bg-purple-50" : "hover:bg-gray-50"}`}>
                <input type="checkbox" checked={active} onChange={() => onToggle(attr.slug, value)} className="w-4 h-4 rounded border-gray-300 text-purple-600 focus:ring-0 focus:ring-offset-0" />
                {isColor && swatch && <span className="w-4 h-4 rounded-full border border-gray-300 shadow-sm" style={{ backgroundColor: swatch }} />}
                <span className={`text-xs font-medium flex-1 ${active ? "text-purple-600" : "text-gray-700"}`}>{value}</span>
                <span className="text-[10px] text-gray-400 font-bold">{count}</span>
              </label>
            );
          })
        )}
      </div>
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2 pt-2 border-t border-gray-200">
          {selected.map((v) => (
            <span key={v} className="inline-flex items-center gap-1 text-[10px] bg-purple-100 text-purple-700 border border-purple-200 px-2 py-0.5 rounded-full font-medium">
              {v}<button onClick={() => onToggle(attr.slug, v)}><X size={9} /></button>
            </span>
          ))}
        </div>
      )}
    </Section>
  );
}

// ─────────────────────────────────────────────
// FILTER PANEL
// ─────────────────────────────────────────────

function FilterPanel({ filters, data, loading, types, attrSearch, onTypeChange, onSubtypeChange,
  onToggleAttr, onToggleColor, onToggleSize, onAttrSearchChange, onPriceChange, onStockChange }: {
  filters: FilterState; data: FiltersResponse | null; loading: boolean; types: any[];
  attrSearch: Record<string, string>;
  onTypeChange: (id: number | undefined) => void;
  onSubtypeChange: (id: number | undefined) => void;
  onToggleAttr: (slug: string, value: string) => void;
  onToggleColor: (color: string) => void;
  onToggleSize: (size: string) => void;
  onAttrSearchChange: (slug: string, term: string) => void;
  onPriceChange: (min: number | undefined, max: number | undefined) => void;
  onStockChange: (stock: "in" | undefined) => void;
}) {
  const availableColors = data?.colors ?? [];
  const availableSizes  = data?.sizes  ?? [];

  return (
    <div className="space-y-2">

      {/* ── PRODUCT TYPES ── */}
      {types.length > 0 && (
        <Section title="Product Type" count={filters.typeId || filters.subtypeId ? 1 : 0}>
          <div className="space-y-2">
            {types.map((type) => (
              <div key={type.id}>
                <label className={`flex items-center justify-between px-3 py-2 rounded-lg transition-all cursor-pointer ${filters.typeId === type.id ? "bg-purple-50 text-purple-600" : "hover:bg-gray-50 text-gray-700"}`}>
                  <span className="text-sm font-medium">{type.name}</span>
                  <input 
                    type="radio" 
                    checked={filters.typeId === type.id} 
                    onChange={() => onTypeChange(filters.typeId === type.id ? undefined : type.id)} 
                    className="hidden" 
                  />
                  {filters.typeId === type.id && <Check size={14} strokeWidth={3} />}
                </label>
                {type.subtypes?.length > 0 && filters.typeId === type.id && (
                  <div className="ml-6 mt-2 space-y-1">
                    {type.subtypes.map((sub: any) => (
                      <label key={sub.id} className={`flex items-center justify-between px-3 py-1.5 rounded-lg transition-all cursor-pointer ${filters.subtypeId === sub.id ? "bg-purple-50 text-purple-600" : "hover:bg-gray-50 text-gray-600"}`}>
                        <span className="text-xs font-medium">{sub.name}</span>
                        <input 
                          type="radio" 
                          checked={filters.subtypeId === sub.id} 
                          onChange={() => onSubtypeChange(filters.subtypeId === sub.id ? undefined : sub.id)} 
                          className="hidden" 
                        />
                        {filters.subtypeId === sub.id && <Check size={12} strokeWidth={3} />}
                      </label>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* ── SKU COLORS ── */}
      {availableColors.length > 0 && (
        <Section title="Color" count={filters.colors?.length || 0}>
          <div className="space-y-1 max-h-64 overflow-y-auto">
            {availableColors.map(({ color, count }) => {
              const swatch = colorSwatch(color);
              const active = (filters.colors ?? []).includes(color);
              return (
                <label key={color} className={`flex items-center gap-3 cursor-pointer px-2 py-1.5 rounded-lg transition-all ${active ? "bg-purple-50" : "hover:bg-gray-50"}`}>
                  <input type="checkbox" checked={active} onChange={() => onToggleColor(color)} className="w-4 h-4 rounded border-gray-300 text-purple-600 focus:ring-0 focus:ring-offset-0" />
                  {swatch && <span className="w-4 h-4 rounded-full border border-gray-300 shadow-sm" style={{ backgroundColor: swatch }} />}
                  <span className={`text-xs font-medium flex-1 ${active ? "text-purple-600" : "text-gray-700"}`}>{color}</span>
                  <span className="text-[10px] text-gray-400 font-bold">{count}</span>
                </label>
              );
            })}
          </div>
          {(filters.colors ?? []).length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2 pt-2 border-t border-gray-200">
              {(filters.colors ?? []).map((c) => (
                <span key={c} className="inline-flex items-center gap-1 text-[10px] bg-purple-100 text-purple-700 border border-purple-200 px-2 py-0.5 rounded-full font-medium">
                  {c}<button onClick={() => onToggleColor(c)}><X size={9} /></button>
                </span>
              ))}
            </div>
          )}
        </Section>
      )}

      {/* ── SKU SIZES ── */}
      {availableSizes.length > 0 && (
        <Section title="Size" count={filters.sizes?.length || 0}>
          <div className="flex flex-wrap gap-2">
            {availableSizes.map(({ size, count }) => {
              const active = (filters.sizes ?? []).includes(size);
              return (
                <button key={size} onClick={() => onToggleSize(size)}
                  className={`px-4 py-2 rounded-lg border-2 font-bold text-xs transition-all ${active ? "border-purple-600 bg-purple-50 text-purple-600" : "border-gray-200 hover:border-gray-300 text-gray-700"}`}>
                  {size}<span className="ml-1 text-[9px] opacity-50">({count})</span>
                </button>
              );
            })}
          </div>
          {(filters.sizes ?? []).length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2 pt-2 border-t border-gray-200">
              {(filters.sizes ?? []).map((s) => (
                <span key={s} className="inline-flex items-center gap-1 text-[10px] bg-purple-100 text-purple-700 border border-purple-200 px-2 py-0.5 rounded-full font-medium">
                  {s}<button onClick={() => onToggleSize(s)}><X size={9} /></button>
                </span>
              ))}
            </div>
          )}
        </Section>
      )}

      {/* ── PRICE RANGE ── */}
      <Section title="Price Range" count={filters.minPrice || filters.maxPrice ? 1 : 0}>
        <div className="px-2 pt-4 pb-2">
          <div className="relative h-1.5 w-full bg-gray-200 rounded-full">
            <div className="absolute h-full bg-purple-600 rounded-full" style={{
              left: `${((filters.minPrice || 0) / (data?.price.max || 10000)) * 100}%`,
              right: `${100 - ((filters.maxPrice || data?.price.max || 10000) / (data?.price.max || 10000)) * 100}%`,
            }} />
            <input type="range" min={0} max={data?.price.max || 10000} value={filters.minPrice || 0}
              onChange={(e) => onPriceChange(Number(e.target.value), filters.maxPrice)}
              className="absolute pointer-events-none appearance-none bg-transparent w-full h-1.5 outline-none slider-thumb" />
            <input type="range" min={0} max={data?.price.max || 10000} value={filters.maxPrice || data?.price.max || 10000}
              onChange={(e) => onPriceChange(filters.minPrice, Number(e.target.value))}
              className="absolute pointer-events-none appearance-none bg-transparent w-full h-1.5 outline-none slider-thumb" />
          </div>
          <div className="flex justify-between mt-6">
            <div className="bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-200">
              <span className="text-[10px] block text-gray-500 font-bold uppercase">Min</span>
              <span className="text-xs font-bold text-gray-900">₹{filters.minPrice || 0}</span>
            </div>
            <div className="bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-200 text-right">
              <span className="text-[10px] block text-gray-500 font-bold uppercase">Max</span>
              <span className="text-xs font-bold text-gray-900">₹{filters.maxPrice || data?.price.max || "..."}</span>
            </div>
          </div>
        </div>
      </Section>

      {/* ── DYNAMIC ATTRIBUTES ── */}
      {loading ? (
        <div className="space-y-3 animate-pulse pt-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="pb-4 border-b border-gray-200">
              <div className="h-3 bg-gray-200 rounded w-1/2 mb-3" />
              <div className="space-y-2">
                <div className="h-3 bg-gray-100 rounded w-3/4" />
                <div className="h-3 bg-gray-100 rounded w-2/3" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        data?.filters?.map((attr) => (
          <AttributeSection key={attr.slug} attr={attr}
            selected={filters.attributes[attr.slug] || []}
            searchTerm={attrSearch[attr.slug] || ""}
            onToggle={onToggleAttr} onSearchChange={onAttrSearchChange} />
        ))
      )}

      {/* ── STOCK ── */}
      <Section title="Availability" count={filters.stock ? 1 : 0}>
        <label className="flex items-center gap-3 cursor-pointer px-2 py-2 rounded-lg hover:bg-gray-50">
          <input type="checkbox" checked={filters.stock === "in"}
            onChange={(e) => onStockChange(e.target.checked ? "in" : undefined)}
            className="w-4 h-4 rounded border-gray-300 text-purple-600 focus:ring-0" />
          <span className="text-sm font-medium text-gray-700">In Stock Only</span>
        </label>
      </Section>
    </div>
  );
}

// ─────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────

export default function FiltersSidebar({ categoryId, onFilter, initialFilters }: FiltersSidebarProps) {
  const [data, setData] = useState<FiltersResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [types, setTypes] = useState<any[]>([]);
  const [attrSearch, setAttrSearch] = useState<Record<string, string>>({});
  const [mobileOpen, setMobileOpen] = useState(false);

  const [filters, setFilters] = useState<FilterState>({
    attributes: {},
    colors: [],
    sizes: [],
    ...initialFilters,
    categoryId: categoryId ? Number(categoryId) : undefined,
  });

  const filtersRef = useRef(filters);
  useEffect(() => { filtersRef.current = filters; }, [filters]);

  // ─── Fetch /products/filters
  const fetchFilters = useCallback(async () => {
    if (!categoryId) { setData(null); setLoading(false); return; }

    setLoading(true);
    try {
      const params: Record<string, any> = { categoryId };

      // ✅ Pass typeId and subtypeId to get filtered results
      if (filtersRef.current.typeId)      params.typeId    = filtersRef.current.typeId;
      if (filtersRef.current.subtypeId)   params.subtypeId = filtersRef.current.subtypeId;
      if (filtersRef.current.colors?.length)    params.colors    = filtersRef.current.colors.join(",");
      if (filtersRef.current.sizes?.length)     params.sizes     = filtersRef.current.sizes.join(",");
      if (filtersRef.current.minPrice)          params.minPrice  = filtersRef.current.minPrice;
      if (filtersRef.current.maxPrice)          params.maxPrice  = filtersRef.current.maxPrice;

      for (const [slug, values] of Object.entries(filtersRef.current.attributes || {})) {
        if (values.length) params[slug] = values.join(",");
      }

      const res = await api.get("/products/filters", { params });
      setData(res.data);
    } catch (err) {
      console.error("Filter fetch failed:", err);
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [categoryId]);

  // Fetch product types
  useEffect(() => {
    if (!categoryId) return;
    api.get("/product-types", { params: { categoryId } })
      .then((res) => setTypes(Array.isArray(res.data) ? res.data : []))
      .catch(() => setTypes([]));
  }, [categoryId]);

  // Initial filter fetch & re-fetch when filters change
  useEffect(() => {
    fetchFilters();
  }, [fetchFilters, filters.typeId, filters.subtypeId, filters.colors, filters.sizes, filters.attributes, filters.minPrice, filters.maxPrice]);

  // ─── Handlers

  const handleTypeChange = useCallback((typeId: number | undefined) => {
    setFilters((prev) => {
      const next = { ...prev, typeId, subtypeId: undefined };
      setTimeout(() => onFilter(next), 0);
      return next;
    });
  }, [onFilter]);

  const handleSubtypeChange = useCallback((subtypeId: number | undefined) => {
    setFilters((prev) => {
      const next = { ...prev, subtypeId };
      setTimeout(() => onFilter(next), 0);
      return next;
    });
  }, [onFilter]);

  const toggleColor = useCallback((color: string) => {
    setFilters((prev) => {
      const current = prev.colors ?? [];
      const next = {
        ...prev,
        colors: current.includes(color)
          ? current.filter((c) => c !== color)
          : [...current, color],
      };
      setTimeout(() => onFilter(next), 0);
      return next;
    });
  }, [onFilter]);

  const toggleSize = useCallback((size: string) => {
    setFilters((prev) => {
      const current = prev.sizes ?? [];
      const next = {
        ...prev,
        sizes: current.includes(size)
          ? current.filter((s) => s !== size)
          : [...current, size],
      };
      setTimeout(() => onFilter(next), 0);
      return next;
    });
  }, [onFilter]);

  const toggleAttr = useCallback((slug: string, value: string) => {
    setFilters((prev) => {
      const current = prev.attributes[slug] ?? [];
      const next = {
        ...prev,
        attributes: {
          ...prev.attributes,
          [slug]: current.includes(value)
            ? current.filter((v) => v !== value)
            : [...current, value],
        },
      };
      setTimeout(() => onFilter(next), 0);
      return next;
    });
  }, [onFilter]);

  const handleAttrSearchChange = useCallback((slug: string, term: string) => {
    setAttrSearch((p) => ({ ...p, [slug]: term }));
  }, []);

  const handlePriceChange = useCallback((min: number | undefined, max: number | undefined) => {
    setFilters((prev) => {
      const next = { ...prev, minPrice: min, maxPrice: max };
      setTimeout(() => onFilter(next), 0);
      return next;
    });
  }, [onFilter]);

  const handleStockChange = useCallback((stock: "in" | undefined) => {
    setFilters((prev) => {
      const next = { ...prev, stock };
      setTimeout(() => onFilter(next), 0);
      return next;
    });
  }, [onFilter]);

  const reset = useCallback(() => {
    const cleared: FilterState = {
      categoryId: categoryId ? Number(categoryId) : undefined,
      attributes: {},
      colors: [],
      sizes: [],
    };
    setFilters(cleared);
    setAttrSearch({});
    onFilter(cleared);
  }, [categoryId, onFilter]);

  const filtersActive = activeCount(filters);

  return (
    <>
      <style>{`
        .slider-thumb::-webkit-slider-thumb { pointer-events: all; width: 16px; height: 16px; border-radius: 50%; background: #7C3AED; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.1); cursor: pointer; -webkit-appearance: none; }
        .slider-thumb::-moz-range-thumb { pointer-events: all; width: 16px; height: 16px; border-radius: 50%; background: #7C3AED; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.1); cursor: pointer; }
      `}</style>

      {/* Mobile toggle */}
      <div className="md:hidden mb-4">
        <button onClick={() => setMobileOpen(!mobileOpen)} className="w-full flex items-center justify-between px-4 py-3 bg-white border border-gray-200 rounded-lg shadow-sm font-medium text-gray-700">
          <span>Filters {filtersActive > 0 && `(${filtersActive})`}</span>
          <ChevronDown size={16} className={`transition-transform ${mobileOpen ? "rotate-180" : ""}`} />
        </button>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-black/40 backdrop-blur-sm">
          <div className="absolute right-0 top-0 bottom-0 w-full max-w-sm bg-white flex flex-col animate-in slide-in-from-right duration-300">
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200">
              <h3 className="font-bold text-lg">Filters</h3>
              <button onClick={() => setMobileOpen(false)} className="p-2 hover:bg-gray-100 rounded-lg"><X size={20} /></button>
            </div>
            <div className="flex-1 overflow-y-auto px-6 py-4">
              <FilterPanel filters={filters} data={data} loading={loading} types={types} attrSearch={attrSearch}
                onTypeChange={handleTypeChange} onSubtypeChange={handleSubtypeChange}
                onToggleAttr={toggleAttr} onToggleColor={toggleColor} onToggleSize={toggleSize}
                onAttrSearchChange={handleAttrSearchChange} onPriceChange={handlePriceChange} onStockChange={handleStockChange} />
            </div>
            <div className="border-t border-gray-200 px-6 py-4 bg-white flex gap-3">
              <button onClick={reset} className="flex-1 py-3 rounded-lg font-medium text-sm border-2 border-gray-200 text-gray-700 hover:bg-gray-50">Reset</button>
              <button onClick={() => setMobileOpen(false)} className="flex-1 bg-purple-600 text-white py-3 rounded-lg font-medium text-sm shadow-lg hover:bg-purple-700">Apply</button>
            </div>
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className="bg-white rounded-2xl border border-gray-200 shadow-sm hidden md:block">
        <div className="px-5 py-5">
          <div className="flex justify-between items-center mb-5 pb-4 border-b border-gray-200">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-700">Filters</h3>
            {filtersActive > 0 && (
              <button onClick={reset} className="text-[10px] font-bold uppercase text-purple-600 hover:underline flex items-center gap-1">
                <RotateCcw size={10} /> Clear
              </button>
            )}
          </div>
          <FilterPanel filters={filters} data={data} loading={loading} types={types} attrSearch={attrSearch}
            onTypeChange={handleTypeChange} onSubtypeChange={handleSubtypeChange}
            onToggleAttr={toggleAttr} onToggleColor={toggleColor} onToggleSize={toggleSize}
            onAttrSearchChange={handleAttrSearchChange} onPriceChange={handlePriceChange} onStockChange={handleStockChange} />
        </div>
      </aside>
    </>
  );
}
