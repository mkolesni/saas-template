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
        <video controls autoplay loop muted style="width:100%;max-width:800px;border-radius:16px;margin-top:40px;">
          <source src="${data.videoUrl || ''}" type="video/mp4">
        </video>
        <p style="margin-top:20px;color:#f59e0b;font-size:24px;">
          Your luxury listing Reel is ready!
        </p>
      `);
      win?.document.close();
    } catch (err: any) {
      win?.document.open();
      win?.document.write('<h2 style="color:red">Error generating video — please try again</h2>');
      win?.document.close();
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-8 text-center">
      <h1 className="text-5xl md:text-7xl font-bold text-amber-400 mb-8 leading-tight">
        Every listing deserves a viral Reel.<br />
        Yours gets one in 58 seconds.
      </h1>

      <div className="w-full max-w-2xl space-y-10">
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Paste Zillow / Realtor.com link here..."
          className="w-full px-8 py-6 text-xl bg-gray-900 text-white border border-gray-700 rounded-2xl focus:outline-none focus:border-amber-400"
          required
          disabled={loading}
        />

        <button
          onClick={handleOpenVideo}
          disabled={loading}
          className="w-full bg-amber-400 hover:bg-amber-500 disabled:opacity-60 text-black font-black text-3xl py-8 rounded-2xl transition transform hover:scale-105"
        >
          {loading ? 'Generating in new window...' : 'Generate Video in New Window'}
        </button>
      </div>

      {/* Lemon Squeezy Checkout Button */}
      <div className="mt-20 text-center">
        <a
          href="https://YOUR-LEMON-SQUEEZY-CHECKOUT-LINK-HERE"
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