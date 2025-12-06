const runwayRes = await fetch('https://api.dev.runwayml.com/v1/text_to_video', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${process.env.RUNWAY_API_KEY}`, // Full key with `key_` prefix
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    model: 'gen-4-turbo',
    prompt: `Luxury real estate tour for ${title}. Smooth cinematic pans, golden hour lighting, elegant text overlays, professional voiceover.`,
    image_url: image,
    audio_url: audioUrl,
    duration: 60,
    aspect_ratio: '9:16',
  }),
});