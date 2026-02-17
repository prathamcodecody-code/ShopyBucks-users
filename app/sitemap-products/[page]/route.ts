import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: { page: string } }
) {
  const page = Number(params.page);

  if (!page || page < 1) {
    return new NextResponse("Invalid page", { status: 400 });
  }

  // Example pagination
  const PAGE_SIZE = 5000;

  // TODO: Replace with DB/API fetch
  const products = await fetch(
    `${process.env.API_URL}/products/sitemap?page=${page}&limit=${PAGE_SIZE}`,
    { cache: "no-store" }
  ).then(res => res.json());

  if (!products || products.length === 0) {
    return new NextResponse(null, { status: 404 });
  }

  const urls = products
    .map(
      (p: any) => `
  <url>
    <loc>https://www.shopybucks.com/product/${p.slug}</loc>
    <lastmod>${new Date(p.updatedAt).toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
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
