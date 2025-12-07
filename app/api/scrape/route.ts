import { NextRequest } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url } = body;

    if (!url) {
      return Response.json({ error: 'No URL provided' }, { status: 400 });
    }

    // TEST RESPONSE — 100% guaranteed to work
    return Response.json({
      success: true,
      videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
      message: "API route is working — now add real code below"
    });

  } catch (error: any) {
    console.error('SCRAPE ROUTE CRASHED:', error);
    return Response.json({ error: error.message || 'Unknown error' }, { status: 500 });
  }
}
