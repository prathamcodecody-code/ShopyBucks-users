import { NextRequest, NextResponse } from "next/server";

export async function GET(
  _req: NextRequest,
  context: { params: { page: string } }
) {
  const page = Number(context.params.page);
  const LIMIT = 5000;

  if (!page || page < 1) {
    return new NextResponse("Invalid page", { status: 400 });
  }

  const res = await fetch(
    `${process.env.API_URL}/products/sitemap?page=${page}&limit=${LIMIT}`,
    { cache: "no-store" }
  );

  if (!res.ok) {
    return new NextResponse(null, { status: 404 });
  }

  const products = await res.json();

  if (!products || products.length === 0) {
    return new NextResponse(null, { status: 404 });
  }

  const urls = products
    .map(
      (p: { slug: string; updatedAt: string }) => `
  <url>
    <loc>https://www.shopybucks.com/product/${p.slug}</loc>
    <lastmod>${new Date(p.updatedAt).toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>`
    )
    .join("");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;

  return new NextResponse(xml, {
    headers: {
      "Content-Type": "application/xml",
    },
  });
}
