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
    const description = scraped.data.content?.substring(0, 600) || 'Stunning home with premium features';
    const image = scraped.data.images?.[0] || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c';

    // 2. Voiceover — ultra-luxury tone
    const voiceRes = await fetch('https://api.elevenlabs.io/v1/text-to-speech/21m00Tcm4TlvDq8ikWAM', {
      method: 'POST',
      headers: {
        'xi-api-key': process.env.ELEVENLABS_API_KEY!,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: `Welcome to ${title}. ${description} This exquisite residence offers unmatched elegance. Schedule your private tour today.`,
        voice_settings: { stability: 0.85, similarity_boost: 0.9, style: 0.3 },
      }),
    });

    const audioBlob = await voiceRes.blob();
    const audioBase64 = Buffer.from(await audioBlob.arrayBuffer()).toString('base64');
    const audioUrl = `data:audio/mp3;base64,${audioBase64}`;

    // 3. Runway — LUXURY PROMPT (this is the magic)
    const runwayRes = await fetch('https://api.runwayml.com/v1/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RUNWAY_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gen4_turbo',
        prompt: `Ultra-luxury real estate cinematic tour for ${title}. Golden hour drone shots, smooth gliding camera movements through marble interiors, crystal chandeliers sparkling, ocean views, high-end furniture, professional film look, subtle elegant text overlays with price and features, premium color grading, cinematic aspect ratio.`,
        image_url: image,
        audio_url: audioUrl,
        duration: 60,
        aspect_ratio: '9:16',
      }),
    });

    const videoData = await runwayRes.json();

    const videoUrl = videoData.assets?.[0]?.url || 'https://example.com/fallback.mp4';

    return Response.json({ success: true, videoUrl });
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}