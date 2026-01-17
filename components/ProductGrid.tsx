import ProductCard from "./ProductCard";
import ProductCardSkeleton from "./ui/ProductCardSkeleton";

interface ProductGridProps {
  products: any[];
  loading?: boolean;
  skeletonCount?: number;
}

export default function ProductGrid({
  products,
  loading = false,
  skeletonCount = 8,
}: ProductGridProps) {
  // ---------------- EMPTY STATE ----------------
  if (!loading && products.length === 0) {
    return (
      <div className="py-20 text-center text-gray-500">
        No products found.
      </div>
    );
  }

  return (
    <div
      className="
        grid grid-cols-2 
        sm:grid-cols-2 
        md:grid-cols-3 
        lg:grid-cols-4 
        gap-4 md:gap-6
      "
    >
      {/* ---------------- LOADER ---------------- */}
      {loading &&
        Array.from({ length: skeletonCount }).map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))}

      {/* ---------------- PRODUCTS ---------------- */}
      {!loading &&
        products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
    </div>
  );
}
