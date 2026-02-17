import { NextRequest, NextResponse } from "next/server";

// Define the shape of params as a Promise
type Props = {
  params: Promise<{ page: string }>;
};

export async function GET(
  request: NextRequest, // Changed to NextRequest for better compatibility
  { params }: Props
) {
  // 1. Await the params object
  const { page: pageParam } = await params;
  const page = Number(pageParam);

  if (!page || page < 1) {
    return new NextResponse("Invalid page", { status: 400 });
  }

  // Example pagination
  const PAGE_SIZE = 5000;

  try {
    // 2. Fetch data
    const response = await fetch(
      `${process.env.API_URL}/products/sitemap?page=${page}&limit=${PAGE_SIZE}`,
      { cache: "no-store" }
    );

    if (!response.ok) {
        return new NextResponse("Error fetching products", { status: 500 });
    }

    const products = await response.json();

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
  } catch (error) {
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
