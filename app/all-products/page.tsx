import { Suspense } from "react";
import ProductsListClient from "./ProductsListClient";

export default function AllProductsPage() {
  return (
    <Suspense fallback={<div className="p-10">Loading products...</div>}>
      <ProductsListClient />
    </Suspense>
  );
}
