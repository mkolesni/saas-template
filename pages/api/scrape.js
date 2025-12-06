import fetch from 'node-fetch';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  try {
    const { url } = req.body;

    // 1. Scrape with Firecrawl
    const scrape = await fetch('https://api.firecrawl.dev/v0/scrape', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.FIRECRAWL_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url }),
    }).then(r => r.json());

    const title = scrape.data.title || 'Luxury Property';
    const description = scrape.data.content || scrape.data.description || 'Stunning home';
    const image = scrape.data.images?.[0] || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c';

    // 2. Voiceover with ElevenLabs
    const voice = await fetch('https://api.elevenlabs.io/v1/text-to-speech/21m00Tcm4TlvDq8ikWAM', {
      method: 'POST',
      headers: {
        'xi-api-key': process.env.ELEVENLABS_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: `Welcome to ${title}. ${description.substring(0, 800)}. Contact the agent today!`,
      }),
    });

    const audioBlob = await voice.blob();
    const audioBuffer = Buffer.from(await audioBlob.arrayBuffer());
    const audioBase64 = audioBuffer.toString('base64');
    const audioUrl = `data:audio/mp3;base64,${audioBase64}`;

    // 3. Runway Gen-4 Turbo
    const runway = await fetch('https://api.runwayml.com/v1/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RUNWAY_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gen4_turbo',
        prompt: `Luxury real estate tour for ${title}. Smooth cinematic pans, golden hour lighting, elegant text overlays, professional voiceover.`,
        image_url: image,
        audio_url: audioUrl,
        duration: 60,
        aspect_ratio: '9:16',
      }),
    });

    const videoData = await runway.json();
    const videoUrl = videoData.assets?.[0]?.url || 'https://example.com/fallback.mp4';

    res.status(200).json({ success: true, videoUrl });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message || 'Generation failed' });
  }
}
