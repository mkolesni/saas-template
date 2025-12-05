export async function POST(request: Request) {
  try {
    const { text } = await request.json();

    // ← YOUR ORIGINAL ELEVENLABS CODE STARTS HERE
    const response = await fetch('https://api.elevenlabs.io/v1/text-to-speech/...',
      {
        method: 'POST',
        headers: {
          'xi-api-key': process.env.ELEVENLABS_API_KEY!,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
      }
    );
    const audioUrl = (await response.json()).audio_url;
    // ← ORIGINAL CODE ENDS HERE

    return Response.json({ audioUrl });
  } catch (error) {
    console.error('Voiceover error:', error);
    return Response.json(
      { error: 'Could not create voiceover' },
      { status: 500 }
    );
  }
}