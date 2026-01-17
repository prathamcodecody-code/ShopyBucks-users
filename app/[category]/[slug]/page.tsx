import { notFound } from "next/navigation";
import ProductClient from "../../products/[slug]/ProductClient";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{
    category: string;
    slug: string;
  }>;
};

export default async function ProductPage({ params }: PageProps) {
  const { category, slug } = await params; // ✅ FIX

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/products/slug/${slug}`,
    { cache: "no-store" }
  );

  if (!res.ok) return notFound();

  const product = await res.json();

  if (
    !product?.category?.name ||
    product.category.name.toLowerCase() !== category.toLowerCase()
  ) {
    return notFound();
  }

  return <ProductClient product={product} />;
}
