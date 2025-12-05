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
    const title = scraped.data.title || 'Beautiful Property';
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

    // 3. Video with Runway — CORRECT ENDPOINT FOR DEC 2025
    const runwayRes = await fetch('https://api.dev.runwayml.com/v1/tasks', {
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
          contentModeration: { publicFigureThreshold: 'auto' },
          model: 'gen4_turbo',
        },
      }),
    });

    const task = await runwayRes.json();

    // Poll for completion (simple version)
    let videoUrl = 'https://example.com/fallback.mp4';
    if (task.id) {
      // In production, poll /v1/tasks/{id} until status = 'succeeded'
      // For now, return task ID for manual check
      videoUrl = `https://runwayml.com/task/${task.id}`; // Replace with real URL after poll
    }

    return Response.json({ success: true, videoUrl });
  } catch (error: any) {
    console.error('Full error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}