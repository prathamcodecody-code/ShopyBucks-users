"use client";

import Link from "next/link";
import { useState } from "react";
import { FiSearch, FiMenu, FiChevronDown } from "react-icons/fi";
import { HiOutlineShoppingBag, HiOutlineUser } from "react-icons/hi2";
import { AiOutlineHeart } from "react-icons/ai";
import { LuStore } from "react-icons/lu"; // Store icon for 'Become a Seller'
import { useRouter } from "next/navigation";
import MegaMenu from "./MegaMenu";
import MobileMenu from "./MobileMenu";
import { useAuth } from "@/app/context/AuthContext";

export default function NavbarClient({ categories }: { categories: any[] }) {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [query, setQuery] = useState("");
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [activeCategory, setActiveCategory] = useState<number | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const categoryImages: Record<string, string> = {
    "Women": "/categories/women.jpg",
    "Men": "/categories/men.jpg",
    "Kids": "/categories/kids.jpg",
    "Sports": "/categories/sports.png",
    "Beauty": "/categories/beauty.png",
    "Electronics": "/categories/electronics.png",
  };

  const handleSearch = () => {
    if (!query.trim()) return;
    router.push(`/search?query=${encodeURIComponent(query.trim())}`);
  };

  const openAuth = () => {
    window.dispatchEvent(new Event("open-auth-modal"));
  };

  return (
    <div className="bg-[#f1f3f6] w-full">
      {/* SECTION 1: TOP NAV (STICKY) */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-[60] shadow-sm">
        <div className="max-w-[1244px] mx-auto px-4 h-16 md:h-20 flex items-center justify-between gap-4 md:gap-8">
          
          {/* LOGO & MOBILE MENU */}
          <div className="flex items-center gap-4 shrink-0">
            <button onClick={() => setIsMobileMenuOpen(true)} className="p-2 xl:hidden">
              <FiMenu size={24} />
            </button>
            <Link href="/" className="flex items-center">
              <span className="text-xl md:text-2xl font-black text-[#4F1271] uppercase tracking-tighter">Shopy</span>
              <span className="text-xl md:text-2xl font-black text-amazon-orange italic uppercase tracking-tighter ml-1">Bucks</span>
            </Link>
          </div>

          {/* SEARCH BAR (FLIPKART STYLE) */}
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

          {/* ACTIONS */}
          <div className="flex items-center gap-4 lg:gap-8 shrink-0">
            
            {/* PROFILE / LOGIN */}
            <div 
              className="relative group cursor-pointer"
              onMouseEnter={() => setShowProfileMenu(true)}
              onMouseLeave={() => setShowProfileMenu(false)}
            >
              <div 
                onClick={!user ? openAuth : undefined}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-md transition-all ${!user ? 'bg-white border border-gray-200 hover:bg-[#2874f0] hover:text-white group' : ''}`}
              >
                <HiOutlineUser size={20} />
                <span className="text-sm font-bold">{user ? user.name : "Login"}</span>
                <FiChevronDown className={`transition-transform duration-200 ${showProfileMenu ? 'rotate-180' : ''}`} />
              </div>
              
              {showProfileMenu && (
                <div className="absolute top-full right-0 w-60 pt-2 animate-in fade-in slide-in-from-top-1">
                  <div className="bg-white border border-gray-100 shadow-2xl rounded-sm overflow-hidden text-sm">
                    {!user ? (
                      <div className="p-4 border-b flex justify-between items-center">
                        <span className="font-medium text-gray-600">New customer?</span>
                        <button onClick={openAuth} className="text-[#2874f0] font-bold">Sign Up</button>
                      </div>
                    ) : (
                      <div className="p-3 border-b bg-gray-50 font-bold text-[#4F1271]">Welcome, {user.name}</div>
                    )}
                    <Link href="/profile" className="flex items-center gap-3 p-3 hover:bg-gray-50"><HiOutlineUser /> My Profile</Link>
                    <Link href="/orders" className="flex items-center gap-3 p-3 hover:bg-gray-50"><HiOutlineShoppingBag /> Orders</Link>
                    <Link href="/wishlist" className="flex items-center gap-3 p-3 hover:bg-gray-50"><AiOutlineHeart /> Wishlist</Link>
                    {user && <button onClick={logout} className="w-full text-left p-3 text-red-500 hover:bg-red-50 border-t">Logout</button>}
                  </div>
                </div>
              )}
            </div>

            {/* CART */}
            <Link href="/cart" className="flex items-center gap-2 group font-bold">
              <div className="relative">
                <HiOutlineShoppingBag size={24} />
                <span className="absolute -top-2 -right-2 bg-amazon-orange text-white text-[10px] font-bold px-1.5 rounded-full">0</span>
              </div>
              <span className="hidden lg:block text-sm">Cart</span>
            </Link>

            {/* BECOME A SELLER (FLIPKART STYLE) */}
            <Link 
              href="https://seller.shopybucks.com/" 
              className="hidden xl:flex items-center gap-2 group transition-colors hover:text-amazon-orange"
            >
              <LuStore size={20} className="text-gray-700 group-hover:text-amazon-orange transition-colors" />
              <span className="text-sm font-bold whitespace-nowrap">Become a Seller</span>
            </Link>

          </div>
        </div>
      </div>

      {/* SECTION 2: CATEGORY BAR (SCROLLS AWAY) */}
      <div className="hidden md:block bg-white border-b border-gray-100 shadow-sm relative">
        <div className="max-w-[1244px] mx-auto px-4 py-3 flex items-center justify-center gap-8 lg:gap-12">
          {categories.map((c) => (
            <div 
              key={c.id} 
              onMouseEnter={() => setActiveCategory(c.id)}
              onMouseLeave={() => setActiveCategory(null)}
              className="static flex flex-col items-center group cursor-pointer"
            >
              <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-50 mb-1 border border-transparent group-hover:border-amazon-orange transition-all">
                <img 
                  src={categoryImages[c.name] || c.imageUrl || "/placeholder.png"} 
                  className="w-full h-full object-cover" 
                  alt={c.name} 
                />
              </div>
              <Link 
                href={`/all-products?categoryId=${c.id}`}
                className="text-[12px] font-bold text-gray-800 flex items-center gap-1 group-hover:text-amazon-orange transition-colors"
              >
                {c.name}
                <FiChevronDown className={`transition-transform duration-200 ${activeCategory === c.id ? 'rotate-180' : ''}`} />
              </Link>

              {activeCategory === c.id && (
                <div className="absolute top-full left-0 right-0 z-50 flex justify-center pt-1">
                  <MegaMenu categoryId={c.id} />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {isMobileMenuOpen && <MobileMenu categories={categories} onClose={() => setIsMobileMenuOpen(false)} />}
    </div>
  );
}
