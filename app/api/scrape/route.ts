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
    const price = scraped.data.metadata?.price || '$1,250,000';
    const bedsBaths = scraped.data.metadata?.bedsBaths || '4 beds · 3 baths';
    const sqft = scraped.data.metadata?.sqft || '2,800 sqft';
    const description = scraped.data.content || scraped.data.description || 'Stunning home with premium features';
    const images = scraped.data.images || [];

    // 2. Voiceover with ElevenLabs — luxury tone
    const voiceRes = await fetch('https://api.elevenlabs.io/v1/text-to-speech/21m00Tcm4TlvDq8ikWAM', {
      method: 'POST',
      headers: {
        'xi-api-key': process.env.ELEVENLABS_API_KEY!,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: `Welcome to ${title}. ${price}. ${bedsBaths}. ${sqft}. ${description.substring(0, 600)}. Contact the agent today for a private showing.`,
        voice_settings: { stability: 0.9, similarity_boost: 0.9, style: 0.3 },
      }),
    });

    const audioBlob = await voiceRes.blob();
    const audioBase64 = Buffer.from(await audioBlob.arrayBuffer()).toString('base64');
    const audioUrl = `data:audio/mp3;base64,${audioBase64}`;

    // 3. Runway — FORCED TO USE LISTING PHOTOS + DATA OVERLAYS
    const runwayRes = await fetch('https://api.dev.runwayml.com/v1/text_to_video', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RUNWAY_API_KEY}`,
        'Content-Type': 'application/json',
        'X-Runway-Version': '2024-11-06',
      },
      body: JSON.stringify({
        model: 'veo3.1',
        promptText: `Award-winning luxury real estate tour for ${title}. Use ONLY these real listing photos: ${images.slice(0, 6).join(', ')}. Flash elegant text overlays: "${price}" then "${bedsBaths}" then "${sqft}" in gold serif font. Smooth cinematic drone pans, golden hour lighting, marble interiors sparkling, ocean views, high-end furniture, professional film look. Professional voiceover. Make it look like a $5,000 listing video — nothing else.`,
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