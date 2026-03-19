"use client";

import { useEffect, useState, useCallback } from "react";
import AddMoneyModal from "./AddMoneyModal";
import { api } from "@/lib/api";
import { useAuth } from "@/app/context/AuthContext";
import { Gift, TrendingUp, Users, Copy, Check } from "lucide-react";

export default function WalletBalanceCard() {
  const [balance, setBalance] = useState(0);
  const [referralEarnings, setReferralEarnings] = useState(0);
  const [referralStats, setReferralStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
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

  // ✅ Load wallet summary with referral earnings
  const loadWalletSummary = useCallback(async () => {
    try {
      const res = await api.get("/wallet/summary");
      if (res.data.totalReferralEarnings !== undefined) {
        setReferralEarnings(res.data.totalReferralEarnings);
      }
    } catch (err) {
      console.error("❌ Summary load error", err);
    }
  }, []);

  // ✅ Load referral stats
  const loadReferralStats = useCallback(async () => {
    try {
      const res = await api.get("/referral/my-stats");
      setReferralStats(res.data);
    } catch (err) {
      console.error("❌ Referral stats load error", err);
    }
  }, []);

  // ✅ Copy referral code
  const copyReferralCode = () => {
    if (user?.referralCode) {
      navigator.clipboard.writeText(user.referralCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // ✅ Load wallet on mount
  useEffect(() => {
    loadWallet();
    loadWalletSummary();
    loadReferralStats();
  }, [loadWallet, loadWalletSummary, loadReferralStats]);

  // ✅ Poll for updates every 5 seconds (catches refunds)
  useEffect(() => {
    const interval = setInterval(() => {
      loadWallet();
      loadWalletSummary();
      loadReferralStats();
    }, 5000);

    return () => clearInterval(interval);
  }, [loadWallet, loadWalletSummary, loadReferralStats]);

  // ✅ Listen for refund events from other tabs/windows
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "wallet_refund_processed") {
        console.log("🔔 Refund detected from another tab, refreshing wallet...");
        loadWallet();
        loadWalletSummary();
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [loadWallet, loadWalletSummary]);

  const isBlocked = user?.isBlocked;

  return (
    <div className="space-y-4">
      {/* Main Wallet Card */}
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

        {/* ✅ Referral Earnings Badge */}
        {referralEarnings > 0 && (
          <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-full">
            <Gift size={14} className="text-green-600" />
            <span className="text-xs font-bold text-green-700">
              ₹{referralEarnings} from referrals
            </span>
          </div>
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
                onClick={() => {
                  loadWallet();
                  loadWalletSummary();
                  loadReferralStats();
                }}
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

      {/* ✅ REFERRAL CARD */}
      {user?.referralCode && (
        <div className="border rounded-xl p-6 bg-gradient-to-br from-orange-50 via-white to-purple-50 shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Gift className="text-orange-600" size={20} />
              <h3 className="font-bold text-gray-900">Refer & Earn</h3>
            </div>
            <TrendingUp className="text-green-600" size={18} />
          </div>

          {/* Referral Code */}
          <div className="mb-4">
            <p className="text-xs text-gray-600 font-medium mb-2 uppercase tracking-wide">
              Your Referral Code
            </p>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-white border-2 border-dashed border-orange-300 rounded-lg px-4 py-3 font-mono font-bold text-lg text-orange-600 text-center">
                {user.referralCode}
              </div>
              <button
                onClick={copyReferralCode}
                className="p-3 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors"
                title="Copy code"
              >
                {copied ? <Check size={20} /> : <Copy size={20} />}
              </button>
            </div>
            {copied && (
              <p className="text-xs text-green-600 font-medium mt-1 text-center">
                ✓ Copied to clipboard!
              </p>
            )}
          </div>

          {/* Stats */}
          {referralStats && (
            <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-orange-100">
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Users size={14} className="text-blue-600" />
                  <p className="text-xs text-gray-600 font-medium">Total</p>
                </div>
                <p className="text-xl font-black text-gray-900">
                  {referralStats.totalReferrals || 0}
                </p>
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Gift size={14} className="text-green-600" />
                  <p className="text-xs text-gray-600 font-medium">Success</p>
                </div>
                <p className="text-xl font-black text-green-600">
                  {referralStats.completedReferrals || 0}
                </p>
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <TrendingUp size={14} className="text-purple-600" />
                  <p className="text-xs text-gray-600 font-medium">Earned</p>
                </div>
                <p className="text-xl font-black text-purple-600">
                  ₹{referralStats.totalEarned || 0}
                </p>
              </div>
            </div>
          )}

          {/* How it works */}
          <div className="mt-4 p-3 bg-white/50 rounded-lg border border-orange-100">
            <p className="text-xs text-gray-600 leading-relaxed">
              <span className="font-bold text-orange-600">💰 How it works:</span> Share your code with friends. When they sign up and verify their account, you both earn rewards!
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
