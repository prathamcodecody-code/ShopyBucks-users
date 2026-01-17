import NavbarClient from "./NavbarClient";

async function getCategories() {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/categories`,
      { cache: "no-store" }
    );

    if (!res.ok) {
      throw new Error("Failed to fetch categories");
    }

    return res.json();
  } catch (err) {
    console.error("Navbar fetch failed:", err);
    return null; // 👈 IMPORTANT
  }
}

export default async function Navbar() {
  const categories = await getCategories();

  // Always render navbar – never crash SSR
  return <NavbarClient categories={categories ?? []} />;
}
