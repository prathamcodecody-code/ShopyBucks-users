"use client";

import { useEffect, useState, useCallback } from "react";
import AddMoneyModal from "./AddMoneyModal";
import { api } from "@/lib/api";
import { useAuth } from "@/app/context/AuthContext";

export default function WalletBalanceCard() {
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  // ✅ Load wallet balance with error handling
  const loadWallet = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const res = await api.get("/wallet");
      
      // Handle different response formats
      if (res.data.balance !== undefined) {
        setBalance(res.data.balance);
      } else if (res.data.currentBalance !== undefined) {
        setBalance(res.data.currentBalance);
      } else if (res.data.data?.balance !== undefined) {
        setBalance(res.data.data.balance);
      }
      
      console.log("✅ Wallet loaded:", res.data);
    } catch (err) {
      console.error("❌ Wallet load error", err);
      setError("Failed to load wallet");
    } finally {
      setLoading(false);
    }
  }, []);

  // ✅ Load wallet on mount
  useEffect(() => {
    loadWallet();
  }, [loadWallet]);

  // ✅ Poll for updates every 5 seconds (catches refunds)
  useEffect(() => {
    const interval = setInterval(() => {
      loadWallet();
    }, 5000);

    return () => clearInterval(interval);
  }, [loadWallet]);

  // ✅ Listen for refund events from other tabs/windows
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "wallet_refund_processed") {
        console.log("🔔 Refund detected from another tab, refreshing wallet...");
        loadWallet();
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [loadWallet]);

  const isBlocked = user?.isBlocked;

  return (
    <div className="border rounded-xl p-6 bg-white shadow">
      <div className="flex items-center justify-between">
        <p className="text-gray-500 text-sm">Wallet Balance</p>
        
        {/* ✅ Loading indicator */}
        {loading && (
          <span className="text-xs text-blue-500 animate-pulse">Updating...</span>
        )}
      </div>

      <h2 className="text-3xl font-bold mt-2">
        ₹{balance}
      </h2>

      {/* ✅ Error message */}
      {error && (
        <p className="text-red-500 text-xs mt-2">{error}</p>
      )}

      {/* 🚫 BLOCKED MESSAGE */}
      {isBlocked && (
        <p className="text-red-600 text-sm mt-2">
          Your account is blocked. Wallet actions are disabled.
        </p>
      )}

      <div className="mt-4 flex gap-2">
        {!isBlocked ? (
          <>
            <AddMoneyModal reload={loadWallet} />
            
            {/* ✅ Manual refresh button */}
            <button
              onClick={loadWallet}
              disabled={loading}
              className="px-4 py-2 rounded bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
              title="Refresh wallet balance"
            >
              {loading ? "Loading..." : "Refresh"}
            </button>
          </>
        ) : (
          <button
            disabled
            className="px-4 py-2 rounded bg-gray-400 text-white cursor-not-allowed"
          >
            Account Blocked
          </button>
        )}
      </div>
    </div>
  );
}
