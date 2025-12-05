'use client';

import { useState } from 'react';

export default function Home() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [videoUrl, setVideoUrl] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;

    setLoading(true);
    setError('');
    setVideoUrl('');

    try {
      const res = await fetch('/api/scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim() }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Something went wrong');

      setVideoUrl(data.videoUrl || data.audioUrl || '');
    } catch (err: any) {
      setError(err.message || 'Failed to generate video — please try again');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-8 text-center">
      <h1 className="text-5xl md:text-7xl font-bold text-amber-400 mb-6">
        Every listing deserves a viral Reel.<br />
        Yours gets one in 58 seconds.
      </h1>

      <form onSubmit={handleSubmit} className="w-full max-w-3xl mt-12">
        <input
          type="url"
          name="propertyUrl"
          id="propertyUrl"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Paste Zillow / Realtor.com link here..."
          className="w-full px-8 py-6 text-xl rounded-2xl bg-gray-900 text-white border border-gray-700 focus:outline-none focus:border-amber-400"
          required
          disabled={loading}
        />

        <button
          type="submit"
          disabled={loading}
          className="mt-10 w-full bg-amber-400 hover:bg-amber-500 text-black font-black text-3xl py-7 rounded-2xl disabled:opacity-60 transition"
        >
          {loading ? 'Generating your video… (30–60s)' : 'Generate Video'}
        </button>
      </form>

      {error && <p className="mt-10 text-red-400 text-xl">{error}</p>}

      {videoUrl && (
        <div className="mt-16 max-w-2xl">
          <p className="text-3xl mb-6">Your video is ready!</p>
          <video
            controls
            className="w-full rounded-2xl shadow-2xl"
            src={videoUrl}
          />
          <p className="mt-6 text-gray-400">
            Right-click → Save video as… or share directly
          </p>
        </div>
      )}
    </main>
  );
}