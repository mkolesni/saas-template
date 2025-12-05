'use client';

import { useState } from 'react';

export default function Home() {
  const [url, setUrl] = useState('');
 const [loading, setLoading] = useState(false);  // ← THIS WAS MISSING

 const handleOpenVideo = async (e: React.MouseEvent) => {
   e.preventDefault();
   if (!url.trim()) return;

   setLoading(true);

   const win = window.open('', '_blank');
   win?.document.write(`
     <html>
       <head><title>Generating your video...</title></head>
       <body style="background:#000;color:#fff;font-family:sans-serif;text-align:center;padding:60px;">
         <h1>Creating your luxury Reel...</h1>
         <p>Please wait 45–90 seconds — do not close</p>
         <div style="margin:40px auto;width:60px;height:60px;border:6px solid #333;border-top:6px solid #f59e0b;border-radius:50%;animation:s 1s linear infinite;"></div>
         <style>@keyframes s{to{transform:rotate(360deg)}}</style>
       </body>
     </html>
   `);

   try {
     const res = await fetch('/api/scrape', {
       method: 'POST',
       headers: { 'Content-Type': 'application/json' },
       body: JSON.stringify({ url: url.trim() }),
     });

     const data = await res.json();
     win?.location.replace(data.videoUrl || 'https://example.com/fallback.mp4');
   } catch (err) {
     win?.document.write('<h2 style="color:red">Error — please try again</h2>');
   } finally {
     setLoading(false);
   }
 };

 return (
   <main className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-8 text-center">
     <h1 className="text-6xl font-bold text-amber-400 mb-8">
       Every listing → Viral Reel in 58 seconds
     </h1>

     <div className="w-full max-w-2xl space-y-8">
       <input
         type="url"
         value={url}
         onChange={(e) => setUrl(e.target.value)}
         placeholder="Paste Zillow / Realtor.com link"
         className="w-full p-6 text-xl bg-gray-900 rounded-xl border border-gray-700"
         required
         disabled={loading}
       />

       <button
         onClick={handleOpenVideo}
         disabled={loading}
         className="w-full bg-amber-400 hover:bg-amber-500 disabled:opacity-60 text-black font-bold text-3xl py-8 rounded-xl transition"
       >
         {loading ? 'Generating in new window...' : 'Generate Video in New Window'}
       </button>
     </div>
   </main>
 );
}