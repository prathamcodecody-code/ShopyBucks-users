import { redirect } from "next/navigation";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function OldProductPage({ params }: PageProps) {
  // Await the params object
  const { slug } = await params;

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/products/${slug}`
  );

  // If product doesn't exist, don't crash, just redirect to home or 404
  if (!res.ok) {
     redirect("/");
     return null;
  }

  const product = await res.json();

  // Safety check for category slug to prevent build errors
  const categorySlug = product.category?.slug || "all-products";
  const productSlug = product.slug || "product";

  redirect(`/${categorySlug}/${productSlug}-${product.id}`);
}
