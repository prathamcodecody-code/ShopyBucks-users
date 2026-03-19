"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  ChevronRight,
  Filter,
  Gift,
} from "lucide-react";

interface Transaction {
  id: number;
  amount: number;
  type: "ADD_MONEY" | "ORDER_PAYMENT" | "ORDER_REFUND" | "ADMIN_ADJUSTMENT" | "REFERRAL_REWARD"; // ✅ Added
  reason: string;
  createdAt: string;
  referenceId?: number;
}

interface WalletSummary {
  currentBalance: number;
  totalAdded: number;
  totalSpent: number;
  totalRefunded: number;
  totalReferralEarnings: number; // ✅ Added
  transactionCount: number;
}

interface Refund {
  id: number;
  orderId: number;
  amount: number;
  refundMethod: string;
  status: "PENDING" | "COMPLETED" | "FAILED";
  initiatedBy: string;
  reason: string;
  createdAt: string;
  processedAt?: string;
}

export default function WalletTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [refunds, setRefunds] = useState<Refund[]>([]);
  const [summary, setSummary] = useState<WalletSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"transactions" | "refunds">("transactions");
  const [filterType, setFilterType] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 0 });

  // Load wallet summary
  const loadSummary = async () => {
    try {
      const res = await api.get("/wallet/summary");
      setSummary(res.data);
    } catch (err) {
      console.error("Summary load error", err);
    }
  };

  // Load transactions with pagination
  const loadTransactions = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get(`/wallet/transactions?page=${page}&limit=10`);
      setTransactions(res.data.transactions);
      setPagination(res.data.pagination || { total: 0, totalPages: 0 });
    } catch (err) {
      console.error("Transaction load error", err);
      setError("Failed to load transactions");
    } finally {
      setLoading(false);
    }
  };

  // Load refunds
  const loadRefunds = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get("/refunds");
      setRefunds(res.data.data || []);
    } catch (err) {
      console.error("Refund load error", err);
      setError("Failed to load refunds");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSummary();
  }, []);

  useEffect(() => {
    if (activeTab === "transactions") {
      loadTransactions();
    } else {
      loadRefunds();
    }
  }, [activeTab, page]);

  // Filter transactions by type
  const filteredTransactions = transactions.filter((tx) => {
    if (filterType === "all") return true;
    return tx.type === filterType;
  });

  // Get transaction type badge
  const getTransactionTypeBadge = (type: string) => {
    const badges = {
      ADD_MONEY: { label: "Top Up", color: "bg-blue-50 text-blue-600 border-blue-200" },
      ORDER_PAYMENT: { label: "Payment", color: "bg-red-50 text-red-600 border-red-200" },
      ORDER_REFUND: { label: "Refund", color: "bg-green-50 text-green-600 border-green-200" },
      ADMIN_ADJUSTMENT: { label: "Adjustment", color: "bg-purple-50 text-purple-600 border-purple-200" },
      REFERRAL_REWARD: { label: "Referral 🎁", color: "bg-orange-50 text-orange-600 border-orange-200" }, // ✅ Added
    };
    
    const badge = badges[type as keyof typeof badges] || { label: type, color: "bg-gray-50 text-gray-600 border-gray-200" };
    
    return (
      <span className={`text-xs px-2 py-1 rounded border font-medium ${badge.color}`}>
        {badge.label}
      </span>
    );
  };

  // Get refund status badge
  const getRefundStatusBadge = (status: string) => {
    const badges = {
      PENDING: { icon: Clock, color: "bg-yellow-50 text-yellow-600 border-yellow-200" },
      COMPLETED: { icon: CheckCircle, color: "bg-green-50 text-green-600 border-green-200" },
      FAILED: { icon: XCircle, color: "bg-red-50 text-red-600 border-red-200" },
    };

    const badge = badges[status as keyof typeof badges] || { icon: AlertCircle, color: "bg-gray-50 text-gray-600 border-gray-200" };
    const Icon = badge.icon;

    return (
      <span className={`inline-flex items-center gap-1.5 text-xs px-2 py-1 rounded border font-medium ${badge.color}`}>
        <Icon className="w-3.5 h-3.5" />
        {status}
      </span>
    );
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="space-y-6">
      {/* Wallet Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="border rounded-xl p-4 bg-gradient-to-br from-blue-50 to-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">Current Balance</p>
                <p className="text-2xl font-bold text-blue-600 mt-1">
                  ₹{summary.currentBalance.toLocaleString()}
                </p>
              </div>
              <Wallet className="w-8 h-8 text-blue-600" />
            </div>
          </div>

          <div className="border rounded-xl p-4 bg-gradient-to-br from-green-50 to-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">Total Added</p>
                <p className="text-2xl font-bold text-green-600 mt-1">
                  ₹{summary.totalAdded.toLocaleString()}
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-600" />
            </div>
          </div>

          <div className="border rounded-xl p-4 bg-gradient-to-br from-red-50 to-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">Total Spent</p>
                <p className="text-2xl font-bold text-red-600 mt-1">
                  ₹{summary.totalSpent.toLocaleString()}
                </p>
              </div>
              <TrendingDown className="w-8 h-8 text-red-600" />
            </div>
          </div>

          <div className="border rounded-xl p-4 bg-gradient-to-br from-purple-50 to-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">Total Refunded</p>
                <p className="text-2xl font-bold text-purple-600 mt-1">
                  ₹{summary.totalRefunded.toLocaleString()}
                </p>
              </div>
              <RefreshCw className="w-8 h-8 text-purple-600" />
            </div>
          </div>

          {/* ✅ NEW: Referral Earnings Card */}
          <div className="border rounded-xl p-4 bg-gradient-to-br from-orange-50 to-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">Referral Rewards</p>
                <p className="text-2xl font-bold text-orange-600 mt-1">
                  ₹{summary.totalReferralEarnings?.toLocaleString() || 0}
                </p>
              </div>
              <Gift className="w-8 h-8 text-orange-600" />
            </div>
          </div>
        </div>
      )}

      {/* Main Content Card */}
      <div className="border rounded-xl bg-white shadow">
        {/* Tabs */}
        <div className="border-b">
          <div className="flex gap-1 p-1">
            <button
              onClick={() => {
                setActiveTab("transactions");
                setPage(1);
              }}
              className={`flex-1 px-4 py-2.5 rounded-lg font-medium transition-colors ${
                activeTab === "transactions"
                  ? "bg-blue-50 text-blue-600"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              Transactions
            </button>
            <button
              onClick={() => {
                setActiveTab("refunds");
                setPage(1);
              }}
              className={`flex-1 px-4 py-2.5 rounded-lg font-medium transition-colors ${
                activeTab === "refunds"
                  ? "bg-blue-50 text-blue-600"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              My Refunds
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Transactions Tab */}
          {activeTab === "transactions" && (
            <>
              {/* Filter */}
              <div className="mb-4 flex items-center gap-3">
                <Filter className="w-5 h-5 text-gray-400" />
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Types</option>
                  <option value="ADD_MONEY">Top Ups</option>
                  <option value="ORDER_PAYMENT">Payments</option>
                  <option value="ORDER_REFUND">Refunds</option>
                  <option value="ADMIN_ADJUSTMENT">Adjustments</option>
                  <option value="REFERRAL_REWARD">Referral Rewards 🎁</option>
                </select>
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <RefreshCw className="w-6 h-6 text-blue-600 animate-spin" />
                </div>
              ) : error ? (
                <div className="flex items-center justify-center py-12 text-red-600">
                  <AlertCircle className="w-5 h-5 mr-2" />
                  {error}
                </div>
              ) : filteredTransactions.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <Wallet className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p className="font-medium">No transactions found</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredTransactions.map((tx) => {
                    const isCredit =
                      tx.type === "ADD_MONEY" ||
                      tx.type === "ORDER_REFUND" ||
                      tx.type === "ADMIN_ADJUSTMENT" ||
                      tx.type === "REFERRAL_REWARD"; // ✅ Added

                    return (
                      <div
                        key={tx.id}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            {getTransactionTypeBadge(tx.type)}
                            {tx.referenceId && (
                              <span className="text-xs text-gray-500">
                                #{tx.referenceId}
                              </span>
                            )}
                          </div>
                          <p className="text-sm font-medium text-gray-900">
                            {tx.reason}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {formatDate(tx.createdAt)}
                          </p>
                        </div>

                        <div className="text-right">
                          <p
                            className={`text-lg font-bold ${
                              isCredit ? "text-green-600" : "text-red-600"
                            }`}
                          >
                            {isCredit ? "+" : "-"} ₹{tx.amount.toLocaleString()}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-6 pt-4 border-t">
                  <button
                    onClick={() => setPage(Math.max(1, page - 1))}
                    disabled={page === 1}
                    className="px-4 py-2 border rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Previous
                  </button>
                  <span className="text-sm text-gray-600">
                    Page {page} of {pagination.totalPages}
                  </span>
                  <button
                    onClick={() => setPage(Math.min(pagination.totalPages, page + 1))}
                    disabled={page >= pagination.totalPages}
                    className="px-4 py-2 border rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}

          {/* Refunds Tab */}
          {activeTab === "refunds" && (
            <>
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <RefreshCw className="w-6 h-6 text-blue-600 animate-spin" />
                </div>
              ) : error ? (
                <div className="flex items-center justify-center py-12 text-red-600">
                  <AlertCircle className="w-5 h-5 mr-2" />
                  {error}
                </div>
              ) : refunds.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <RefreshCw className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p className="font-medium">No refunds yet</p>
                  <p className="text-sm mt-1">
                    Cancelled orders will appear here
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {refunds.map((refund) => (
                    <div
                      key={refund.id}
                      className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-medium text-gray-900">
                              Refund #{refund.id}
                            </span>
                            {getRefundStatusBadge(refund.status)}
                          </div>
                          <p className="text-xs text-gray-500">
                            Order #{refund.orderId}
                          </p>
                        </div>
                        <p className="text-lg font-bold text-green-600">
                          ₹{refund.amount.toLocaleString()}
                        </p>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Method:</span>
                          <span className="font-medium">
                            {refund.refundMethod === "WALLET" ? "Wallet" : "Original Payment"}
                          </span>
                        </div>
                        {refund.reason && (
                          <div className="flex items-start justify-between text-sm">
                            <span className="text-gray-600">Reason:</span>
                            <span className="font-medium text-right max-w-xs">
                              {refund.reason}
                            </span>
                          </div>
                        )}
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Initiated:</span>
                          <span className="font-medium">{formatDate(refund.createdAt)}</span>
                        </div>
                        {refund.processedAt && (
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">Processed:</span>
                            <span className="font-medium">{formatDate(refund.processedAt)}</span>
                          </div>
                        )}
                      </div>

                      {/* Status Message */}
                      {refund.status === "PENDING" && (
                        <div className="mt-3 pt-3 border-t flex items-center gap-2 text-sm text-yellow-600">
                          <Clock className="w-4 h-4" />
                          <span>Refund is being processed...</span>
                        </div>
                      )}
                      {refund.status === "COMPLETED" && (
                        <div className="mt-3 pt-3 border-t flex items-center gap-2 text-sm text-green-600">
                          <CheckCircle className="w-4 h-4" />
                          <span>
                            {refund.refundMethod === "WALLET"
                              ? "Amount credited to your wallet"
                              : "Amount refunded to original payment method"}
                          </span>
                        </div>
                      )}
                      {refund.status === "FAILED" && (
                        <div className="mt-3 pt-3 border-t flex items-center gap-2 text-sm text-red-600">
                          <XCircle className="w-4 h-4" />
                          <span>Refund failed. Please contact support.</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
