export type ProductSKU = {
  id: number;
  size?: string | null;
  color?: string | null;
  stock: number;
  price?: number;
  img1?: string | null;
  img2?: string | null;
  img3?: string | null;

  // optional backend-computed pricing
  finalPrice?: number;
  pricing?: {
    sellingPrice: number;
    mrp: number;
    discountPercent: number;
    discountAmount: number;
    hasDiscount: boolean;
  };
};

export type Product = {
  id: number;
  title: string;
  slug: string;

  price: number;
  finalPrice?: number;
  discountType?: "PERCENT" | "FLAT";
  discountValue?: number;

  img1?: string | null;
  img2?: string | null;
  img3?: string | null;
  img4?: string | null;

  stock?: number;
  totalStock?: number;

  category?: {
    name: string;
    slug: string;
  };

  rating?: number;
  reviewCount?: number;

  pricing?: {
    sellingPrice: number;
    mrp: number;
    discountPercent: number;
    discountAmount: number;
    hasDiscount: boolean;
  };

  // ✅ THIS IS THE IMPORTANT PART
  skus?: ProductSKU[];

  // legacy (optional, keep only if still used elsewhere)
  variants?: any[];
  sizes?: any[];
};
