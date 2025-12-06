import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ 
    itWorks: true,
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
  });
}
