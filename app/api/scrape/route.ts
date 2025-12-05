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
    const title = scraped.data.title || 'Stunning Property';
    const description = scraped.data.content || scraped.data.description || 'Beautiful home';
    const images = scraped.data.images?.[0] || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c';

    // 2. Voiceover with ElevenLabs
    const voiceRes = await fetch('https://api.elevenlabs.io/v1/text-to-speech/21m00Tcm4TlvDq8ikWAM', {
      method: 'POST',
      headers: {
        'xi-api-key': process.env.ELEVENLABS_API_KEY!,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: `Welcome to ${title}. ${description.substring(0, 800)}. Contact the agent today for a private tour!`,
        voice_settings: { stability: 0.7, similarity_boost: 0.8 },
      }),
    });

    const audioBlob = await voiceRes.blob();
    const audioBase64 = Buffer.from(await audioBlob.arrayBuffer()).toString('base64');
    const audioUrl = `data:audio/mp3;base64,${audioBase64}`;

    // 3. Runway Gen-3 Turbo video
    const runwayRes = await fetch('https://api.runwayml.com/v1/tasks', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RUNWAY_API_KEY}`,
        'Content-Type': 'application/json',
        'X-Runway-Version': '2024-11-06',
      },
      body: JSON.stringify({
        input: {
          promptText: `Luxury real estate tour for ${title}. Smooth cinematic pans, golden hour lighting, elegant text overlays, professional voiceover.`,
          ratio: '9:16',
          duration: 60,
          image_url: images,
          audio_url: audioUrl,
          model: 'gen4_turbo',
        },
      }),
    });

    const task = await runwayRes.json();
    const videoUrl = task.output?.[0] || 'https://example.com/fallback.mp4';

    return Response.json({ success: true, videoUrl });
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}