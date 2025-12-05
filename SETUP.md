# 🏠 Real Estate Video Generator MVP

Complete system to turn any Zillow/Realtor/Redfin link into a viral real estate video in 60 seconds.

## 🚀 Quick Start

### 1. Installation

```bash
npm install
```

### 2. Environment Variables

Create `.env.local` in the root directory:

```env
# Firecrawl API (web scraping)
FIRECRAWL_API_KEY=your_firecrawl_api_key

# ElevenLabs API (AI voiceover)
ELEVENLABS_API_KEY=your_elevenlabs_api_key

# Pexels API (neighborhood B-roll)
PEXELS_API_KEY=your_pexels_api_key

# UploadThing (video storage & CDN)
UPLOADTHING_TOKEN=your_uploadthing_token
UPLOADTHING_SECRET=your_uploadthing_secret
```

### 3. Required System Dependencies

The video rendering requires FFmpeg:

```bash
# Ubuntu/Debian
sudo apt-get install ffmpeg

# macOS
brew install ffmpeg

# Windows
choco install ffmpeg
```

### 4. Run Dev Server

```bash
npm run dev
```

Visit `http://localhost:3000` and paste a property URL!

---

## 📋 API Endpoints

### POST `/api/scrape`
Extracts property data from any real estate listing.

**Request:**
```json
{
  "url": "https://www.zillow.com/homedetails/..."
}
```

**Response:**
```json
{
  "price": "$450,000",
  "address": "123 Main St, Denver, CO 80202",
  "beds": 3,
  "baths": 2,
  "sqft": 2500,
  "description": "Beautiful home with...",
  "photos": ["https://...", "https://...", ...]
}
```

**Supports:** Zillow, Realtor.com, Redfin, MLS sites

---

### POST `/api/voice`
Generates luxury realtor voiceover using ElevenLabs.

**Request:** (scraped property data)
```json
{
  "price": "$450,000",
  "address": "123 Main St, Denver, CO 80202",
  "beds": 3,
  "baths": 2,
  "sqft": 2500,
  "description": "...",
  "photos": [...]
}
```

**Response:**
```json
{
  "audioUrl": "data:audio/mpeg;base64,...",
  "script": "Welcome to 123 Main St..."
}
```

**Voice:** Rachel (warm female)  
**Settings:** Stability 0.7, Similarity 0.85, Style 0.4  
**Duration:** ~58 seconds

---

### POST `/api/render`
Creates a stunning 1080×1920 vertical MP4 video.

**Request:**
```json
{
  "photos": ["https://...", ...],
  "audioUrl": "data:audio/mpeg;base64,...",
  "price": "$450,000",
  "address": "123 Main St, Denver, CO 80202",
  "beds": 3,
  "baths": 2,
  "sqft": 2500
}
```

**Response:**
```json
{
  "videoUrl": "https://uploadthing.com/..."
}
```

**Video Specs:**
- **Dimensions:** 1080×1920 (vertical/portrait) - perfect for Instagram Reels, TikTok, YouTube Shorts
- **Duration:** 60 seconds
- **FPS:** 30
- **Codec:** H.264 + AAC
- **Bitrate:** 5000 kbps
- **Features:**
  - ✨ Ken Burns zoom/pan effect on every photo (8-10 sec each)
  - 📝 Large white text overlays with amber accents
  - 🎬 5-8 seconds of neighborhood B-roll from Pexels
  - 🎵 Calm luxury background (royalty-free ready)
  - 🎯 Bottom-right watermark: "Made with ListingToVideo.ai"
  - 📞 Final 5-second CTA with contact info placeholder

---

## 🎬 Complete User Flow

1. **Landing Page** (`/`)
   - User pastes property URL
   - "Analyze" button calls `/api/scrape`

2. **Results Page** (`/results`)
   - Displays scraped property details
   - Photo gallery preview
   - Step-by-step video creation UI

3. **Step 1: Generate Voiceover**
   - Calls `/api/voice`
   - ElevenLabs generates 58-second luxury script + audio
   - User can preview audio

4. **Step 2: Render Video**
   - Calls `/api/render`
   - FFmpeg processes photos + audio + B-roll
   - Renders 1080×1920 MP4 with Ken Burns effects and overlays
   - Uploads to UploadThing CDN

5. **Download & Share**
   - User downloads MP4
   - Ready for Instagram Reels, TikTok, YouTube Shorts, etc.

---

## 🛠️ Tech Stack

- **Frontend:** Next.js 15 (App Router), React 19, TailwindCSS
- **Video Rendering:** FFmpeg (server-side)
- **Text-to-Speech:** ElevenLabs API
- **Web Scraping:** Firecrawl API
- **B-roll:** Pexels API
- **Storage:** UploadThing CDN
- **Database:** Supabase (optional, for future features)

---

## 📊 Performance

- **Scraping:** 5-15 seconds (depends on website)
- **Voiceover Generation:** 10-30 seconds
- **Video Rendering:** 30-60 seconds (FFmpeg processing)
- **Upload:** 5-15 seconds (depends on internet speed)
- **Total:** ~2-3 minutes per video

---

## 🔒 Error Handling

All endpoints include comprehensive error handling:
- Invalid URLs → Clear error messages
- Missing API keys → Helpful setup instructions
- Network failures → Retry-friendly responses
- File processing errors → Detailed logs

---

## 🚀 Deployment

### Vercel
```bash
vercel deploy
```

Add environment variables in Vercel dashboard.

### Docker
```bash
docker build -t real-estate-video .
docker run -p 3000:3000 real-estate-video
```

---

## 📝 License

MIT - Use freely for commercial projects

---

## 💡 Tips

- **High-quality videos:** Upload tool-generated thumbnails to social media with descriptions
- **Bulk processing:** Save property data → Batch render later
- **Custom branding:** Add your agent logo/watermark to `/api/render`
- **Mobile-first:** 1080×1920 format is optimized for mobile viewing

---

## 🆘 Troubleshooting

**FFmpeg not found:**
```bash
which ffmpeg  # Check if installed
# If not: sudo apt install ffmpeg
```

**UploadThing upload fails:**
- Verify UPLOADTHING_TOKEN and UPLOADTHING_SECRET
- Check internet connection
- File might be too large (try reducing photo count)

**ElevenLabs API error:**
- Verify ELEVENLABS_API_KEY is valid
- Check API quota limits
- Try with a shorter script text

**Firecrawl scraping fails:**
- URL might be blocked or require authentication
- Try a different property listing
- Check FIRECRAWL_API_KEY is valid

---

Happy video making! 🎉
