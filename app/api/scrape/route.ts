// app/api/scrape/route.ts
import { NextRequest } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();
    if (!url) {
      return Response.json({ error: 'No URL provided' }, { status: 400 });
    }

    // 1. Scrape with Firecrawl
    const firecrawlRes = await fetch('https://api.firecrawl.dev/v0/scrape', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.FIRECRAWL_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url,
        pageOptions: { onlyMainContent: true },
      }),
    });

    if (!firecrawlRes.ok) throw new Error('Firecrawl failed');
    const scraped = await firecrawlRes.json();

    const { title, description, images } = scraped.data;

    // 2. Generate voiceover with ElevenLabs
    const voiceRes = await fetch('https://api.elevenlabs.io/v1/text-to-speech/21m00Tcm4TlvDq8ikWAM', {
      method: 'POST',
      headers: {
        'xi-api-key': process.env.ELEVENLABS_API_KEY!,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: `Welcome to your dream home! ${title}. ${description.slice(0, 800)} Contact the agent today!`,
        voice_settings: { stability: 0.7, similarity_boost: 0.85 },
      }),
    });

    if (!voiceRes.ok) throw new Error('Voiceover failed');
    const voiceBlob = await voiceRes.blob();
    const audioBase64 = Buffer.from(await voiceBlob.arrayBuffer()).toString('base64');
    const audioUrl = `data:audio/mp3;base64,${audioBase64}`;

    // 3. Generate video with RunwayML (fastest for MVP)
    const runwayRes = await fetch('https://api.runwayml.com/v1/generate', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RUNWAY_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gen3a_turbo',
        prompt: `Real estate listing tour video for ${title}. Luxury style, smooth camera pans, show exterior and interior using these images: ${images.slice(0, 8).join(', ')}. Professional voiceover.`,
        images: images.slice(0, 8),
        audio: audioUrl,
        duration: 60,
        aspect_ratio: '9:16',
      }),
    });

    if (!runwayRes.ok) throw new Error('Video generation failed');
    const videoData = await runwayRes.json();

    return Response.json({
      success: true,
      videoUrl: videoData.video_url,
      title,
    });

  } catch (error: any) {
    console.error('Full error:', error);
    return Response.json(
      { error: error.message || 'Something went wrong' },
      { status: 500 }
    );
  }
}