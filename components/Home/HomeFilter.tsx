"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { Search, ChevronDown, ChevronUp, RotateCcw, Filter } from "lucide-react";

export default function SidebarFilter({ onFilter }: { onFilter?: (f: any) => void }) {
  const [types, setTypes] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [expanded, setExpanded] = useState<Record<string, boolean>>({ category: true });
  
  const [selectedFilters, setSelectedFilters] = useState({
    productTypes: [] as string[],
    subTypes: [] as string[],
    sort: "relevance",
  });

  useEffect(() => {
    api.get("/product-types")
      .then((res) => setTypes(Array.isArray(res.data) ? res.data : []))
      .catch(() => setTypes([]));
  }, []);

  const handleReset = () => {
    const resetValues = {
      productTypes: [],
      subTypes: [],
      sort: "relevance",
    };
    setSelectedFilters(resetValues);
    onFilter?.(resetValues); // Immediate update on reset
  };

  const handleApply = () => {
    onFilter?.(selectedFilters);
  };

  const toggleFilter = (section: string) => {
    setExpanded(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const handleCheckboxChange = (id: string, isSubType = false) => {
    const key = isSubType ? 'subTypes' : 'productTypes';
    setSelectedFilters(prev => ({
      ...prev,
      [key]: prev[key].includes(id) 
        ? prev[key].filter(i => i !== id) 
        : [...prev[key], id]
    }));
  };

  return (
    <aside className="w-full md:w-64 flex flex-col gap-4 bg-white border border-gray-100 rounded-xl shadow-sm p-5 sticky top-24 h-fit">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-lg font-bold text-amazon-darkBlue flex items-center gap-2">
          <Filter size={18} /> Filters
        </h2>
        <button 
          onClick={handleReset}
          className="text-xs font-medium text-slate-500 hover:text-amazon-danger flex items-center gap-1 transition-colors"
        >
          <RotateCcw size={12} /> Reset
        </button>
      </div>
      
      <p className="text-xs text-amazon-mutedText border-b border-gray-100 pb-4">Showing results for your selection</p>

      {/* SORT BY */}
      <div className="mt-2">
        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 block">Sort By</label>
        <select 
          className="w-full border border-gray-200 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-slate-200 outline-none cursor-pointer bg-slate-50"
          value={selectedFilters.sort}
          onChange={(e) => setSelectedFilters({...selectedFilters, sort: e.target.value})}
        >
          <option value="relevance">Relevance</option>
          <option value="newest">Newest</option>
          <option value="low_to_high">Price: Low to High</option>
          <option value="high_to_low">Price: High to Low</option>
        </select>
      </div>

      {/* CATEGORY ACCORDION */}
      <div className="mt-4 pt-4 border-t border-gray-50">
        <button 
          onClick={() => toggleFilter('category')}
          className="flex items-center justify-between w-full mb-4 group"
        >
          <span className="text-sm font-bold text-amazon-darkBlue uppercase tracking-tight">Category</span>
          {expanded.category ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
        </button>

        {expanded.category && (
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
              <input 
                type="text"
                placeholder="Search category..."
                className="w-full bg-slate-50 border border-gray-200 rounded-lg py-2 pl-9 pr-3 text-sm outline-none focus:border-slate-400 transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="max-h-64 overflow-y-auto pr-2 custom-scrollbar space-y-3">
              {types
                .filter(t => t.name.toLowerCase().includes(searchTerm.toLowerCase()))
                .map((type) => (
                <div key={type.id} className="space-y-2">
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input 
                      type="checkbox" 
                      className="w-4 h-4 accent-slate-800 rounded border-gray-300"
                      checked={selectedFilters.productTypes.includes(type.id)}
                      onChange={() => handleCheckboxChange(type.id)}
                    />
                    <span className="text-sm text-slate-600 group-hover:text-slate-900 font-medium transition-colors">
                      {type.name}
                    </span>
                  </label>
                  
                  {selectedFilters.productTypes.includes(type.id) && type.subTypes?.map((sub: any) => (
                    <label key={sub.id} className="flex items-center gap-3 ml-7 cursor-pointer group">
                       <input 
                        type="checkbox" 
                        className="w-3.5 h-3.5 accent-slate-500 rounded border-gray-300"
                        checked={selectedFilters.subTypes.includes(sub.id)}
                        onChange={() => handleCheckboxChange(sub.id, true)}
                      />
                      <span className="text-xs text-slate-500 group-hover:text-slate-800">
                        {sub.name}
                      </span>
                    </label>
                  ))}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ACTION BUTTONS */}
      <div className="mt-6 pt-6 border-t border-gray-100 space-y-3">
        <button
          onClick={handleApply}
          className="w-full bg-amazon-darkBlue text-white py-3 rounded-lg font-bold text-sm hover:bg-slate-800 transition-all shadow-md active:scale-[0.98]"
        >
          Apply Filters
        </button>
      </div>
    </aside>
  );
}
