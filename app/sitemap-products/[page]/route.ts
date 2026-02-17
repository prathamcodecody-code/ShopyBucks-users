import { NextResponse } from "next/server";

export async function GET(
  _req: Request,
  { params }: { params: { page: string } }
) {
  const page = Number(params.page);

  if (!page || page < 1) {
    return new NextResponse("Invalid page", { status: 400 });
  }

  const base = "https://www.shopybucks.com";

  const res = await fetch(
    `https://apiv2.shopybucks.com/products/sitemap?page=${page}`,
    { cache: "no-store" }
  );

  if (!res.ok) {
    return new NextResponse("Failed to fetch products", { status: 500 });
  }

  const { products } = await res.json();

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${products
  .map(
    (p: any) => `
  <url>
    <loc>${base}/product/${p.slug}</loc>
    <lastmod>${new Date(p.updatedAt).toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.7</priority>
  </url>`
  )
  .join("")}
</urlset>`;

  return new NextResponse(xml, {
    headers: { "Content-Type": "application/xml" },
  });
}
