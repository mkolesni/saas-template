<button
  type="button"
  disabled={loading}
  onClick={async (e) => {
    e.preventDefault();
    if (!url.trim()) return;

    const win = window.open('', '_blank');
    win?.document.write(`
      <html>
        <head><title>Generating your video...</title></head>
        <body style="background:#000;color:#fff;font-family:sans-serif;text-align:center;padding:60px;">
          <h1>Creating your luxury listing Reel...</h1>
          <p>Please wait 45–90 seconds — do not close this window.</p>
          <div style="margin:40px auto;width:60px;height:60px;border:6px solid #333;border-top:6px solid #f59e0b;border-radius:50%;animation:s 1s linear infinite;"></div>
          <style>@keyframes s{to{transform:rotate(360deg)}}</style>
        </body>
      </html>
    `);

    setLoading(true);
    try {
      const res = await fetch('/api/scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim() }),
      });
      const data = await res.json();
      win?.location.replace(data.videoUrl);
    } catch (err) {
      win?.document.write('<h2 style="color:red">Error generating video — please try again</h2>');
    } finally {
      setLoading(false);
    }
  }}
  className="w-full bg-amber-400 hover:bg-amber-500 disabled:opacity-60 text-black font-bold text-3xl py-8 rounded-2xl transition mt-8"
>
  {loading ? 'Generating in new window...' : 'Generate Video in New Window'}
</button>