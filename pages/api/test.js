export default function handler(req, res) {
  res.status(200).json({
    success: true,
    message: "OLD PAGES/API WORKS — VERCEL CANNOT KILL THIS",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
  });
}
