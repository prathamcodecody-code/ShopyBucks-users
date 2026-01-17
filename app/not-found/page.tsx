"use client";

import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="text-center max-w-md">
        <h1 className="text-6xl font-black text-amazon-orange">404</h1>
        <h2 className="mt-4 text-xl font-bold text-amazon-text">
          Page not found
        </h2>
        <p className="mt-2 text-sm text-gray-500">
          The page you are looking for doesn’t exist or was moved.
        </p>

        <Link
          href="/"
          className="inline-block mt-6 px-6 py-3 bg-amazon-orange text-white font-bold rounded-lg"
        >
          Go Home
        </Link>
      </div>
    </div>
  );
}
