import { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();
    if (!url) return Response.json({ error: 'No URL' }, { status: 400 });

    // Test response — this will show the bunny video to confirm everything works
    return Response.json({
      success: true,
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    });
  } catch (error) {
    return Response.json({ error: 'Failed' }, { status: 500 });
  }
}