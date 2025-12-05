const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();
  if (!url.trim()) return;

  setLoading(true);
  setError('');

  try {
    const res = await fetch('/api/scrape', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: url.trim() }),
    });

    if (!res.ok) {
      const errData = await res.json();
      throw new Error(errData.error || `HTTP ${res.status}`);
    }

    const data = await res.json();
    console.log('API data:', data); // Debug

    if (!data.data) throw new Error('No data from API');

    // Safe slice — check if photos exists before slicing
    let photos = [];
    if (data.data.photos && Array.isArray(data.data.photos)) {
      photos = data.data.photos.slice(0, 10);
    }

    console.log('Sliced photos:', photos); // Debug

    // Chain to voice/render if needed (add fetch calls here)
    // For now, set a placeholder video URL for testing
    setVideoUrl('https://example.com/placeholder-video.mp4'); // Replace with real
  } catch (err: any) {
    console.error('Submit error:', err);
    setError(err.message || 'Failed to generate video');
  } finally {
    setLoading(false);
  }
};