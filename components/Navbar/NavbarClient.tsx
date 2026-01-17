"use client";

import Link from "next/link";
import { useState } from "react";
import { FiSearch, FiMenu } from "react-icons/fi"; // Added FiMenu
import { HiOutlineShoppingBag, HiOutlineUser } from "react-icons/hi2";
import { AiOutlineHeart } from "react-icons/ai";
import { useRouter } from "next/navigation";
import MegaMenu from "./MegaMenu";
import MobileMenu from "./MobileMenu"; // Import MobileMenu
import { useAuth } from "@/app/context/AuthContext";

export default function NavbarClient({ categories }: { categories: any[] }) {
  const router = useRouter();
  const { user, logout } = useAuth();

  const [query, setQuery] = useState("");
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [activeCategory, setActiveCategory] = useState<number | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false); // State for Mobile Menu

  const handleSearch = () => {
    if (!query.trim()) return;
    router.push(`/search?query=${encodeURIComponent(query.trim())}`);
  };

  const handleProfileClick = () => {
    if (!user) {
      window.dispatchEvent(new Event("open-auth-modal"));
    }
  };

  return (
    <div className="bg-white border-b border-gray-100 sticky top-0 z-50 shadow-sm">
      <div className="max-w-[1440px] mx-auto px-4 lg:px-10 h-16 md:h-20 flex items-center justify-between gap-4">
        
        {/* MOBILE MENU TRIGGER & LOGO */}
        <div className="flex items-center gap-2 shrink-0">
          <button 
            onClick={() => setIsMobileMenuOpen(true)}
            className="p-2 xl:hidden hover:bg-gray-100 rounded-lg transition-colors"
          >
            <FiMenu size={24} className="text-amazon-darkBlue" />
          </button>

          <Link href="/" className="flex items-center">
            <span className="text-xl md:text-2xl font-black text-[#4F1271] uppercase tracking-tighter">Shopy</span>
            <span className="text-xl md:text-2xl font-black text-amazon-orange italic uppercase tracking-tighter">Bucks</span>
          </Link>
        </div>

        {/* DESKTOP NAV (Hidden on Mobile/Tablet) */}
        <nav className="hidden xl:flex items-center h-full">
          {categories.map((c) => (
            <div
              key={c.id}
              onMouseEnter={() => setActiveCategory(c.id)}
              onMouseLeave={() => setActiveCategory(null)}
              className="h-full flex items-center"
            >
              <Link
                href={`/all-products?categoryId=${c.id}`}
                className="px-4 h-full flex items-center text-[13px] font-black uppercase border-b-4 border-transparent hover:border-amazon-orange transition-all"
              >
                {c.name}
              </Link>

              {activeCategory === c.id && (
                <div className="absolute top-20 left-0 w-full">
                  <MegaMenu categoryId={c.id} />
                </div>
              )}
            </div>
          ))}
        </nav>

        {/* SEARCH (Hidden on Mobile) */}
        <div className="hidden lg:flex flex-1 max-w-md items-center bg-[#f5f5f6] border border-transparent focus-within:border-amazon-orange/30 focus-within:bg-white rounded-lg px-4 py-2.5 transition-all">
          <FiSearch className="text-gray-400" />
          <input
            className="w-full bg-transparent pl-3 outline-none text-sm font-medium"
            placeholder="Search for products, brands and more"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          />
        </div>

        {/* RIGHT ACTIONS */}
        <div className="flex items-center gap-4 md:gap-8">
          
          {/* BECOME SELLER (Hidden on Mobile) */}
          <Link
            href="/seller/onboarding"
            className="hidden sm:block text-[12px] font-black uppercase text-[#ff3f6c] hover:opacity-80 transition-opacity"
          >
            Become a Supplier
          </Link>

          {/* PROFILE */}
          <div
            className="relative hidden md:flex flex-col items-center cursor-pointer group"
            onMouseEnter={() => setShowProfileMenu(true)}
            onMouseLeave={() => setShowProfileMenu(false)}
            onClick={handleProfileClick}
          >
            <HiOutlineUser size={22} className="group-hover:text-amazon-orange transition-colors" />
            <span className="text-[10px] font-black uppercase tracking-tighter mt-1">Profile</span>

            {showProfileMenu && (
              <div className="absolute top-full right-0 w-64 pt-4 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="bg-white border border-gray-100 shadow-2xl rounded-xl overflow-hidden">
                  <div className="p-5 border-b bg-gray-50/50">
                    <p className="text-sm font-black text-amazon-text">Hello {user?.name || "Customer"}</p>
                    <p className="text-[10px] text-amazon-mutedText font-bold uppercase mt-1">Welcome to ShopyBucks</p>
                  </div>
                  
                  <div className="p-2">
                    {!user ? (
                      <button
                        onClick={() => window.dispatchEvent(new Event("open-auth-modal"))}
                        className="w-full bg-[#ff3f6c] py-2.5 rounded-lg font-black text-white text-xs uppercase tracking-widest shadow-md active:scale-[0.98] transition-all"
                      >
                        Login / Signup
                      </button>
                    ) : (
                      <div className="flex flex-col text-xs font-bold text-amazon-mutedText">
                        <Link href="/orders" className="p-3 hover:bg-gray-50 rounded-lg hover:text-amazon-orange transition-colors">Orders</Link>
                        <Link href="/wishlist" className="p-3 hover:bg-gray-50 rounded-lg hover:text-amazon-orange transition-colors">Wishlist</Link>
                        <Link href="/profile" className="p-3 hover:bg-gray-50 rounded-lg hover:text-amazon-orange transition-colors">Account Settings</Link>

                        {user.role === "SELLER" && (
                          <>
                            <hr className="my-2 border-gray-100" />
                            <Link href="/seller/dashboard" className="p-3 text-[#ff3f6c] hover:bg-pink-50 rounded-lg transition-colors">Seller Dashboard</Link>
                          </>
                        )}

                        <hr className="my-2 border-gray-100" />
                        <button onClick={logout} className="p-3 text-red-500 text-left hover:bg-red-50 rounded-lg transition-colors">
                          Logout
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* WISHLIST (Hidden on very small screens) */}
          <Link href="/wishlist" className="hidden xs:flex flex-col items-center group">
            <AiOutlineHeart size={22} className="group-hover:text-[#ff3f6c] transition-colors" />
            <span className="text-[10px] font-black uppercase tracking-tighter mt-1">Wishlist</span>
          </Link>

          {/* CART */}
          <Link href="/cart" className="relative flex flex-col items-center group">
            <HiOutlineShoppingBag size={22} className="group-hover:text-amazon-darkBlue transition-colors" />
            <span className="text-[10px] font-black uppercase tracking-tighter mt-1">Bag</span>
            <span className="absolute -top-1.5 -right-2 bg-[#ff3f6c] text-white text-[10px] font-black h-4 w-4 flex items-center justify-center rounded-full shadow-sm">
              0
            </span>
          </Link>
        </div>
      </div>

      {/* MOBILE MENU COMPONENT */}
      {isMobileMenuOpen && (
        <MobileMenu 
          categories={categories} 
          onClose={() => setIsMobileMenuOpen(false)} 
        />
      )}
    </div>
  );
}