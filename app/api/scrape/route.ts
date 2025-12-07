import { NextRequest } from 'next/server';
import ffmpeg from '@ffmpeg-installer/ffmpeg';
import { execSync } from 'child_process';
import path from 'path';
import os from 'os';
import fs from 'fs';

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

    // 3. Generate 6 x 10-second clips with Runway
    const clipUrls = [];
    for (let i = 0; i < 6; i++) {
      const image = images[i] || images[0] || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c';

      const runwayRes = await fetch('https://api.dev.runwayml.com/v1/text_to_video', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.RUNWAY_API_KEY}`,
          'Content-Type': 'application/json',
          'X-Runway-Version': '2024-11-06',
        },
        body: JSON.stringify({
          model: 'veo3.1',
          promptText: `Luxury real estate tour for ${title}. Use ONLY this real listing photo. Smooth cinematic pans, golden hour lighting, elegant text overlays with price and features, professional voiceover.`,
          ratio: '1080:1920',
          duration: 10,
          audio: true,
        }),
      });

      const videoData = await runwayRes.json();
      clipUrls.push(videoData.video_url || 'https://example.com/fallback.mp4');
    }

    // 4. Stitch into ONE 60-second video with FFmpeg
    const ffmpegPath = ffmpeg.path;
    const inputList = clipUrls.map((u, i) => `-i "${u}"`).join(' ');
    const filter = clipUrls.map((_, i) => `[${i}:v][${i}:a]`).join('') + `concat=n=${clipUrls.length}:v=1:a=1[outv][outa]`;
    execSync(`${ffmpegPath} ${inputList} -filter_complex "${filter}" -map "[outv]" -map "[outa]" -c:v libx264 -c:a aac final.mp4`);

    const finalVideoUrl = 'https://yourdomain.com/final.mp4'; // Replace with real upload

    return Response.json({ success: true, videoUrl: finalVideoUrl });
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}