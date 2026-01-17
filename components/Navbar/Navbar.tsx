import NavbarClient from "./NavbarClient";

async function getCategories() {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/categories`,
      {
        next: { revalidate: 3600 }, // ✅ FIX
      }
    );

    if (!res.ok) {
      throw new Error("Failed to fetch categories");
    }

    return res.json();
  } catch (err) {
    console.error("Navbar fetch failed:", err);
    return [];
  }
}

export default async function Navbar() {
  const categories = await getCategories();
  return <NavbarClient categories={categories} />;
}
