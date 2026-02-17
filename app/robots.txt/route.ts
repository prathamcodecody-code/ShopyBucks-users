import { NextResponse } from "next/server";

export async function GET() {
  const text = `
User-agent: *
Allow: /

Sitemap: https://www.shopybucks.com/sitemap.xml
`;

  return new NextResponse(text, {
    headers: { "Content-Type": "text/plain" },
  });
}
