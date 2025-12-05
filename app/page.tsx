'use client';

import { useState } from 'react';

export default function Home() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult('');

    try {
      const res = await fetch('/api/scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Failed');

      setResult('Video generated! Check your email in 30 seconds (or refresh)');
    } catch (err: any) {
      setResult('Error: ' + (err.message || 'Try again'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-8 text-center">
      <h1 className="text-6xl font-bold text-amber-400 mb-8">
        Listing → Viral Reel in 58 seconds
      </h1>

      <form onSubmit={handleSubmit} className="w-full max-w-2xl">
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Paste Zillow / Realtor.com link"
          className="w-full p-6 text-xl bg-gray-900 rounded-xl mb-8 border border-gray-700"
          required
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-amber-400 hover:bg-amber-500 text-black text-3xl font-bold py-8 rounded-xl disabled:opacity-50"
        >
          {loading ? 'Working… (30–60s)' : 'Generate Video'}
        </button>
      </form>

      {result && <p className="mt-12 text-2xl">{result}</p>}
    </main>
  );
}