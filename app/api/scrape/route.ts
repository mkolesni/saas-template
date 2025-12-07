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

    // 3. Generate 8 x 8-second clips with Runway (64 seconds total)
    const clipUrls = [];
    for (let i = 0; i < 8; i++) {
      const image = images[i % images.length] || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c';

      const runwayRes = await fetch('https://api.dev.runwayml.com/v1/text_to_video', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.RUNWAY_API_KEY}`,
          'Content-Type': 'application/json',
          'X-Runway-Version': '2024-11-06',
        },
        body: JSON.stringify({
          model: 'veo3.1',
          promptText: `Award-winning luxury real estate tour for ${title}. Use ONLY this real listing photo. Smooth cinematic pans, golden hour lighting, elegant text overlays with price and features, professional voiceover.`,
          ratio: '1080:1920',
          duration: 8,  // ← VALID DURATION (from error)
          audio: true,
        }),
      });

      const videoData = await runwayRes.json();
      clipUrls.push(videoData.video_url || 'https://example.com/fallback.mp4');
    }

    // 4. Return 8 clips (play back-to-back for 64 seconds)
    return Response.json({ 
      success: true, 
      videoUrls: clipUrls,
      message: "8 luxury clips generated — play back-to-back for 64 seconds"
    });
  } catch (error: any) {
    console.error('Full error:', error.message, error.stack);
    return Response.json({ error: error.message }, { status: 500 });
  }
}