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
  // ✅ MUST await params
  const { category, slug } = await params;

  const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/products/slug/${slug}`;

  try {
    const res = await fetch(apiUrl, {
      cache: "no-store",
    });

    if (!res.ok) {
      return notFound();
    }

    const product = await res.json();

    // ✅ SLUG ↔ SLUG comparison (CORRECT)
    if (
      !product?.category?.slug ||
      product.category.slug !== category
    ) {
      return notFound();
    }

    return <ProductClient product={product} />;
  } catch (err) {
    return notFound();
  }
}
