"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

export default function WalletTransactions() {
  const [transactions, setTransactions] = useState([]);

  const loadTransactions = async () => {
    try {
      const res = await api.get("/wallet/transactions");
      setTransactions(res.data.transactions);
    } catch (err) {
      console.error("Transaction load error", err);
    }
  };

  useEffect(() => {
    loadTransactions();
  }, []);

  return (
    <div className="border rounded-xl p-6 bg-white shadow">
      <h3 className="font-semibold mb-4">Transactions</h3>

      <div className="space-y-3">
        {transactions.map((tx: any) => {
          const isCredit =
            tx.type === "ADD_MONEY" || tx.type === "ORDER_REFUND";

          return (
            <div
              key={tx.id}
              className="flex justify-between border-b pb-2"
            >
              <div>
                <p className="text-sm">{tx.reason}</p>

                <p className="text-xs text-gray-400">
                  {new Date(tx.createdAt).toLocaleDateString()}
                </p>
              </div>

              <p className={isCredit ? "text-green-600" : "text-red-600"}>
                {isCredit ? "+" : "-"} ₹{tx.amount}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}