"use client";

import { useState } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/app/context/AuthContext";

export default function AddMoneyModal({ reload }) {
  const [amount, setAmount] = useState("");
  const { user } = useAuth();

  const handleAddMoney = async () => {

    // 🚫 BLOCKED USER CHECK
    if (user?.isBlocked) {
      alert(user.blockedReason || "Your account has been blocked");
      return;
    }

    if (!amount || Number(amount) <= 0) {
      alert("Please enter a valid amount");
      return;
    }

    try {
      const res = await api.post("/wallet/add-money", {
        amount: Number(amount),
      });

      const data = res.data;

      console.log("Payment response:", data);

      if (data.payment_url) {
        window.location.href = data.payment_url;
      } else {
        alert("Payment URL not returned");
      }

    } catch (err: any) {
      console.error(err);

      alert(
        err?.response?.data?.message ||
        "Failed to initiate payment"
      );
    }
  };

  const isDisabled = user?.isBlocked;

  return (
    <div className="flex gap-2">

      <input
        type="number"
        placeholder="Enter amount"
        className="border rounded px-3 py-2"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        disabled={isDisabled}
      />

      <button
        onClick={handleAddMoney}
        disabled={isDisabled}
        className={`px-4 py-2 rounded text-white ${
          isDisabled
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-black"
        }`}
      >
        {user?.isBlocked ? "Account Blocked" : "Add Money"}
      </button>

    </div>
  );
}