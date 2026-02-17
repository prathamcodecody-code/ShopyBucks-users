import { NextResponse } from "next/server";

export async function GET() {
  const base = "https://www.shopybucks.com";

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>${base}/sitemap-static.xml</loc>
  </sitemap>
  <sitemap>
    <loc>${base}/sitemap-categories.xml</loc>
  </sitemap>
  <sitemap>
    <loc>${base}/sitemap-products-1.xml</loc>
  </sitemap>
</sitemapindex>`;

  return new NextResponse(xml, {
    headers: { "Content-Type": "application/xml" },
  });
}
