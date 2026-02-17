import { NextResponse } from "next/server";

export async function GET() {
  const base = "https://www.shopybucks.com";

  const res = await fetch(
    "https://apiv2.shopybucks.com/categories/public",
    { cache: "no-store" }
  );

  const categories = await res.json();

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${categories
  .map(
    (c: any) => `
  <url>
    <loc>${base}/${c.slug}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>`
  )
  .join("")}
</urlset>`;

  return new NextResponse(xml, {
    headers: { "Content-Type": "application/xml" },
  });
}
