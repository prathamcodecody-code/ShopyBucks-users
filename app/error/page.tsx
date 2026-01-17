"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global error:", error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md text-center">
        <h1 className="text-3xl font-black text-amazon-danger">
          Something went wrong
        </h1>
        <p className="mt-3 text-sm text-gray-600">
          We’re working on fixing this issue. Please try again in a moment.
        </p>

        <button
          onClick={() => reset()}
          className="mt-6 px-6 py-3 bg-amazon-orange text-white font-bold rounded-lg"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}
