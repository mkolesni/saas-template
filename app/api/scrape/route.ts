// app/api/scrape/route.ts
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

    // 3. Generate 8-second clips with Runway (8 clips = 64 seconds)
    const clipUrls = [];
    for (let i = 0; i < 8; i++) {
      const runwayRes = await fetch('https://api.dev.runwayml.com/v1/text_to_video', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.RUNWAY_API_KEY}`,
          'Content-Type': 'application/json',
          'X-Runway-Version': '2024-11-06',
        },
        body: JSON.stringify({
          model: 'gen-4-turbo',
          promptText: `Luxury real estate tour for ${title}. Use ONLY these listing photos: ${images.slice(0, 6).join(', ')}. Smooth cinematic pans, golden hour lighting, elegant text overlays with price and features, professional voiceover.`,
          ratio: '1080:1920',
          duration: 8,
          image_url: images[i % images.length] || images[0],
          audio_url: audioUrl,
        }),
      });

      const data = await runwayRes.json();
      clipUrls.push(data.video_url || 'https://example.com/fallback.mp4');
    }

    // 4. Stitch clips into 60-second video with FFmpeg (Vercel has FFmpeg)
    const ffmpeg = require('ffmpeg-static');
    const { execSync } = require('child_process');
    const inputList = clipUrls.map((u, i) => `-i "${u}"`).join(' ');
    const filter = clipUrls.map((_, i) => `[${i}:v][${i}:a]`).join('') + `concat=n=${clipUrls.length}:v=1:a=1[outv][outa]`;
    execSync(`${ffmpeg} ${inputList} -filter_complex "${filter}" -map "[outv]" -map "[outa]" final.mp4`);

    const finalVideoUrl = 'https://yourdomain.com/final.mp4'; // Upload final.mp4 to Vercel Blob or S3

    return Response.json({ success: true, videoUrl: finalVideoUrl });
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}