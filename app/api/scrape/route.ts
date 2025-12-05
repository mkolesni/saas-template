import { NextRequest } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();
    if (!url) return Response.json({ error: 'No URL' }, { status: 400 });

    // TEMPORARY: return a real working video so you can see it works
    // Replace this later with your real scrape → voice → render chain
    const testVideoUrl = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";

    return Response.json({
      success: true,
      videoUrl: testVideoUrl,
      message: "Video generation complete (real one coming soon)"
    });

  } catch (error: any) {
    console.error('Scrape error:', error);
    return Response.json({ error: error.message || 'Failed' }, { status: 500 });
  }
}