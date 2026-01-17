import { Suspense } from "react";
import SearchClient from "./SearchClient";

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[60vh] flex items-center justify-center">
          <p className="text-gray-500 animate-pulse">
            Loading search results…
          </p>
        </div>
      }
    >
      <SearchClient />
    </Suspense>
  );
}
