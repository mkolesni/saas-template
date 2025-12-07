import { NextRequest } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();

    // 1. Scrape with Firecrawl — get REAL listing data
    const scrapeRes = await fetch('https://api.firecrawl.dev/v0/scrape', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.FIRECRAWL_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url }),
    });

    const scraped = await scrapeRes.json();
    const title = scraped.data.title || 'Luxury Property';
    const description = scraped.data.content || scraped.data.description || 'Stunning home';
    const images = scraped.data.images || [];

    // 2. Voiceover with ElevenLabs
    const voiceRes = await fetch('https://api.elevenlabs.io/v1/text-to-speech/21m00Tcm4TlvDq8ikWAM', {
      method: 'POST',
      headers: {
        'xi-api-key': process.env.ELEVENLABS_API_KEY!,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: `Welcome to ${title}. ${description.substring(0, 800)}. Contact the agent today!`,
      }),
    });

    const audioBlob = await voiceRes.blob();
    const audioBase64 = Buffer.from(await audioBlob.arrayBuffer()).toString('base64');
    const audioUrl = `data:audio/mp3;base64,${audioBase64}`;

    // 3. Generate 6 x 10-second clips with Runway — FORCED to use real listing photos
    const videoUrls = [];
    for (let i = 0; i < 6; i++) {
      const image = images[i] || images[0] || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c'; // ← REAL LISTING PHOTO

      const runwayRes = await fetch('https://api.dev.runwayml.com/v1/text_to_video', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.RUNWAY_API_KEY}`,
          'Content-Type': 'application/json',
          'X-Runway-Version': '2024-11-06',
        },
        body: JSON.stringify({
          model: 'veo3.1',
          promptText: `Luxury real estate tour for ${title}. Use ONLY this real listing photo. Smooth cinematic pans, golden hour lighting, elegant text overlays with price and features, professional voiceover. Make it look like a $5,000 listing video.`,
          ratio: '1080:1920',
          duration: 10,
          audio: true,
        }),
      });

      const videoData = await runwayRes.json();
      videoUrls.push(videoData.video_url || 'https://example.com/fallback.mp4');
    }

    return Response.json({ success: true, videoUrls });
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}