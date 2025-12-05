# Video Render API Setup

## Installation

First, install the dependencies:

```bash
npm install
```

This will install Remotion and related video rendering packages.

## Environment Variables

Add the following to your `.env.local`:

```env
# ElevenLabs API (for voiceover generation)
ELEVENLABS_API_KEY=your_elevenlabs_api_key

# Firecrawl API (for web scraping)
FIRECRAWL_API_KEY=your_firecrawl_api_key

# Pexels API (for neighborhood B-roll)
PEXELS_API_KEY=your_pexels_api_key

# UploadThing (for video hosting)
UPLOADTHING_TOKEN=your_uploadthing_token
UPLOADTHING_SECRET=your_uploadthing_secret
```

## API Endpoints

### 1. Scrape Property Data
**POST** `/api/scrape`

Request:
```json
{
  "url": "https://www.zillow.com/..."
}
```

Response:
```json
{
  "price": "$450,000",
  "address": "123 Main St, Denver, CO 80202",
  "beds": 3,
  "baths": 2,
  "sqft": 2500,
  "description": "Beautiful home...",
  "photos": ["url1", "url2", ...]
}
```

### 2. Generate Voiceover
**POST** `/api/voice`

Request:
```json
{
  "price": "$450,000",
  "address": "123 Main St, Denver, CO 80202",
  "beds": 3,
  "baths": 2,
  "sqft": 2500,
  "description": "Beautiful home...",
  "photos": [...]
}
```

Response:
```json
{
  "audioUrl": "data:audio/mpeg;base64,...",
  "script": "Welcome to..."
}
```

### 3. Render Video
**POST** `/api/render`

Request:
```json
{
  "photos": ["url1", "url2", ...],
  "audioUrl": "data:audio/mpeg;base64,...",
  "price": "$450,000",
  "address": "123 Main St, Denver, CO 80202",
  "beds": 3,
  "baths": 2,
  "sqft": 2500
}
```

Response:
```json
{
  "videoUrl": "https://uploadthing.com/..."
}
```

## Video Specifications

- **Dimensions**: 1080x1920 (vertical/portrait)
- **Duration**: 60 seconds
- **Frame Rate**: 60 fps
- **Codec**: H.264
- **Audio Codec**: AAC
- **Bitrate**: 5000 kbps
- **CRF**: 18 (quality)

## Features

✅ Ken Burns effect on every photo (zoom + pan)
✅ Large white text overlays with property details
✅ 8 seconds of neighborhood B-roll from Pexels
✅ Audio from ElevenLabs voiceover
✅ Watermark: "Made with ListingToVideo.ai"
✅ Video hosted on UploadThing
✅ Proper error handling and cleanup

## Complete Flow

1. User enters property URL on homepage
2. `/api/scrape` extracts property data and images
3. `/api/voice` generates luxury voiceover audio
4. `/api/render` creates polished video with Ken Burns, overlays, B-roll
5. User receives download link to MP4 video

## Notes

- Remotion rendering can take 30-60 seconds depending on system resources
- Make sure FFmpeg is installed on your system for video rendering
- Videos are temporarily stored in the OS temp directory and cleaned up after upload
- Base64 audio URLs are supported for seamless integration between voiceover and render APIs
