"use client";

import { useEffect, useState, useRef } from "react";
import { FiBell } from "react-icons/fi";
import { api } from "@/lib/api";
import NotificationList from "./NotificationList";

export default function NotificationBell() {
  const [count, setCount] = useState(0);
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchUnread = async () => {
    try {
      const res = await api.get("/notifications/unread-count");
      // Safety check: Ensure count is treated as a number
      const unreadCount = Number(res?.data?.count);
      setCount(isNaN(unreadCount) ? 0 : unreadCount);
    } catch (err) {
      console.error("Notification fetch failed", err);
    }
  };

  useEffect(() => {
    fetchUnread();
    const interval = setInterval(fetchUnread, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={() => setOpen(!open)}
        className={`relative flex items-center justify-center p-2 rounded-full transition-all duration-200 
          ${open ? 'bg-genz-softAccent text-genz-accent' : 'text-genz-ink hover:bg-genz-softAccent hover:text-genz-accent'}`}
      >
        <FiBell size={24} strokeWidth={2} />

        {/* THE FIX: Enhanced Badge Visibility */}
        {count > 0 && (
          <span 
            className="absolute -top-0.5 -right-0.5 z-10 flex h-5 w-5 items-center justify-center rounded-full bg-genz-accent border-2 border-white shadow-sm animate-in zoom-in duration-300"
          >
            <span className="text-[10px] font-black text-white leading-none">
              {count > 9 ? "9+" : count}
            </span>
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 mt-3 z-[100] w-80 bg-genz-card border border-genz-border shadow-2xl rounded-genz overflow-hidden animate-in fade-in slide-in-from-top-2">
          <div className="p-4 border-b border-genz-border bg-genz-bg/50 flex justify-between items-center">
            <h3 className="font-black text-genz-ink text-xs uppercase tracking-widest">Notifications</h3>
            {count > 0 && <span className="text-[10px] font-bold text-genz-accent">{count} New</span>}
          </div>
          <div className="max-h-[400px] overflow-y-auto">
            <NotificationList />
          </div>
        </div>
      )}
    </div>
  );
}