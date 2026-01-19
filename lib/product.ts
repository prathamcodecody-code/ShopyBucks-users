export type Product = {
  id: number;
  title: string;
  price: number | string;
  img1?: string | null;
  slug?: string;
  brand?: string;
  stock?: number;
  rating?: number;
  reviewCount?: number;
  discountType?: "PERCENT" | "FLAT" | null;
  discountValue?: number | null;
  // Ensure category matches the requirements of ProductCard
  category: {
    id: number;
    name: string;
    slug: string;
  };
};