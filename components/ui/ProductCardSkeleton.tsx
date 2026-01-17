export default function ProductCardSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 animate-pulse">
      {/* IMAGE */}
      <div className="w-full h-60 bg-gray-200 rounded-lg mb-4" />

      {/* TITLE */}
      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
      <div className="h-4 bg-gray-200 rounded w-1/2 mb-3" />

      {/* PRICE */}
      <div className="h-5 bg-gray-200 rounded w-1/3" />
    </div>
  );
}
