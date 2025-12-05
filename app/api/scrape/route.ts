import { NextRequest } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();
    if (!url) return Response.json({ error: 'No URL' }, { status: 400 });

    // 1. Scrape with Firecrawl
    const scrapeRes = await fetch('https://api.firecrawl.dev/v0/scrape', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.FIRECRAWL_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url }),
    });

    if (!scrapeRes.ok) throw new Error('Firecrawl failed');
    const scraped = await scrapeRes.json();

    const title = scraped.data.title || 'Beautiful Property';
    const description = scraped.data.content || scraped.data.description || 'Stunning home with amazing features';
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
        voice_settings: { stability: 0.7, similarity_boost: 0.8 },
      }),
    });

    const audioBlob = await voiceRes.blob();
    const audioBase64 = Buffer.from(await audioBlob.arrayBuffer()).toString('base64');
    const audioUrl = `data:audio/mp3;base64,${audioBase64}`;

    // 3. Video with Runway ML Gen-3 Turbo
    const runwayRes = await fetch('https://api.runwayml.com/v1/generate', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RUNWAY_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gen-3a-turbo',
        prompt: `Luxury real estate tour: ${title}. Smooth cinematic pans, golden hour lighting, elegant text overlays, professional voiceover.`,
        aspect_ratio: '9:16',
        duration: 60,
        image_url: images[0] || 'https://example.com/house.jpg',
        audio_url: audioUrl,
      }),
    });

    const videoData = await runwayRes.json();

    return Response.json({
      success: true,
      videoUrl: videoData.video_url || 'https://example.com/fallback.mp4',
    });
  } catch (error: any) {
    console.error('Full error:', error);
    return Response.json({ error: error.message || 'Something went wrong' }, { status: 500 });
  }
}