import { NextRequest, NextResponse } from "next/server";
import path from "path";
import os from "os";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

// Simple UUID v4 generator
function generateUUID(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

interface RenderRequest {
  photos: string[];
  audioUrl: string;
  price: string;
  address: string;
  beds: number;
  baths: number;
  sqft: number;
}

async function downloadFile(url: string, outputPath: string): Promise<void> {
  if (url.startsWith("data:")) {
    // Handle base64 data URL
    const base64Data = url.split(",")[1];
    const fs = await import("fs");
    fs.writeFileSync(outputPath, Buffer.from(base64Data, "base64"));
  } else {
    // Handle regular URL
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to download from ${url}: ${response.statusText}`);
    }
    const buffer = await response.arrayBuffer();
    const fs = await import("fs");
    fs.writeFileSync(outputPath, Buffer.from(buffer));
  }
}

async function downloadPhotos(
  urls: string[],
  tempDir: string
): Promise<string[]> {
  const fs = await import("fs");
  const localPaths: string[] = [];

  for (let i = 0; i < Math.min(urls.length, 20); i++) {
    try {
      const localPath = path.join(tempDir, `photo-${i}.jpg`);
      await downloadFile(urls[i], localPath);
      localPaths.push(localPath);
    } catch (error) {
      console.warn(`Failed to download photo ${i}:`, error);
    }
  }

  return localPaths;
}

async function fetchPexelsBroll(cityName: string): Promise<string> {
  const pexelsApiKey = process.env.PEXELS_API_KEY;
  if (!pexelsApiKey) {
    console.warn("PEXELS_API_KEY not set, skipping B-roll");
    return "";
  }

  try {
    const response = await fetch(
      `https://api.pexels.com/videos/search?query=${encodeURIComponent(
        cityName + " neighborhood"
      )}&per_page=1`,
      {
        headers: {
          Authorization: pexelsApiKey,
        },
      }
    );

    if (!response.ok) {
      console.warn("Failed to fetch Pexels video");
      return "";
    }

    const data = (await response.json()) as {
      videos?: Array<{ video_files?: Array<{ link: string }> }>;
    };

    if (data.videos?.[0]?.video_files?.[0]) {
      return data.videos[0].video_files[0].link;
    }
  } catch (error) {
    console.warn("Error fetching Pexels B-roll:", error);
  }

  return "";
}

async function createVideoWithFFmpeg(
  photos: string[],
  audioPath: string,
  brollUrl: string,
  price: string,
  address: string,
  beds: number,
  baths: number,
  sqft: number,
  outputPath: string,
  tempDir: string
): Promise<void> {
  const fs = await import("fs");

  // Create a concat file for photo sequence
  const photoPerSecond = 8; // Each photo displays for ~8 seconds
  const concatFile = path.join(tempDir, "concat.txt");
  const filterFile = path.join(tempDir, "filters.txt");

  let concatContent = "";
  const filters: string[] = [];

  // Add photos with Ken Burns effect
  for (let i = 0; i < photos.length; i++) {
    concatContent += `file '${photos[i]}'\nduration ${photoPerSecond}\n`;
    filters.push(`[${i}]scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920[p${i}]`);
  }

  fs.writeFileSync(concatFile, concatContent);

  // Create FFmpeg command for video rendering with overlays
  const textSize = 48;
  const xPos = 100;
  const yPos = 300;

  // Build the complex filter for overlays
  let filterComplex = "";
  
  // Photo scaling and Ken Burns effect
  const photoFilters = photos
    .map((_, i) => `[${i}]scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,zoompan=z='min(zoom+0.0015,1.5)':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=${photoPerSecond * 30}:s=1080x1920[p${i}]`)
    .join(";");

  // Concatenate photos
  const concatPhotos = photos.map((_, i) => `[p${i}]`).join("");
  filterComplex = `${photoFilters};${concatPhotos}concat=n=${photos.length}:v=1:a=0[base]`;

  // Add text overlays to the base video
  const overlayFilter = `[base]drawtext=text='${price}':fontsize=${textSize}:fontcolor=white:x=${xPos}:y=${yPos}:shadowcolor=black:shadowx=2:shadowy=2:fontfile=/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf[text1];[text1]drawtext=text='${address.substring(0, 50)}':fontsize=32:fontcolor=white:x=${xPos}:y=${yPos + 80}:shadowcolor=black:shadowx=2:shadowy=2[text2];[text2]drawtext=text='${beds} Bed${beds > 1 ? "s" : ""} | ${baths} Bath${baths > 1 ? "s" : ""} | ${sqft.toLocaleString()} sqft':fontsize=28:fontcolor=amber:x=${xPos}:y=${yPos + 160}:shadowcolor=black:shadowx=2:shadowy=2[text3];[text3]drawtext=text='Made with ListingToVideo.ai':fontsize=16:fontcolor=white:x=800:y=1850:shadowcolor=black:shadowx=1:shadowy=1[final]`;

  filterComplex += `;${overlayFilter}`;

  // Build FFmpeg command
  let cmd = `ffmpeg -y`;

  // Add photo inputs
  for (const photo of photos) {
    cmd += ` -loop 1 -i "${photo}"`;
  }

  // Add audio
  cmd += ` -i "${audioPath}"`;

  // Add filter complex
  cmd += ` -filter_complex "${filterComplex.replace(/"/g, '\\"')}"`;

  // Output settings
  cmd += ` -map "[final]" -map 1:a:0 -c:v libx264 -preset fast -crf 18 -c:a aac -b:a 128k`;
  cmd += ` -t 60 -r 30 -s 1080x1920 "${outputPath}"`;

  console.log("Rendering video with FFmpeg...");
  try {
    await execAsync(cmd, { maxBuffer: 50 * 1024 * 1024 });
  } catch (error) {
    throw new Error(
      `FFmpeg rendering failed: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

async function uploadToStorage(filePath: string): Promise<string> {
  const uploadThingToken = process.env.UPLOADTHING_TOKEN;
  const uploadThingSecret = process.env.UPLOADTHING_SECRET;

  if (!uploadThingToken || !uploadThingSecret) {
    throw new Error(
      "UPLOADTHING_TOKEN and UPLOADTHING_SECRET environment variables are required"
    );
  }

  try {
    const fs = await import("fs");
    const fileBuffer = fs.readFileSync(filePath);
    const blob = new Blob([fileBuffer], { type: "video/mp4" });

    const formData = new FormData();
    formData.append("file", blob, path.basename(filePath));

    const response = await fetch("https://api.uploadthing.com/upload", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${uploadThingToken}`,
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`UploadThing upload failed: ${response.statusText}`);
    }

    const data = (await response.json()) as { url: string };
    return data.url;
  } catch (error) {
    throw new Error(
      `Upload to storage failed: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

export async function POST(request: NextRequest) {
  const tempDir = path.join(os.tmpdir(), `render-${generateUUID()}`);
  const fs = await import("fs");

  try {
    // Create temp directory
    fs.mkdirSync(tempDir, { recursive: true });

    const body = (await request.json()) as RenderRequest;
    const { photos, audioUrl, price, address, beds, baths, sqft } = body;

    if (!photos || photos.length === 0 || !audioUrl) {
      return NextResponse.json(
        { error: "Invalid request: photos and audioUrl are required" },
        { status: 400 }
      );
    }

    // Download audio
    const audioPath = path.join(tempDir, "audio.mp3");
    await downloadFile(audioUrl, audioPath);

    // Download photos locally
    const localPhotos = await downloadPhotos(photos, tempDir);
    if (localPhotos.length === 0) {
      return NextResponse.json(
        { error: "Failed to download any photos" },
        { status: 400 }
      );
    }

    // Extract city from address for B-roll search
    const cityMatch = address.match(/,\s*([A-Za-z\s]+),\s*[A-Z]{2}/);
    const city = cityMatch ? cityMatch[1].trim() : "luxury neighborhood";

    // Fetch B-roll (optional)
    const brollUrl = await fetchPexelsBroll(city);
    console.log("B-roll URL:", brollUrl || "skipped");

    // Render video
    const videoPath = path.join(tempDir, "output.mp4");
    await createVideoWithFFmpeg(
      localPhotos,
      audioPath,
      brollUrl,
      price,
      address,
      beds,
      baths,
      sqft,
      videoPath,
      tempDir
    );

    // Upload to storage
    const videoUrl = await uploadToStorage(videoPath);

    // Clean up temp directory
    fs.rmSync(tempDir, { recursive: true, force: true });

    return NextResponse.json({ videoUrl });
  } catch (error) {
    // Clean up on error
    try {
      fs.rmSync(tempDir, { recursive: true, force: true });
    } catch {
      // Ignore cleanup errors
    }

    console.error("Render API error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "An error occurred while rendering the video",
      },
      { status: 500 }
    );
  }
}
