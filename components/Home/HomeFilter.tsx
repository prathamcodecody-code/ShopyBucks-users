"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { api } from "@/lib/api";
import {
  ChevronDown,
  RotateCcw,
  Search,
  X,
  SlidersHorizontal,
  Check,
} from "lucide-react";
import { HomeFilterState } from "@/app/page";

// ─────────────────────────────────────────────
// TYPES & HELPERS
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
}

export interface FullHomeFilterState extends HomeFilterState {
  categoryId?: number;
  attributes: Record<string, string[]>;
}

interface HomeFilterProps {
  onFilter: (filters: FullHomeFilterState) => void;
  initialFilters?: Partial<FullHomeFilterState>;
  categories: { id: number; name: string; slug: string }[];
}

const CSS_COLORS: Record<string, string> = {
  black: "#0F172A", white: "#FFFFFF", red: "#EF4444", blue: "#3B82F6",
  green: "#22C55E", yellow: "#EAB308", orange: "#EA580C", pink: "#EC4899",
  purple: "#A855F7", brown: "#92400E", grey: "#64748B", gray: "#64748B",
};

function colorSwatch(value: string): string | null {
  return CSS_COLORS[value.toLowerCase()] ?? null;
}

function activeCount(f: FullHomeFilterState): number {
  let n = 0;
  if (f.minPrice || f.maxPrice) n++;
  if (f.stock) n++;
  if (f.sort && f.sort !== "newest") n++;
  if (f.season) n++;
  if (f.occasion) n++;
  for (const vals of Object.values(f.attributes || {})) {
    if (vals.length) n++;
  }
  return n;
}

// ─────────────────────────────────────────────
// Section — defined OUTSIDE the main component
// so React never remounts it on parent re-renders
// ─────────────────────────────────────────────

function Section({
  title,
  count,
  children,
  defaultOpen = false,
}: {
  title: string;
  count?: number;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="pb-4 mb-2 border-b border-genz-border last:border-0 last:mb-0">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex justify-between items-center w-full text-left py-2 group"
      >
        <span className="text-xs font-black uppercase tracking-widest text-genz-ink flex items-center gap-2">
          {title}
          {count != null && count > 0 && (
            <span className="flex items-center justify-center text-[9px] bg-genz-accent text-white font-black w-4 h-4 rounded-full">
              {count}
            </span>
          )}
        </span>
        <ChevronDown
          size={14}
          className={`text-genz-muted transition-transform duration-300 ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <div className="mt-2 animate-in fade-in slide-in-from-top-1 duration-200">
          {children}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// AttributeSection — also outside main render
// Receives everything as props, no stale closures
// ─────────────────────────────────────────────

function AttributeSection({
  attr,
  selected,
  searchTerm,
  onToggle,
  onSearchChange,
}: {
  attr: AttributeFilter;
  selected: string[];
  searchTerm: string;
  onToggle: (slug: string, value: string) => void;
  onSearchChange: (slug: string, term: string) => void;
}) {
  const isColor =
    attr.slug.toLowerCase().includes("color") ||
    attr.slug.toLowerCase().includes("colour");

  const visibleValues = attr.values.filter(
    (v) => !searchTerm || v.value.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Section title={attr.name} count={selected.length}>
      {attr.values.length > 6 && (
        <div className="relative mb-3 group">
          <Search
            size={12}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-genz-muted group-focus-within:text-genz-accent"
          />
          <input
            type="text"
            placeholder={`Search ${attr.name.toLowerCase()}...`}
            value={searchTerm}
            onChange={(e) => onSearchChange(attr.slug, e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-genz-bg border border-genz-border rounded-xl text-[11px] font-bold outline-none focus:border-genz-accent transition-all"
          />
        </div>
      )}

      <div className="space-y-1">
        {visibleValues.length === 0 ? (
          <p className="text-xs text-genz-muted px-2">No results</p>
        ) : (
          visibleValues.map(({ value, count }) => {
            const swatch = isColor ? colorSwatch(value) : null;
            const active = selected.includes(value);
            return (
              <label
                key={value}
                className={`flex items-center gap-3 cursor-pointer px-2 py-1.5 rounded-xl transition-all ${
                  active ? "bg-orange-50" : "hover:bg-genz-bg"
                }`}
              >
                <input
                  type="checkbox"
                  checked={active}
                  onChange={() => onToggle(attr.slug, value)}
                  className="w-4 h-4 rounded border-genz-border text-genz-accent focus:ring-0"
                />
                {isColor && (
                  <span
                    className="w-4 h-4 rounded-full border border-genz-border shadow-sm"
                    style={{ backgroundColor: swatch || "#EEE" }}
                  />
                )}
                <span className={`text-xs font-bold flex-1 ${active ? "text-genz-accent" : "text-genz-muted"}`}>
                  {value}
                </span>
                <span className="text-[10px] text-genz-muted opacity-40 font-black">{count}</span>
              </label>
            );
          })
        )}
      </div>

      {selected.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2 pt-2 border-t border-genz-border">
          {selected.map((v) => (
            <span
              key={v}
              className="inline-flex items-center gap-1 text-[10px] bg-orange-100 text-orange-700 border border-orange-200 px-2 py-0.5 rounded-full font-bold"
            >
              {v}
              <button onClick={() => onToggle(attr.slug, v)}><X size={9} /></button>
            </span>
          ))}
        </div>
      )}
    </Section>
  );
}

// ─────────────────────────────────────────────
// FilterPanel — the actual panel content, also
// a proper named component defined outside the
// main component to prevent remount on re-renders
// ─────────────────────────────────────────────

interface FilterPanelProps {
  filters: FullHomeFilterState;
  data: FiltersResponse | null;
  loading: boolean;
  categories: { id: number; name: string; slug: string }[];
  attrSearch: Record<string, string>;
  onCategoryChange: (id: number) => void;
  onToggleAttr: (slug: string, value: string) => void;
  onAttrSearchChange: (slug: string, term: string) => void;
  onPriceChange: (min: number | undefined, max: number | undefined) => void;
}

function FilterPanel({
  filters,
  data,
  loading,
  categories,
  attrSearch,
  onCategoryChange,
  onToggleAttr,
  onAttrSearchChange,
  onPriceChange,
}: FilterPanelProps) {
  return (
    <div className="space-y-2">

      {/* ── CATEGORY ── */}
      <Section title="Category" defaultOpen count={filters.categoryId ? 1 : 0}>
        <div className="grid grid-cols-1 gap-1">
          {categories.map((cat) => (
            <label
              key={cat.id}
              className={`flex items-center justify-between px-3 py-2 rounded-xl transition-all cursor-pointer ${
                filters.categoryId === cat.id
                  ? "bg-orange-50 text-genz-accent"
                  : "hover:bg-genz-bg text-genz-muted"
              }`}
            >
              <span className="text-sm font-bold">{cat.name}</span>
              <input
                type="radio"
                checked={filters.categoryId === cat.id}
                onChange={() => onCategoryChange(cat.id)}
                className="hidden"
              />
              {filters.categoryId === cat.id && <Check size={14} strokeWidth={3} />}
            </label>
          ))}
        </div>
      </Section>

      {/* ── PRICE ── */}
      <Section title="Price Range" defaultOpen count={filters.minPrice || filters.maxPrice ? 1 : 0}>
        <div className="px-2 pt-4 pb-2">
          <div className="relative h-1.5 w-full bg-genz-border rounded-full">
            <div
              className="absolute h-full bg-genz-accent rounded-full"
              style={{
                left: `${((filters.minPrice || 0) / (data?.price.max || 10000)) * 100}%`,
                right: `${100 - ((filters.maxPrice || data?.price.max || 10000) / (data?.price.max || 10000)) * 100}%`,
              }}
            />
            <input
              type="range" min={0} max={data?.price.max || 10000}
              value={filters.minPrice || 0}
              onChange={(e) => onPriceChange(Number(e.target.value), filters.maxPrice)}
              className="absolute pointer-events-none appearance-none bg-transparent w-full h-1.5 outline-none slider-thumb"
            />
            <input
              type="range" min={0} max={data?.price.max || 10000}
              value={filters.maxPrice || data?.price.max || 10000}
              onChange={(e) => onPriceChange(filters.minPrice, Number(e.target.value))}
              className="absolute pointer-events-none appearance-none bg-transparent w-full h-1.5 outline-none slider-thumb"
            />
          </div>
          <div className="flex justify-between mt-6">
            <div className="bg-genz-bg px-3 py-1.5 rounded-lg border border-genz-border">
              <span className="text-[10px] block text-genz-muted font-black uppercase">Min</span>
              <span className="text-xs font-bold text-genz-ink">₹{filters.minPrice || 0}</span>
            </div>
            <div className="bg-genz-bg px-3 py-1.5 rounded-lg border border-genz-border text-right">
              <span className="text-[10px] block text-genz-muted font-black uppercase">Max</span>
              <span className="text-xs font-bold text-genz-ink">
                ₹{filters.maxPrice || data?.price.max || "..."}
              </span>
            </div>
          </div>
        </div>
      </Section>

      {/* ── DYNAMIC ATTRIBUTES ── */}
      {loading ? (
        <div className="space-y-3 animate-pulse pt-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="pb-4 border-b border-genz-border">
              <div className="h-3 bg-gray-200 rounded w-1/2 mb-3" />
              <div className="space-y-2">
                <div className="h-3 bg-gray-100 rounded w-3/4" />
                <div className="h-3 bg-gray-100 rounded w-2/3" />
                <div className="h-3 bg-gray-100 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        data?.filters?.map((attr) => (
          <AttributeSection
            key={attr.slug}
            attr={attr}
            selected={filters.attributes[attr.slug] || []}
            searchTerm={attrSearch[attr.slug] || ""}
            onToggle={onToggleAttr}
            onSearchChange={onAttrSearchChange}
          />
        ))
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────

export default function HomeFilter({ onFilter, initialFilters, categories }: HomeFilterProps) {
  const [data, setData]           = useState<FiltersResponse | null>(null);
  const [loading, setLoading]     = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [attrSearch, setAttrSearch] = useState<Record<string, string>>({});
  const [filters, setFilters]     = useState<FullHomeFilterState>({
    sort: "newest",
    attributes: {},
    ...initialFilters,
  });

  // ✅ Always-current ref — callbacks that call onFilter
  // read from this ref instead of the stale closure value
  const filtersRef = useRef(filters);
  useEffect(() => { filtersRef.current = filters; }, [filters]);

  const attrsKey = JSON.stringify(filters.attributes);

  const fetchFilters = useCallback(async () => {
    if (!filters.categoryId) { setData(null); setLoading(false); return; }
    setLoading(true);
    try {
      const params: Record<string, any> = { categoryId: filters.categoryId };
      const attrs = JSON.parse(attrsKey);
      for (const [slug, values] of Object.entries(attrs)) {
        if ((values as string[]).length) params[slug] = (values as string[]).join(",");
      }
      if (filters.season)   params.season   = filters.season;
      if (filters.occasion) params.occasion = filters.occasion;
      const res = await api.get("/products/filters", { params });
      setData(res.data);
    } catch (err) {
      console.error("Filter fetch failed:", err);
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [filters.categoryId, attrsKey, filters.season, filters.occasion]);

  useEffect(() => { fetchFilters(); }, [fetchFilters]);

  // Category — immediately fires onFilter
  const handleCategoryChange = useCallback((categoryId: number) => {
    const next: FullHomeFilterState = {
      ...filtersRef.current,
      categoryId,
      attributes: {},
    };
    setFilters(next);
    setAttrSearch({});
    onFilter(next);
  }, [onFilter]);

  // ✅ THE CORE FIX: toggleAttr builds the complete next
  // state inside the functional updater (so it's never
  // stale), then immediately calls onFilter with it.
  // This means every checkbox tick fires a product fetch —
  // no need to press Apply for attributes to work.
  const toggleAttr = useCallback((slug: string, value: string) => {
    setFilters((prev) => {
      const current  = prev.attributes[slug] || [];
      const nextVals = current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value];
      const next: FullHomeFilterState = {
        ...prev,
        attributes: { ...prev.attributes, [slug]: nextVals },
      };
      // setTimeout(0) defers until after React commits the state update,
      // so onFilter always receives the correct next state object.
      setTimeout(() => onFilter(next), 0);
      return next;
    });
  }, [onFilter]);

  const handleAttrSearchChange = useCallback((slug: string, term: string) => {
    setAttrSearch((p) => ({ ...p, [slug]: term }));
  }, []);

  const handlePriceChange = useCallback((min: number | undefined, max: number | undefined) => {
    setFilters((p) => ({ ...p, minPrice: min, maxPrice: max }));
  }, []);

  const reset = useCallback(() => {
    const cleared: FullHomeFilterState = {
      sort: "newest",
      categoryId: initialFilters?.categoryId,
      attributes: {},
    };
    setFilters(cleared);
    setAttrSearch({});
    onFilter(cleared);
  }, [initialFilters?.categoryId, onFilter]);

  const apply = useCallback(() => {
    onFilter(filtersRef.current);
    setMobileOpen(false);
  }, [onFilter]);

  const filtersActive = activeCount(filters);

  // ─────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────
  return (
    <>
      <style>{`
        .slider-thumb::-webkit-slider-thumb { pointer-events: all; width: 18px; height: 18px; border-radius: 50%; background: #EA580C; border: 3px solid white; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1); cursor: pointer; -webkit-appearance: none; }
        .slider-thumb::-moz-range-thumb { pointer-events: all; width: 18px; height: 18px; border-radius: 50%; background: #EA580C; border: 3px solid white; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1); cursor: pointer; }
      `}</style>

      {/* ── MOBILE TRIGGER ── */}
      <div className="lg:hidden fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setMobileOpen(true)}
          className="bg-genz-ink text-white px-6 py-4 rounded-full shadow-2xl flex items-center gap-3 font-black text-xs uppercase tracking-widest active:scale-95 transition-all"
        >
          <SlidersHorizontal size={16} strokeWidth={3} />
          Filters {filtersActive > 0 && `(${filtersActive})`}
        </button>
      </div>

      {/* ── MOBILE DRAWER ── */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-[100] bg-genz-ink/60 backdrop-blur-md">
          <div className="absolute right-0 top-0 bottom-0 w-full max-w-sm bg-white flex flex-col animate-in slide-in-from-right duration-300">
            <div className="flex justify-between items-center px-6 py-5 border-b border-genz-border">
              <h3 className="font-black text-xl uppercase tracking-tighter">Refine</h3>
              <button onClick={() => setMobileOpen(false)} className="p-2 bg-genz-bg rounded-full text-genz-ink">
                <X size={20} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-6 py-4">
              <FilterPanel
                filters={filters}
                data={data}
                loading={loading}
                categories={categories}
                attrSearch={attrSearch}
                onCategoryChange={handleCategoryChange}
                onToggleAttr={toggleAttr}
                onAttrSearchChange={handleAttrSearchChange}
                onPriceChange={handlePriceChange}
              />
            </div>
            <div className="border-t border-genz-border px-6 py-5 bg-white flex gap-4">
              <button onClick={reset} className="flex-1 py-4 rounded-full font-black text-[10px] uppercase border-2 border-genz-border text-genz-muted">
                Reset
              </button>
              <button onClick={apply} className="flex-1 bg-genz-accent text-white py-4 rounded-full font-black text-[10px] uppercase shadow-xl shadow-orange-500/20">
                Apply
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── DESKTOP PANEL ── */}
      <div className="hidden lg:block">
        <div className="flex justify-between items-center mb-6 pb-4 border-b border-genz-border">
          <h3 className="text-xs font-black uppercase tracking-[0.2em] text-genz-ink">Filters</h3>
          {filtersActive > 0 && (
            <button
              onClick={reset}
              className="text-[10px] font-black uppercase text-genz-accent hover:underline flex items-center gap-1"
            >
              <RotateCcw size={10} /> Clear
            </button>
          )}
        </div>

        <FilterPanel
          filters={filters}
          data={data}
          loading={loading}
          categories={categories}
          attrSearch={attrSearch}
          onCategoryChange={handleCategoryChange}
          onToggleAttr={toggleAttr}
          onAttrSearchChange={handleAttrSearchChange}
          onPriceChange={handlePriceChange}
        />

        <div className="mt-6 pt-6 border-t border-genz-border">
          <button
            onClick={apply}
            className="w-full bg-genz-ink text-white py-4 rounded-full font-black text-[10px] uppercase tracking-widest shadow-xl transition-all active:scale-[0.98]"
          >
            Apply Filters
          </button>
        </div>
      </div>
    </>
  );
}
