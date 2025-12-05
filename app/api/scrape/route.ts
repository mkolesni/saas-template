import { NextRequest } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();

    // 1. Scrape with Firecrawl
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

    // 3. Runway Gen-4 Turbo video (exact setup from "FINAL gen-4-turbo model")
    const runwayRes = await fetch('https://api.runwayml.com/v1/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RUNWAY_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gen-4-turbo',  // Exact model from the "FINAL gen-4-turbo" setup
        prompt: `Luxury real estate tour for ${title}. Smooth cinematic pans, golden hour lighting, elegant text overlays, professional voiceover.`,
        image_url: images[0] || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c',
        audio_url: audioUrl,
        duration: 60,
        aspect_ratio: '9:16',
      }),
    });

    const videoData = await runwayRes.json();

    const videoUrl = videoData.assets?.[0]?.url || videoData.video_url || 'https://example.com/fallback.mp4';

    return Response.json({ success: true, videoUrl });
  } catch (error: any) {
    console.error('Full error:', error.message, error.stack);
    return Response.json({ error: error.message }, { status: 500 });
  }
}