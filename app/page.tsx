"use client";
import { useState } from 'react';

export default function Home() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [videoUrl, setVideoUrl] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;

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

      // If your API returns videoUrl directly (after voice + render)
      setVideoUrl(data.videoUrl || data.audioUrl || 'No video URL returned');
    } catch (err: any) {
      setError(err.message || 'Failed to generate video');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-8">
      <h1 className="text-5xl md:text-7xl font-bold text-amber-400 mb-6 text-center">
        Every listing deserves a viral Reel.<br/>Yours gets one in 58 seconds.
      </h1>
      <form onSubmit={handleSubmit} className="w-full max-w-2xl mt-12">
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Paste Zillow / Realtor Realtor.com link here..."
          className="w-full px-6 py-5 text-xl rounded-xl bg-gray-900 text-white border border-gray-700 focus:outline-none focus:border-amber-400"
          required
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading}
          className="mt-8 w-full bg-amber-400 hover:bg-amber-500 text-black font-bold text-2xl py-6 rounded-xl disabled:opacity-50"
        >
          {loading ? 'Generating your video… (30–60s)' : 'Generate Video'}
        </button>
      </form>

      {error && <p className="mt-8 text-red-400 text-xl">{error}</p>}
      {videoUrl && (
        <div className="mt-12 text-center">
          <p className="text-2xl mb-4">Your video is ready!</p>
          <video controls className="mx-auto rounded-xl shadow-2xl max-w-full" src={videoUrl} />
          <p className="mt-4 text-gray-400">Right-click → Save video as…</p>
        </div>
      )}
    </main>
  );
}
