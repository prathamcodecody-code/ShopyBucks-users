import { redirect } from "next/navigation";

export default async function OldProductPage({ params }) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/products/${params.slug}`
  );

  if (!res.ok) return null;

  const product = await res.json();

  redirect(`/${product.category.slug}/${product.slug}-${product.id}`);
}
