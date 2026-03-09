"use client";

import { useEffect, useState } from "react";
import AddMoneyModal from "./AddMoneyModal";
import { api } from "@/lib/api";
import { useAuth } from "@/app/context/AuthContext";

export default function WalletBalanceCard() {
  const [balance, setBalance] = useState(0);
  const { user } = useAuth();

  const loadWallet = async () => {
    try {
      const res = await api.get("/wallet");
      setBalance(res.data.balance);
    } catch (err) {
      console.error("Wallet load error", err);
    }
  };

  useEffect(() => {
    loadWallet();
  }, []);

  const isBlocked = user?.isBlocked;

  return (
    <div className="border rounded-xl p-6 bg-white shadow">
      <p className="text-gray-500 text-sm">Wallet Balance</p>

      <h2 className="text-3xl font-bold">₹{balance}</h2>

      {/* 🚫 BLOCKED MESSAGE */}
      {isBlocked && (
        <p className="text-red-600 text-sm mt-2">
          Your account is blocked. Wallet actions are disabled.
        </p>
      )}

      <div className="mt-4">
        {!isBlocked ? (
          <AddMoneyModal reload={loadWallet} />
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