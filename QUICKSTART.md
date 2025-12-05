# ⚡ Quick Start (5 minutes)

## Step 1: Install & Setup (2 minutes)

```bash
# Install dependencies
npm install

# Install FFmpeg (if not already installed)
brew install ffmpeg    # macOS
sudo apt-get install ffmpeg  # Ubuntu/Debian
```

## Step 2: Get API Keys (2 minutes)

Grab these free API keys and add to `.env.local`:

```env
# Firecrawl (web scraping) - Get at https://www.firecrawl.dev
FIRECRAWL_API_KEY=your_key

# ElevenLabs (AI voice) - Get at https://elevenlabs.io
ELEVENLABS_API_KEY=your_key

# Pexels (B-roll videos) - Get at https://www.pexels.com/api
PEXELS_API_KEY=your_key

# UploadThing (CDN hosting) - Get at https://uploadthing.com
UPLOADTHING_TOKEN=your_token
UPLOADTHING_SECRET=your_secret
```

## Step 3: Run! (1 minute)

```bash
npm run dev
```

Open `http://localhost:3000` in your browser.

---

## 🎥 Create Your First Video

1. Find a property on Zillow/Realtor/Redfin
2. Copy the URL
3. Paste into the app
4. Click "Analyze"
5. Click "Generate Voiceover"
6. Click "Render Video"
7. Download MP4
8. Share on Instagram Reels/TikTok! 🎉

---

## 📁 Key Files

| File | Purpose |
|------|---------|
| `app/page.tsx` | Landing page |
| `app/results/page.tsx` | Video creation UI |
| `app/api/scrape/route.ts` | Extract property data |
| `app/api/voice/route.ts` | Generate voiceover |
| `app/api/render/route.ts` | Create & upload video |

---

## ✅ You Have Everything!

- ✨ 3 API routes (Scrape, Voice, Render)
- 🎨 2 beautiful pages (Home, Results)
- 🔧 Full error handling
- 📱 Mobile-responsive UI
- 🎬 Production-ready video output

---

## 🚀 Next: Deploy to Production

```bash
vercel deploy
```

---

**That's it! You have a working MVP that turns property URLs into viral videos. 🎉**

Questions? See `SETUP.md` or `MVP_COMPLETE.md` for details.
