"use client";

import Link from "next/link";
import { X, ChevronRight, UserCircle, LogOut, Store, Package, Heart } from "lucide-react";
import { useAuth } from "@/app/context/AuthContext";

export default function MobileMenu({
  categories,
  onClose,
}: {
  categories: any[];
  onClose: () => void;
}) {
  const { user, logout } = useAuth();

  return (
    <div className="fixed inset-0 z-[100] flex">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-amazon-darkBlue/70 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={onClose}
      />

      {/* Sidebar */}
      <div className="relative bg-white w-[280px] sm:w-80 h-full shadow-2xl flex flex-col animate-in slide-in-from-left duration-300">
        
        {/* Header - User Profile */}
        <div className="bg-amazon-darkBlue p-6 text-white shrink-0">
          <div className="flex justify-between items-start mb-4">
            <div 
              className="flex items-center gap-3 cursor-pointer group"
              onClick={() => {
                if (!user) {
                  onClose();
                  window.dispatchEvent(new Event("open-auth-modal"));
                }
              }}
            >
              <div className="bg-white/10 p-1 rounded-full group-hover:bg-white/20 transition-colors">
                <UserCircle size={36} strokeWidth={1.5} />
              </div>
              <div className="leading-tight">
                <p className="text-[10px] font-bold uppercase tracking-widest opacity-60">Account</p>
                <p className="font-black text-lg">
                  {user?.name || "Sign In"}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-white/10 rounded-full transition-colors"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {/* Main Navigation */}
          <div className="p-6 space-y-8">
            
            {/* Quick Links for Authenticated Users */}
            {user && (
               <div className="grid grid-cols-2 gap-3">
                  <Link 
                    href="/orders" 
                    onClick={onClose}
                    className="flex flex-col items-center justify-center p-3 bg-gray-50 rounded-xl border border-gray-100 hover:border-amazon-orange transition-all"
                  >
                    <Package size={20} className="text-amazon-darkBlue mb-1" />
                    <span className="text-[10px] font-black uppercase text-amazon-mutedText">Orders</span>
                  </Link>
                  <Link 
                    href="/wishlist" 
                    onClick={onClose}
                    className="flex flex-col items-center justify-center p-3 bg-gray-50 rounded-xl border border-gray-100 hover:border-amazon-orange transition-all"
                  >
                    <Heart size={20} className="text-amazon-danger mb-1" />
                    <span className="text-[10px] font-black uppercase text-amazon-mutedText">Wishlist</span>
                  </Link>
               </div>
            )}

            {/* Seller Onboarding Link */}
            <Link
              href="/seller/onboarding"
              onClick={onClose}
              className="flex items-center gap-3 p-4 bg-amazon-orange/10 border border-amazon-orange/20 rounded-xl group"
            >
              <Store className="text-amazon-orange" size={20} />
              <div className="flex-1">
                <p className="text-sm font-black text-amazon-darkBlue leading-none">Become a Seller</p>
                <p className="text-[10px] text-amazon-orange font-bold uppercase mt-1">Start Earning Today</p>
              </div>
              <ChevronRight size={16} className="text-amazon-orange group-hover:translate-x-1 transition-transform" />
            </Link>

            {/* Categories Section */}
            <div>
              <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-amazon-mutedText mb-4">
                Shop By Category
              </h3>
              <div className="flex flex-col divide-y divide-gray-100">
                {categories.map((c) => (
                  <Link
                    key={c.id}
                    href={`/all-products?categoryId=${c.id}`}
                    className="flex items-center justify-between py-4 text-amazon-text hover:text-amazon-orange font-bold transition-colors group"
                    onClick={onClose}
                  >
                    <span className="group-hover:translate-x-1 transition-transform">{c.name}</span>
                    <ChevronRight size={18} className="text-gray-300" />
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer / Logout */}
        {user && (
          <div className="p-6 border-t border-gray-100">
            <button
              onClick={() => {
                logout();
                onClose();
              }}
              className="flex items-center gap-2 text-sm font-bold text-amazon-danger hover:bg-red-50 w-full p-2 rounded-lg transition-colors"
            >
              <LogOut size={18} />
              Sign Out
            </button>
          </div>
        )}
      </div>
    </div>
  );
}