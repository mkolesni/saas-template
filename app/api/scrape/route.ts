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
    const description = scraped.data.content || scraped.data.description || 'Stunning home';
    const images = scraped.data.images || [];
    const image = images[0] || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c';

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

    // 3. Runway — WITH X-Runway-Version + real listing photos
    const runwayRes = await fetch('https://api.dev.runwayml.com/v1/text_to_video', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RUNWAY_API_KEY}`,
        'Content-Type': 'application/json',
        'X-Runway-Version': '2024-11-06',
      },
      body: JSON.stringify({
        model: 'veo3.1',
        promptText: `Award-winning luxury real estate tour for ${title}. Use ONLY these real listing photos: ${images.slice(0, 6).join(', ')}. Flash elegant text overlays: price, beds/baths, sqft from the listing. Smooth cinematic drone pans, golden hour lighting, marble interiors sparkling, ocean views, high-end furniture, professional film look. Professional voiceover. Make it look like a $5,000 listing video — nothing else.`,
        ratio: '1080:1920',
        duration: 8,
        audio: true,
      }),
    });

    const videoData = await runwayRes.json();

    const videoUrl = videoData.video_url || 'https://example.com/fallback.mp4';

    return Response.json({ success: true, videoUrl });
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}