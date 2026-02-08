"use client";

import Link from "next/link";
import { useState, useRef } from "react"; // Added useRef
import { FiSearch, FiMenu, FiChevronDown } from "react-icons/fi";
import { HiOutlineShoppingBag, HiOutlineShoppingCart, HiOutlineUser } from "react-icons/hi2";
import { LuStore } from "react-icons/lu"; 
import { useRouter } from "next/navigation";
import MobileMenu from "./MobileMenu";
import MegaMenu from "./MegaMenu";
import { useAuth } from "@/app/context/AuthContext";
import { useAuthModal } from "@/app/auth/AuthModalContext";

export default function NavbarClient({ categories }: { categories: any[] }) {
  const router = useRouter();
  const { user, logout } = useAuth();
  const { openLogin, openRegister } = useAuthModal();
  const [query, setQuery] = useState("");
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<number | null>(null);
  
  // --- HOVER DELAY LOGIC ---
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = (id: number) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setActiveCategory(id);
  };

  const handleMouseLeave = () => {
    // 300ms delay gives users time to move mouse to the menu
    timeoutRef.current = setTimeout(() => {
      setActiveCategory(null);
    }, 300); 
  };

  const handleSearch = () => {
    if (!query.trim()) return;
    router.push(`/search?query=${encodeURIComponent(query.trim())}`);
  };

  const openAuth = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    openRegister();
    openLogin();
    setShowProfileMenu(false);
  };

  return (
    <div className="bg-[#f1f3f6] w-full">
      {/* SECTION 1: TOP NAV - STICKY */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-[60] shadow-sm">
        <div className="max-w-[1244px] mx-auto px-4 h-16 md:h-20 flex items-center justify-between gap-4 md:gap-8">
          <div className="flex items-center gap-4 shrink-0">
            <button onClick={() => setIsMobileMenuOpen(true)} className="p-2 xl:hidden hover:bg-gray-100 rounded-lg transition-colors">
              <FiMenu size={24} />
            </button>
            <Link href="/" className="flex items-center shrink-0">
              <div className="relative w-32 md:w-44 transition-transform group-hover:scale-105 duration-300">
                <img src="/shopybucks.jpg" alt="ShopyBucks Logo" className="w-full h-auto object-contain" />
              </div>
            </Link>
          </div>

          <div className="hidden md:flex flex-1 max-w-2xl items-center bg-[#F0F5FF] border border-transparent focus-within:bg-white focus-within:border-gray-300 rounded-md px-4 py-2 transition-all">
            <FiSearch className="text-[#2874f0] shrink-0" size={20} />
            <input
              className="w-full bg-transparent pl-3 outline-none text-sm text-gray-800"
              placeholder="Search for Products, Brands and More"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
          </div>

          <div className="flex items-center gap-4 lg:gap-8 shrink-0">
            <div className="relative group cursor-pointer" onMouseEnter={() => setShowProfileMenu(true)} onMouseLeave={() => setShowProfileMenu(false)}>
              <div onClick={!user ? openAuth : undefined} className={`flex items-center gap-1 px-3 py-1.5 rounded-md transition-all ${!user ? 'bg-white border border-gray-200 hover:bg-[#2874f0] hover:text-white group' : ''}`}>
                <HiOutlineUser size={20} />
                <span className="text-sm font-bold">{user ? user.name : "Login"}</span>
                <FiChevronDown className={`transition-transform duration-200 ${showProfileMenu ? 'rotate-180' : ''}`} />
              </div>
              {showProfileMenu && (
                <div className="absolute top-full right-0 w-64 pt-2 animate-in fade-in slide-in-from-top-1 z-[70]">
                  <div className="bg-white border border-gray-100 shadow-2xl rounded-sm overflow-hidden text-sm">
                    {!user ? (
                      <div className="p-4 border-b flex justify-between items-center">
                        <span className="font-medium text-gray-600 italic">New customer?</span>
                        <button onClick={openLogin} className="text-[#2874f0] font-black uppercase tracking-tighter hover:underline">Sign Up</button>
                      </div>
                    ) : (
                      <div className="p-3 border-b bg-gray-50 font-black text-[#4F1271] uppercase tracking-tighter">Welcome, {user.name}</div>
                    )}
                    <Link href="/profile" className="flex items-center gap-3 p-3 hover:bg-gray-50 font-bold transition-colors">
                        <HiOutlineUser className="text-gray-400" /> My Profile
                    </Link>
                    <Link href="/orders" className="flex items-center gap-3 p-3 hover:bg-gray-50 font-bold transition-colors">
                        <HiOutlineShoppingBag className="text-gray-400" /> Orders
                    </Link>
                    {user && (
                        <button onClick={logout} className="w-full text-left p-3 text-red-500 hover:bg-red-50 border-t font-black uppercase tracking-widest">Logout</button>
                    )}
                  </div>
                </div>
              )}
            </div>

            <Link href="/cart" className="flex items-center gap-2 group font-bold transition-colors hover:text-amazon-orange">
              <div className="relative">
                <HiOutlineShoppingCart size={24} />
                <span className="absolute -top-2 -right-2 bg-amazon-orange text-white text-[10px] font-black h-4 w-4 flex items-center justify-center rounded-full border-2 border-white">0</span>
              </div>
              <span className="hidden lg:block text-sm uppercase tracking-tighter">Cart</span>
            </Link>
          </div>
        </div>
      </div>

      {/* SECTION 2: CATEGORY BAR */}
      <div className="hidden md:block bg-white border-b border-genz-border shadow-sm relative z-50">
        <div className="max-w-7xl mx-auto px-4 md:px-8 relative">
          <div className="flex items-center gap-8 lg:gap-12 overflow-x-auto no-scrollbar py-4">
            {categories.map((c) => (
              <div 
                key={c.id} 
                onMouseEnter={() => handleMouseEnter(c.id)}
                onMouseLeave={handleMouseLeave}
                className="flex-shrink-0 whitespace-nowrap cursor-pointer"
              >
                <Link 
                  href={`/all-products?categoryId=${c.id}`}
                  className={`text-[13px] font-black uppercase tracking-tight flex items-center gap-1 transition-colors ${
                    activeCategory === c.id ? "text-genz-accent" : "text-genz-ink"
                  }`}
                >
                  {c.name}
                  <FiChevronDown className={`transition-transform duration-200 ${activeCategory === c.id ? 'rotate-180' : ''}`} />
                </Link>
              </div>
            ))}
          </div>

          {/* MEGAMENU CONTAINER */}
          <div 
            onMouseEnter={() => {
                if (timeoutRef.current) clearTimeout(timeoutRef.current);
            }}
            onMouseLeave={handleMouseLeave}
            className={`absolute top-full left-0 right-0 z-[100] flex justify-center transition-all duration-300 ${
              activeCategory ? "opacity-100 visible translate-y-0" : "opacity-0 invisible -translate-y-2"
            }`}
          >
            {activeCategory && (
              <div className="w-full max-w-[1244px] bg-white shadow-2xl rounded-b-genz border-x border-b border-genz-border overflow-hidden">
                <MegaMenu categoryId={activeCategory} />
              </div>
            )}
          </div>
        </div>
      </div>

      {isMobileMenuOpen && (
        <MobileMenu categories={categories} onClose={() => setIsMobileMenuOpen(false)} />
      )}
    </div>
  );
}
