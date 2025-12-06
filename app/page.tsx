'use client';

import { useState } from 'react';

export default function Home() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);

  const handleOpenVideo = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!url.trim()) return;

    setLoading(true);

    const win = window.open('', '_blank');
    win?.document.write(`
      <html>
        <head><title>Generating your luxury Reel...</title></head>
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

      win?.document.open();
      win?.document.write(`
        <pre style="white-space: pre-wrap; word-wrap: break-word; padding: 20px; background: #111; color: #0f0;">
${JSON.stringify(data, null, 2)}
        </pre>
        <video controls style="width:90%; max-width:800px; margin-top:20px;" src="${data.videoUrl || ''}"></video>
      `);
      win?.document.close();
    } catch (err: any) {
      win?.document.open();
      win?.document.write('<h2 style="color:red">JavaScript Error: ' + err.message + '</h2>');
      win?.document.close();
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
          placeholder="Paste Zillow link..."
          className="w-full p-6 text-xl bg-gray-900 rounded-xl border border-gray-700"
          required
          disabled={loading}
        />
        <button
          onClick={handleOpenVideo}
          disabled={loading}
          className="w-full bg-amber-400 hover:bg-amber-500 text-black text-3xl font-bold py-8 rounded-xl"
        >
          {loading ? 'Generating...' : 'Generate Video in New Window'}
        </button>
      </div>

      {/* LEMON SQUEEZY CHECKOUT BUTTON */}
      <div className="mt-20 text-center">
        <a
          href="https://YOUR-LEMON-SQUEEZY-CHECKOUT-LINK-HERE"   {/* ← paste your real link */}
          target="_blank"
          rel="noopener"
          className="inline-block bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 text-black font-black text-4xl px-20 py-10 rounded-3xl shadow-2xl transform hover:scale-105 transition-all"
        >
          Claim Lifetime Access – First 500 Only (pay what you want, min $599)
        </a>
        <p className="mt-6 text-3xl text-gray-300">
          Spots claimed: <span className="text-amber-400 font-bold">0 / 500</span>
        </p>
      </div>
    </main>
  );
}