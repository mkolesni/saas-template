import { NextRequest } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();

    const scrapeRes = await fetch('https://api.firecrawl.dev/v0/scrape', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.FIRECRAWL_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url }),
    });

    const scraped = await scrapeRes.json();

    const title = scraped.data.title || 'Property';
    const description = scraped.data.content || scraped.data.description || '';
    const image = scraped.data.images?.[0] || '';

    // Send to /api/generate
    const genRes = await fetch(`${request.nextUrl.origin}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, description, image }),
    });

    const genData = await genRes.json();

    return Response.json(genData);
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
