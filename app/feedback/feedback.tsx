"use client";

import { useState } from "react";
import { api } from "@/lib/api";

type Props = {
  onClose: () => void;
};

export default function FeedbackModal({ onClose }: Props) {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async () => {
    if (!message.trim()) {
      setError("Please write some feedback");
      return;
    }

    try {
      setLoading(true);
      setError("");

      await api.post("/feedback", {
        message,
        page: window.location.pathname,
      });

      onClose();
    } catch (e: any) {
      setError(
        e.response?.data?.message || "Failed to send feedback"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center">
      <div className="bg-white rounded-xl p-6 w-full max-w-md">

        <h2 className="text-lg font-bold mb-1">Send Feedback</h2>
        <p className="text-sm text-gray-500 mb-4">
          Help us improve your experience
        </p>

        <textarea
          rows={4}
          className="w-full border rounded-lg p-3 text-sm focus:ring-2 focus:ring-brandPink/30 outline-none"
          placeholder="Tell us what we can improve…"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />

        {error && (
          <p className="text-red-500 text-sm mt-2">{error}</p>
        )}

        <div className="flex justify-end gap-3 mt-5">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 border rounded"
          >
            Cancel
          </button>

          <button
            onClick={submit}
            disabled={loading}
            className={`px-4 py-2 rounded text-white transition ${
              loading
                ? "bg-gray-300 cursor-not-allowed"
                : "bg-brandPink hover:bg-brandPinkLight"
            }`}
          >
            {loading ? "Sending…" : "Submit"}
          </button>
        </div>

      </div>
    </div>
  );
}
