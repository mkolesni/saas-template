'use client'; // ← This makes it a Client Component (fixes event handling)

import { useState } from 'react';

export default function Home() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); // Stops page reload
    console.log('Button clicked — form submitting with URL:', url); // Debug log 1

    if (!url.trim()) {
      console.log('No URL entered — aborting'); // Debug log 2
      return;
    }

    setLoading(true);
    setError('');

    try {
      console.log('Fetching /api/scrape...'); // Debug log 3
      const res = await fetch('/api/scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim() }),
      });

      console.log('Response status:', res.status); // Debug log 4

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || `HTTP ${res.status}`);
      }

      const data = await res.json();
      console.log('Success — data:', data); // Debug log 5

      // Handle video URL from response
      if (data.videoUrl) {
        // Show video (add video player here)
        alert('Video ready! URL: ' + data.videoUrl); // Temporary
      } else {
        throw new Error('No video URL in response');
      }
    } catch (err: any) {
      console.error('Full error:', err); // Log to console
      setError(err.message || 'Failed to generate video');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-8 text-center">
      <h1 className="text-5xl md:text-7xl font-bold text-amber-400 mb-8">
        Every listing deserves a viral Reel.<br />
        Yours gets one in 58 seconds.
      </h1>

      <form onSubmit={handleSubmit} className="w-full max-w-3xl space-y-8">
        <input
          type="url"
          name="propertyUrl" // Fixes form autofill warning
          id="propertyUrl" // Fixes form autofill warning
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Paste Zillow / Realtor.com link here..."
          className="w-full px-8 py-6 text-xl bg-gray-900 border border-gray-700 rounded-2xl focus:outline-none focus:border-amber-400"
          required
          disabled={loading}
        />

        <button
          type="submit" // ← Ensures it triggers onSubmit
          disabled={loading}
          className="w-full bg-amber-400 hover:bg-amber-500 text-black font-bold text-3xl py-7 rounded-2xl disabled:opacity-50 transition"
        >
          {loading ? 'Generating your video… (30–60s)' : 'Generate Video'}
        </button>
      </form>

      {error && <p className="mt-10 text-red-400 text-xl">{error}</p>}
    </main>
  );
}