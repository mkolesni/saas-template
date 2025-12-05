'use client';

import { useState } from 'react';

export default function Home() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [videoUrl, setVideoUrl] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setVideoUrl('');

    try {
      const res = await fetch('/api/scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim() }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');

      // This line gets the final video URL from your API
      setVideoUrl(data.videoUrl);
    } catch (err) {
      alert('Error: ' + (err as any).message);
    } finally {
      setLoading(false);
    }
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
          placeholder="https://www.zillow.com/homedetails/..."
          className="w-full p-6 text-xl bg-gray-900 rounded-xl border border-gray-700"
          required
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-amber-400 hover:bg-amber-500 text-black text-3xl font-bold py-8 rounded-xl"
        >
          {loading ? 'Generating… (30–60s)' : 'Generate Video'}
        </button>
      </form>

      {videoUrl && (
        <div className="mt-16 max-w-3xl">
          <p className="text-4xl mb-8 text-amber-400">Your video is ready!</p>
          <video controls className="w-full rounded-2xl shadow-2xl" src={videoUrl} />
        </div>
      )}
    </main>
  );
}