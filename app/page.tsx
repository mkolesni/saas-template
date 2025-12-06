'use client';

import { useState } from 'react';

export default function Home() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;

    setLoading(true);

    // Open new window with loading message
    const win = window.open('', '_blank');
    win?.document.write(`
      <html>
        <head><title>Generating your luxury video...</title></head>
        <body style="background:#000;color:#fff;font-family:sans-serif;text-align:center;padding:60px;">
          <h1>Creating your luxury listing Reel...</h1>
          <p>Please wait 45–90 seconds — do not close this window.</p>
          <div style="margin:40px auto;width:60px;height:60px;border:6px solid #333;border-top:6px solid #f59e0b;border-radius:50%;animation:s 1s linear infinite;"></div>
          <style>@keyframes s{to{transform:rotate(360deg)}}</style>
        </body>
      </html>
    `);

    // Call your API
    fetch('/api/scrape', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: url.trim() }),
    })
      .then(r => r.json())
      .then(data => {
        if (data.videoUrl && data.videoUrl.includes('runwayml.com')) {
          win?.location.replace(data.videoUrl);
        } else {
          win?.document.write('<h2 style="color:#f59e0b">Video ready! Check your email shortly.</h2>');
        }
      })
      .catch(err => {
        win?.document.write('<h2 style="color:red">Error — please try again</h2>');
        console.error(err);
      })
      .finally(() => setLoading(false));
  };

  return (
    <main className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-8 text-center">
      <h1 className="text-6xl font-bold text-amber-400 mb-8">
        Every listing → Viral Reel in 58 seconds
      </h1>

      <form onSubmit={handleSubmit} className="w-full max-w-2xl space-y-8">
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://www.zillow.com/..."
          className="w-full p-6 text-xl bg-gray-900 rounded-xl border border-gray-700"
          required
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-amber-400 hover:bg-amber-500 text-black text-3xl font-bold py-8 rounded-xl disabled:opacity-60"
        >
          {loading ? 'Generating…' : 'Generate Video'}
        </button>
      </form>
    </main>
  );
}