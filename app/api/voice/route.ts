import { NextRequest, NextResponse } from "next/server";

interface PropertyData {
  price: string;
  address: string;
  beds: number;
  baths: number;
  sqft: number;
  description: string;
  photos: string[];
}

interface ElevenLabsResponse {
  audio_url?: string;
  error?: {
    message: string;
  };
}

function generateVoiceoverScript(property: PropertyData): string {
  const bedsText = property.beds === 1 ? "bedroom" : "bedrooms";
  const bathsText = property.baths === 1 ? "bathroom" : "bathrooms";
  const sqftFormatted = property.sqft.toLocaleString();

  // Generate a luxury realtor voiceover script optimized for 58 seconds with natural pacing
  const script = `Welcome to ${property.address}. 

This is truly a stunning property that embodies elegance and sophistication. 

Presenting a magnificent ${property.beds} ${bedsText} and ${Math.floor(property.baths)} ${bathsText} home spanning ${sqftFormatted} square feet of pure luxury living space. 

Priced at ${property.price}, this is an exceptional opportunity to own a piece of real estate excellence. Every detail has been thoughtfully curated to provide the ultimate in comfort and style.

From the spacious layout to the premium finishes throughout, this property represents the pinnacle of quality and design. 

Imagine hosting memorable gatherings in these beautifully appointed spaces, or simply enjoying the sophisticated ambiance every single day.

This is more than just a home. It's an investment in your lifestyle and your future. 

Don't miss this incredible opportunity. Schedule your private showing today and experience the luxury that truly awaits you.`;

  return script;
}

async function generateAudioWithElevenLabs(
  script: string
): Promise<string> {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) {
    throw new Error("ELEVENLABS_API_KEY environment variable is not set");
  }

  // Using Rachel voice - warm female voice (voice_id: 21m00Tcm4TlvDq8ikWAM)
  const voiceId = "21m00Tcm4TlvDq8ikWAM";

  const response = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "xi-api-key": apiKey,
      },
      body: JSON.stringify({
        text: script,
        model_id: "eleven_monolingual_v1",
        voice_settings: {
          stability: 0.7,
          similarity_boost: 0.85,
          style: 0.4,
        },
      }),
    }
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(
      `ElevenLabs API error: ${response.statusText}. ${
        error.detail ? JSON.stringify(error.detail) : ""
      }`
    );
  }

  // ElevenLabs returns the audio as binary data
  const audioBuffer = await response.arrayBuffer();

  // Convert to base64 for data URL
  const base64Audio = Buffer.from(audioBuffer).toString("base64");
  const audioUrl = `data:audio/mpeg;base64,${base64Audio}`;

  return audioUrl;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const property: PropertyData = body;

    // Validate required property fields
    if (
      !property.price ||
      !property.address ||
      !property.beds ||
      !property.baths ||
      !property.sqft
    ) {
      return NextResponse.json(
        {
          error:
            "Invalid request: property data must include price, address, beds, baths, and sqft",
        },
        { status: 400 }
      );
    }

    // Generate the luxury voiceover script
    const voiceoverScript = generateVoiceoverScript(property);

    // Generate audio with ElevenLabs
    const audioUrl = await generateAudioWithElevenLabs(voiceoverScript);

    return NextResponse.json({
      audioUrl,
      script: voiceoverScript,
    });
  } catch (error) {
    console.error("Voice API error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "An error occurred while generating the voiceover",
      },
      { status: 500 }
    );
  }
}
