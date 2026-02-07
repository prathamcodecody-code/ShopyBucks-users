// Server Component
import NavbarClient from "./NavbarClient";

export const dynamic = "force-dynamic";

export default async function Navbar() {
  const res = await fetch("https://apiv2.shopybucks.com/categories", {
    cache: "no-store",
  });
  const categories = await res.json();

  return <NavbarClient categories={categories} />;
}
