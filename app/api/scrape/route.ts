import { NextRequest } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();

    // 1. Scrape with Firecrawl
    const scrape = await fetch('https://api.firecrawl.dev/v0/scrape', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.FIRECRAWL_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url, pageOptions: { onlyMainContent: true } }),
    }).then(r => r.json());

    const { title, description, images } = scrape.data;

    // 2. Voiceover with ElevenLabs
    const voice = await fetch('https://api.elevenlabs.io/v1/text-to-speech/EXAVITQu4vr4xnSDxMaL', {
      method: 'POST',
      headers: {
        'xi-api-key': process.env.ELEVENLABS_API_KEY!,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: `Welcome to ${title}. ${description.substring(0, 800)} Call today for a private showing!`,
        voice_settings: { stability: 0.7, similarity_boost: 0.8 },
      }),
    });

    const audioBlob = await voice.blob();
    const audioBase64 = Buffer.from(await audioBlob.arrayBuffer()).toString('base64');
    const audioUrl = `data:audio/mp3;base64,${audioBase64}`;

    // 3. Video with Runway ML Gen-3 Turbo
    const runway = await fetch('https://api.runwayml.com/v1/generate', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RUNWAY_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gen-3a-turbo',
        prompt: `Luxury real estate listing tour for ${title}. Smooth cinematic pans, golden hour lighting, elegant text overlays, professional voiceover.`,
        aspect_ratio: '9:16',
        duration: 60,
        image_url: images[0],
        audio_url: audioUrl,
      }),
    }).then(r => r.json());

    return Response.json({
      success: true,
      videoUrl: runway.video_url,
    });
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}