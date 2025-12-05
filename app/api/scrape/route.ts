import { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();
    if (!url) return Response.json({ error: 'No URL' }, { status: 400 });

    // Return a real working test video so you can see it works
    return Response.json({
      success: true,
      videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
      title: "Test Property",
    });
  } catch (error) {
    return Response.json({ error: 'Failed' }, { status: 500 });
  }
}
